import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role, RoundBuyType, RoundHighlight, Side } from "@/types/domain";
import type { AnalyticsMatchInput, AnalyticsRoundInput } from "./types";

/**
 * Fetch the raw match + round rows needed to run the analytics pipeline for a
 * single user. We cap at `matchLimit` (default 100) matches to keep the round
 * query reasonable — that's enough history to drive every current insight rule.
 */
export async function loadAnalyticsInputs(
  supabase: SupabaseClient,
  userId: string,
  matchLimit = 100,
): Promise<{ matches: AnalyticsMatchInput[]; rounds: AnalyticsRoundInput[] }> {
  const { data: matchRows, error: matchErr } = await supabase
    .from("matches")
    .select(
      "id, started_at, queue, map_name, agent_name, role, won, score_for, score_against, kills, deaths, assists, headshot_percent, adr, acs, first_bloods, duration_minutes",
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(matchLimit);

  if (matchErr) throw matchErr;

  const matches: AnalyticsMatchInput[] = (matchRows ?? []).map((row) => ({
    id: row.id,
    playedAtIso: row.started_at,
    queue: row.queue,
    map: row.map_name,
    agent: row.agent_name,
    role: (row.role ?? "duelist") as Role,
    won: row.won,
    scoreFor: row.score_for,
    scoreAgainst: row.score_against,
    kills: row.kills,
    deaths: row.deaths,
    assists: row.assists,
    headshotPercent: Number(row.headshot_percent ?? 0),
    adr: Number(row.adr ?? 0),
    acs: row.acs ?? 0,
    firstBloods: row.first_bloods ?? 0,
    durationMinutes: row.duration_minutes ?? undefined,
  }));

  if (matches.length === 0) return { matches, rounds: [] };

  const matchIds = matches.map((m) => m.id);
  const { data: roundRows, error: roundErr } = await supabase
    .from("match_round_summaries")
    .select("match_id, round_number, won, side, buy_type, kills, deaths, first_blood, first_death, clutch, highlight")
    .in("match_id", matchIds);

  if (roundErr) throw roundErr;

  const rounds: AnalyticsRoundInput[] = (roundRows ?? []).map((row) => ({
    matchId: row.match_id,
    roundNumber: row.round_number,
    won: row.won,
    side: row.side as Side,
    buyType: (row.buy_type ?? undefined) as RoundBuyType | undefined,
    kills: row.kills,
    deaths: row.deaths,
    firstBlood: row.first_blood,
    firstDeath: row.first_death,
    clutch: row.clutch,
    highlight: (row.highlight ?? undefined) as RoundHighlight | undefined,
  }));

  return { matches, rounds };
}
