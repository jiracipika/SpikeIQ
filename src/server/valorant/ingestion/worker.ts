import { createHash } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";
import { computeMatchRating } from "../metrics/match-rating";
import { generateMatchInsights } from "../insights/generate";
import { normalizeMatchForUser } from "../transform/normalize-match";
import { MatchlistEntry, ValorantMatchProvider } from "../provider/types";
import {
  claimJobs,
  completeJob,
  computeRetryDelaySeconds,
  enqueueJob,
  FetchMatchPayload,
  FetchMatchlistPayload,
  RecomputeMetricsPayload,
  SyncBackfillSeedPayload,
  SyncRecentPayload,
  TransformMatchPayload,
  ValorantIngestionJob,
  ValorantJobType,
} from "./jobs";

export interface ValorantWorkerOptions {
  workerId: string;
  maxJobs?: number;
}

const BACKFILL_MATCHLIST_PAGE_SIZE = 20;
const BACKFILL_MATCHLIST_MAX_PAGES = 15;

export class ValorantIngestionWorker {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly provider: ValorantMatchProvider,
  ) {}

  async runOnce(options: ValorantWorkerOptions): Promise<{ claimed: number; completed: number; failed: number }> {
    const jobs = await claimJobs(this.supabase, options.workerId, options.maxJobs ?? 10);

    let completed = 0;
    let failed = 0;

    for (const job of jobs) {
      try {
        await this.processJob(job);
        await completeJob(this.supabase, {
          jobId: job.id,
          success: true,
        });
        completed += 1;
      } catch (error) {
        const errorText = error instanceof Error ? error.message : String(error);
        await completeJob(this.supabase, {
          jobId: job.id,
          success: false,
          error: errorText,
          retryDelaySeconds: computeRetryDelaySeconds(job.attempts),
        });
        failed += 1;
      }
    }

    return {
      claimed: jobs.length,
      completed,
      failed,
    };
  }

  private async processJob(job: ValorantIngestionJob): Promise<void> {
    switch (job.job_type as ValorantJobType) {
      case "sync_backfill_seed":
        await this.handleSyncBackfillSeed(job.payload as SyncBackfillSeedPayload);
        return;
      case "sync_recent":
        await this.handleSyncRecent(job.payload as SyncRecentPayload);
        return;
      case "fetch_matchlist":
        await this.handleFetchMatchlist(job.payload as FetchMatchlistPayload);
        return;
      case "fetch_match":
        await this.handleFetchMatch(job.payload as FetchMatchPayload);
        return;
      case "transform_match":
        await this.handleTransformMatch(job.payload as TransformMatchPayload);
        return;
      case "recompute_metrics":
        await this.handleRecomputeMetrics(job.payload as RecomputeMetricsPayload);
        return;
      default:
        throw new Error(`Unknown ingestion job type: ${job.job_type}`);
    }
  }

  private async handleSyncBackfillSeed(payload: SyncBackfillSeedPayload): Promise<void> {
    await this.updateSyncState(payload.userId, {
      phase: "backfill",
      backfill_status: "running",
      last_error: null,
    });

    await enqueueJob(this.supabase, {
      jobType: "fetch_matchlist",
      payload: {
        userId: payload.userId,
        region: payload.region,
        puuid: payload.puuid,
        mode: "backfill",
      },
      dedupeKey: `matchlist:${payload.userId}:backfill`,
      priority: 20,
    });
  }

  private async handleSyncRecent(payload: SyncRecentPayload): Promise<void> {
    await this.updateSyncState(payload.userId, {
      phase: "refresh",
      last_error: null,
    });

    await enqueueJob(this.supabase, {
      jobType: "fetch_matchlist",
      payload: {
        userId: payload.userId,
        region: payload.region,
        puuid: payload.puuid,
        mode: "recent",
      },
      dedupeKey: `matchlist:${payload.userId}:recent`,
      priority: 30,
    });
  }

  private async handleFetchMatchlist(payload: FetchMatchlistPayload): Promise<void> {
    const history =
      payload.mode === "backfill"
        ? await this.fetchBackfillHistory(payload.region, payload.puuid)
        : (await this.provider.getMatchlist(payload.region, payload.puuid)).history;

    const known = await this.fetchKnownMatchIds(
      payload.userId,
      history.map((entry) => entry.matchId),
    );

    const unknownMatchIds = history.map((entry) => entry.matchId).filter((matchId) => !known.has(matchId));

    for (const matchId of unknownMatchIds) {
      await enqueueJob(this.supabase, {
        jobType: "fetch_match",
        payload: {
          userId: payload.userId,
          region: payload.region,
          puuid: payload.puuid,
          matchId,
        },
        dedupeKey: `fetch:${payload.userId}:${matchId}`,
        priority: payload.mode === "recent" ? 40 : 60,
      });
    }

    const highestStart = Math.max(
      0,
      ...history.map((entry) => Number(entry.gameStartTimeMillis ?? 0)),
    );

    await this.updateSyncState(payload.userId, {
      high_watermark_start_ms: highestStart || null,
      last_match_id_seen: history[0]?.matchId ?? null,
      last_synced_at: new Date().toISOString(),
      ...(payload.mode === "backfill"
        ? {
            phase: "backfill",
            backfill_status: "running",
          }
        : {
            phase: "idle",
            last_refresh_at: new Date().toISOString(),
          }),
    });

    if (payload.mode === "backfill") {
      await this.maybeFinalizeBackfill(payload.userId);
    }
  }

  private async handleFetchMatch(payload: FetchMatchPayload): Promise<void> {
    const raw = await this.provider.getMatch(payload.region, payload.matchId);
    const payloadHash = createHash("sha256").update(JSON.stringify(raw)).digest("hex");

    const { error } = await this.supabase.from("valorant_raw_matches").upsert(
      {
        owner_user_id: payload.userId,
        match_id: payload.matchId,
        region: payload.region,
        payload_jsonb: raw,
        payload_hash: payloadHash,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "owner_user_id,match_id" },
    );

    if (error) {
      throw new Error(`Failed storing raw match ${payload.matchId}: ${error.message}`);
    }

    await enqueueJob(this.supabase, {
      jobType: "transform_match",
      payload: {
        userId: payload.userId,
        region: payload.region,
        puuid: payload.puuid,
        matchId: payload.matchId,
      },
      dedupeKey: `transform:${payload.userId}:${payload.matchId}`,
      priority: 70,
    });
  }

  private async handleTransformMatch(payload: TransformMatchPayload): Promise<void> {
    const { data, error } = await this.supabase
      .from("valorant_raw_matches")
      .select("payload_jsonb")
      .eq("owner_user_id", payload.userId)
      .eq("match_id", payload.matchId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed loading raw payload for ${payload.matchId}: ${error.message}`);
    }

    if (!data?.payload_jsonb) {
      throw new Error(`Raw payload missing for ${payload.matchId}`);
    }

    const normalized = normalizeMatchForUser({
      ownerUserId: payload.userId,
      region: payload.region,
      puuid: payload.puuid,
      raw: data.payload_jsonb,
    });

    const upsertMatch = await this.supabase.from("valorant_user_matches").upsert(normalized.match, {
      onConflict: "owner_user_id,match_id",
    });

    if (upsertMatch.error) {
      throw new Error(`Failed upserting match ${payload.matchId}: ${upsertMatch.error.message}`);
    }

    if (normalized.rounds.length > 0) {
      const upsertRounds = await this.supabase.from("valorant_user_rounds").upsert(normalized.rounds, {
        onConflict: "owner_user_id,match_id,round_num",
      });

      if (upsertRounds.error) {
        throw new Error(`Failed upserting rounds for ${payload.matchId}: ${upsertRounds.error.message}`);
      }
    }

    const upsertAggregate = await this.supabase.from("valorant_user_match_aggregates").upsert(
      {
        owner_user_id: payload.userId,
        match_id: payload.matchId,
        pipeline_version: "v1",
        feature_vector: normalized.featureVector,
        computed_at: new Date().toISOString(),
      },
      { onConflict: "owner_user_id,match_id" },
    );

    if (upsertAggregate.error) {
      throw new Error(`Failed upserting aggregate for ${payload.matchId}: ${upsertAggregate.error.message}`);
    }

    const insights = generateMatchInsights(normalized);
    const { error: deleteInsightsError } = await this.supabase
      .from("valorant_user_insights")
      .delete()
      .eq("owner_user_id", payload.userId)
      .eq("match_id", payload.matchId);

    if (deleteInsightsError) {
      throw new Error(`Failed clearing old insights for ${payload.matchId}: ${deleteInsightsError.message}`);
    }

    if (insights.length > 0) {
      const insertInsights = await this.supabase.from("valorant_user_insights").insert(insights);
      if (insertInsights.error) {
        throw new Error(`Failed inserting insights for ${payload.matchId}: ${insertInsights.error.message}`);
      }
    }

    await enqueueJob(this.supabase, {
      jobType: "recompute_metrics",
      payload: {
        userId: payload.userId,
        matchId: payload.matchId,
      },
      dedupeKey: `metrics:${payload.userId}:${payload.matchId}`,
      priority: 80,
    });
  }

  private async handleRecomputeMetrics(payload: RecomputeMetricsPayload): Promise<void> {
    const { data: rounds, error: roundsError } = await this.supabase
      .from("valorant_user_rounds")
      .select("round_rating, first_kill, first_death, trade_kill, traded_death, plant, defuse, round_won")
      .eq("owner_user_id", payload.userId)
      .eq("match_id", payload.matchId)
      .order("round_num", { ascending: true });

    if (roundsError) {
      throw new Error(`Failed loading rounds for ${payload.matchId}: ${roundsError.message}`);
    }

    const ratings = (rounds ?? []).map((entry) => Number(entry.round_rating ?? 0));
    const summary = computeMatchRating(ratings);
    const firstKills = (rounds ?? []).filter((r) => r.first_kill).length;
    const firstDeaths = (rounds ?? []).filter((r) => r.first_death).length;
    const tradeKills = (rounds ?? []).filter((r) => r.trade_kill).length;
    const tradedDeaths = (rounds ?? []).filter((r) => r.traded_death).length;
    const plants = (rounds ?? []).filter((r) => r.plant).length;
    const defuses = (rounds ?? []).filter((r) => r.defuse).length;
    const roundsWon = (rounds ?? []).filter((r) => r.round_won).length;

    const { error: updateMatchError } = await this.supabase
      .from("valorant_user_matches")
      .update({
        avg_round_rating: summary.avgRoundRating,
        consistency_score: summary.consistencyScore,
        match_rating: summary.matchRating,
        first_kills: firstKills,
        first_deaths: firstDeaths,
        trade_kills: tradeKills,
        traded_deaths: tradedDeaths,
        plants,
        defuses,
        rounds_played: rounds?.length ?? 0,
        rounds_won: roundsWon,
      })
      .eq("owner_user_id", payload.userId)
      .eq("match_id", payload.matchId);

    if (updateMatchError) {
      throw new Error(`Failed updating match metrics for ${payload.matchId}: ${updateMatchError.message}`);
    }

    const { data: match, error: matchError } = await this.supabase
      .from("valorant_user_matches")
      .select("game_start_at")
      .eq("owner_user_id", payload.userId)
      .eq("match_id", payload.matchId)
      .maybeSingle();

    if (matchError) {
      throw new Error(`Failed reading match date for ${payload.matchId}: ${matchError.message}`);
    }

    if (match?.game_start_at) {
      await this.recomputeDailyAggregate(payload.userId, match.game_start_at);
    }

    await this.maybeFinalizeBackfill(payload.userId);
  }

  private async recomputeDailyAggregate(userId: string, matchStartAtIso: string): Promise<void> {
    const day = new Date(matchStartAtIso);
    const dayStart = new Date(day);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const { data: dayMatches, error } = await this.supabase
      .from("valorant_user_matches")
      .select(
        "kills, deaths, first_kills, first_deaths, trade_kills, traded_deaths, plants, defuses, rounds_played, avg_round_rating, match_rating, game_start_at",
      )
      .eq("owner_user_id", userId)
      .gte("game_start_at", dayStart.toISOString())
      .lt("game_start_at", dayEnd.toISOString());

    if (error) {
      throw new Error(`Failed to load day matches for aggregate: ${error.message}`);
    }

    const matches = dayMatches ?? [];
    const totalKills = sum(matches.map((m) => asNumber(m.kills)));
    const totalDeaths = sum(matches.map((m) => asNumber(m.deaths)));
    const totalRounds = sum(matches.map((m) => asNumber(m.rounds_played)));
    const totalFirstKills = sum(matches.map((m) => asNumber(m.first_kills)));
    const totalFirstDeaths = sum(matches.map((m) => asNumber(m.first_deaths)));
    const totalTrades = sum(matches.map((m) => asNumber(m.trade_kills) + asNumber(m.traded_deaths)));
    const totalObjective = sum(matches.map((m) => asNumber(m.plants) + asNumber(m.defuses)));
    const avgRoundRating = average(matches.map((m) => asNumber(m.avg_round_rating)));
    const avgMatchRating = average(matches.map((m) => asNumber(m.match_rating)));

    const payload = {
      owner_user_id: userId,
      metric_date: dayStart.toISOString().slice(0, 10),
      matches_played: matches.length,
      rounds_played: totalRounds,
      avg_round_rating: round3(avgRoundRating),
      avg_match_rating: round3(avgMatchRating),
      kd_ratio: round3(ratio(totalKills, Math.max(1, totalDeaths))),
      first_duel_win_rate: round3(ratio(totalFirstKills, Math.max(1, totalFirstKills + totalFirstDeaths))),
      trade_participation_rate: round3(ratio(totalTrades, Math.max(1, totalRounds))),
      objective_participation_rate: round3(ratio(totalObjective, Math.max(1, totalRounds))),
    };

    const { error: upsertError } = await this.supabase
      .from("valorant_user_daily_aggregates")
      .upsert(payload, { onConflict: "owner_user_id,metric_date" });

    if (upsertError) {
      throw new Error(`Failed upserting daily aggregate: ${upsertError.message}`);
    }
  }

  private async fetchKnownMatchIds(userId: string, candidateMatchIds: string[]): Promise<Set<string>> {
    if (candidateMatchIds.length === 0) {
      return new Set<string>();
    }

    const { data, error } = await this.supabase
      .from("valorant_user_matches")
      .select("match_id")
      .eq("owner_user_id", userId)
      .in("match_id", candidateMatchIds);

    if (error) {
      throw new Error(`Failed loading known matches: ${error.message}`);
    }

    return new Set((data ?? []).map((entry) => String(entry.match_id)));
  }

  private async fetchBackfillHistory(region: FetchMatchlistPayload["region"], puuid: string): Promise<MatchlistEntry[]> {
    const seen = new Set<string>();
    const history: MatchlistEntry[] = [];

    for (let page = 0; page < BACKFILL_MATCHLIST_MAX_PAGES; page += 1) {
      const startIndex = page * BACKFILL_MATCHLIST_PAGE_SIZE;
      const endIndex = startIndex + BACKFILL_MATCHLIST_PAGE_SIZE - 1;
      const response = await this.provider.getMatchlist(region, puuid, {
        startIndex,
        endIndex,
      });

      const batch = response.history ?? [];
      if (batch.length === 0) {
        break;
      }

      let addedCount = 0;
      for (const entry of batch) {
        if (!seen.has(entry.matchId)) {
          seen.add(entry.matchId);
          history.push(entry);
          addedCount += 1;
        }
      }

      if (batch.length < BACKFILL_MATCHLIST_PAGE_SIZE || addedCount === 0) {
        break;
      }
    }

    return history;
  }

  private async maybeFinalizeBackfill(userId: string): Promise<void> {
    const { data: syncState, error: syncStateError } = await this.supabase
      .from("valorant_sync_state")
      .select("phase, backfill_status")
      .eq("user_id", userId)
      .maybeSingle();

    if (syncStateError) {
      throw new Error(`Failed loading sync state for backfill completion check: ${syncStateError.message}`);
    }

    if (!syncState || syncState.phase !== "backfill") {
      return;
    }

    const { count, error: pendingError } = await this.supabase
      .from("valorant_ingestion_jobs")
      .select("id", { count: "exact", head: true })
      .in("status", ["queued", "running"])
      .in("job_type", ["fetch_match", "transform_match", "recompute_metrics"])
      .contains("payload", { userId });

    if (pendingError) {
      throw new Error(`Failed checking pending backfill jobs: ${pendingError.message}`);
    }

    if ((count ?? 0) > 0) {
      return;
    }

    await this.updateSyncState(userId, {
      phase: "idle",
      backfill_status: "completed",
      last_backfill_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
      last_error: null,
    });
  }

  private async updateSyncState(
    userId: string,
    patch: Record<string, string | number | null>,
  ): Promise<void> {
    const payload = {
      user_id: userId,
      ...patch,
    };

    const { error } = await this.supabase.from("valorant_sync_state").upsert(payload, {
      onConflict: "user_id",
    });

    if (error) {
      throw new Error(`Failed updating sync state: ${error.message}`);
    }
  }
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return numerator / denominator;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
