import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { loadAnalyticsInputs } from "@/lib/analytics/supabase-loader";
import { runAnalytics } from "@/lib/analytics";
import { persistAnalytics } from "@/lib/analytics/persist";
import { mockMatches } from "@/lib/mocks/matches";
import {
  getRiotConfig,
  isDevSelfTestEnabled,
  isMockMode,
  isSupportedRegion,
  type RiotRegion,
} from "@/lib/riot/config";
import type { Role, RoundBuyType, RoundHighlight, Side, ValorantMatch } from "@/types/domain";

type QueueType = "competitive" | "unrated" | "premier";

interface LinkedRiotAccountRow {
  riot_puuid: string;
  region: RiotRegion;
  is_verified: boolean;
}

interface MatchInsertRow {
  user_id: string;
  external_match_id: string;
  map_name: string;
  mode: string;
  queue: QueueType;
  agent_name: string;
  role: Role;
  started_at: string;
  duration_minutes: number | null;
  won: boolean;
  score_for: number;
  score_against: number;
  kills: number;
  deaths: number;
  assists: number;
  headshot_percent: number;
  adr: number;
  acs: number;
  first_bloods: number;
  plants: number;
  defuses: number;
  econ_rating: number;
  created_at: string;
}

interface RoundInsertRow {
  match_id: string;
  user_id: string;
  round_number: number;
  won: boolean;
  side: Side;
  buy_type: RoundBuyType | null;
  kills: number;
  deaths: number;
  assists: number;
  first_blood: boolean;
  first_death: boolean;
  clutch: boolean;
  highlight: RoundHighlight | null;
}

interface ParsedMatchRecord {
  match: MatchInsertRow;
  rounds: Omit<RoundInsertRow, "match_id" | "user_id">[];
}

export interface RiotSyncResult {
  mode: "mock" | "real";
  fetched: number;
  inserted: number;
  updated: number;
  analyzed: number;
}

interface SyncInternalParams {
  supabase: SupabaseClient;
  userId: string;
  puuid: string;
  region: RiotRegion;
  limit: number;
  forceLive: boolean;
}

const AGENT_ROLE: Record<string, Role> = {
  Astra: "controller",
  Breach: "initiator",
  Brimstone: "controller",
  Chamber: "sentinel",
  Clove: "controller",
  Cypher: "sentinel",
  Deadlock: "sentinel",
  Fade: "initiator",
  Gekko: "initiator",
  Harbor: "controller",
  Iso: "duelist",
  Jett: "duelist",
  KAYO: "initiator",
  "KAY/O": "initiator",
  Killjoy: "sentinel",
  Neon: "duelist",
  Omen: "controller",
  Phoenix: "duelist",
  Raze: "duelist",
  Reyna: "duelist",
  Sage: "sentinel",
  Skye: "initiator",
  Sova: "initiator",
  Tejo: "initiator",
  Viper: "controller",
  Vyse: "sentinel",
  Waylay: "duelist",
  Yoru: "duelist",
};

export async function syncLatestRiotMatches(params?: { limit?: number }): Promise<RiotSyncResult> {
  const limit = Math.max(1, Math.min(params?.limit ?? 20, 40));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("unauthenticated");
  }

  const { data: linked, error: linkedErr } = await supabase
    .from("connected_riot_accounts")
    .select("riot_puuid, region, is_verified")
    .eq("user_id", user.id)
    .maybeSingle<LinkedRiotAccountRow>();
  if (linkedErr) throw linkedErr;
  if (!linked || !linked.is_verified) {
    throw new Error("riot_not_connected");
  }

  return syncLatestRiotMatchesForIdentity({
    supabase,
    userId: user.id,
    puuid: linked.riot_puuid,
    region: linked.region,
    limit,
    forceLive: false,
  });
}

export async function syncLatestRiotMatchesForRiotId(params: {
  gameName: string;
  tagLine: string;
  region: RiotRegion;
  limit?: number;
}): Promise<RiotSyncResult & { puuid: string }> {
  if (!isDevSelfTestEnabled()) {
    throw new Error("self_test_disabled");
  }

  const gameName = params.gameName.trim();
  const tagLine = params.tagLine.replace(/^#/, "").trim();
  if (!gameName || !tagLine) {
    throw new Error("invalid_riot_id");
  }

  const limit = Math.max(1, Math.min(params.limit ?? 20, 40));
  const region: RiotRegion = isSupportedRegion(params.region) ? params.region : "NA";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("unauthenticated");
  }

  const puuid = await fetchPuuidByRiotId({ gameName, tagLine, region });
  const result = await syncLatestRiotMatchesForIdentity({
    supabase,
    userId: user.id,
    puuid,
    region,
    limit,
    forceLive: true,
  });

  return {
    ...result,
    puuid,
  };
}

async function syncLatestRiotMatchesForIdentity(params: SyncInternalParams): Promise<RiotSyncResult> {
  const useMock = !params.forceLive && isMockMode();
  const parsedRecords = useMock
    ? buildMockMatchRecords(params.userId, params.limit)
    : await fetchAndParseRealMatchRecords({
        userId: params.userId,
        puuid: params.puuid,
        region: params.region,
        limit: params.limit,
      });

  const persisted = await persistRiotMatches(params.supabase, params.userId, parsedRecords);

  const { matches, rounds } = await loadAnalyticsInputs(params.supabase, params.userId);
  const snapshot = runAnalytics(matches, rounds);
  if (matches.length > 0) {
    await persistAnalytics(params.supabase, params.userId, snapshot);
  }

  return {
    mode: useMock ? "mock" : "real",
    fetched: parsedRecords.length,
    inserted: persisted.inserted,
    updated: persisted.updated,
    analyzed: matches.length,
  };
}

function buildMockMatchRecords(userId: string, limit: number): ParsedMatchRecord[] {
  const now = new Date().toISOString();
  return mockMatches.slice(0, limit).map((match) => {
    const [forScore, againstScore] = parseScoreline(match.scoreline);
    return {
      match: {
        user_id: userId,
        external_match_id: `mock_${match.id}`,
        map_name: match.map,
        mode: "competitive",
        queue: match.queue,
        agent_name: match.agent,
        role: match.role,
        started_at: match.playedAtIso,
        duration_minutes: match.durationMinutes ?? null,
        won: match.result === "win",
        score_for: forScore,
        score_against: againstScore,
        kills: match.kda.kills,
        deaths: match.kda.deaths,
        assists: match.kda.assists,
        headshot_percent: round(match.hsPercentage, 2),
        adr: round(match.performance.combatScore * 0.34, 2),
        acs: match.performance.combatScore,
        first_bloods: match.performance.firstBloods,
        plants: match.performance.plants,
        defuses: match.performance.defuses,
        econ_rating: match.performance.econRating,
        created_at: now,
      },
      rounds: (match.rounds ?? []).map((roundRow) => ({
        round_number: roundRow.roundNumber,
        won: roundRow.winner === "player",
        side: roundRow.side,
        buy_type: roundRow.buyType,
        kills: roundRow.playerKills,
        deaths: roundRow.playerDied ? 1 : 0,
        assists: 0,
        first_blood: roundRow.highlight === "first-blood",
        first_death: roundRow.playerDied && roundRow.playerKills === 0,
        clutch: roundRow.highlight === "clutch",
        highlight: roundRow.highlight ?? null,
      })),
    };
  });
}

async function fetchAndParseRealMatchRecords(params: {
  userId: string;
  puuid: string;
  region: RiotRegion;
  limit: number;
}): Promise<ParsedMatchRecord[]> {
  const matchIds = await fetchCompetitiveMatchIds(params.puuid, params.region, params.limit);
  const records: ParsedMatchRecord[] = [];

  for (const matchId of matchIds) {
    const raw = await fetchMatchDetail(matchId, params.region);
    const parsed = parseRealMatch(raw, {
      userId: params.userId,
      puuid: params.puuid,
      externalMatchId: matchId,
    });
    if (parsed) records.push(parsed);
  }

  return records;
}

async function fetchCompetitiveMatchIds(
  puuid: string,
  region: RiotRegion,
  limit: number,
): Promise<string[]> {
  const cfg = getRiotConfig();
  const token = process.env.RIOT_API_KEY;
  if (!token) {
    throw new Error("missing_riot_api_key");
  }

  const url = new URL(`${cfg.accountApiBase(region)}/val/match/v1/matchlists/by-puuid/${encodeURIComponent(puuid)}`);
  url.searchParams.set("startIndex", "0");
  url.searchParams.set("endIndex", String(limit));
  url.searchParams.set("queue", "competitive");

  const res = await fetch(url, {
    headers: { "X-Riot-Token": token },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`riot_matchlist_failed_${res.status}:${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as { history?: Array<{ matchId?: string }> };
  return (json.history ?? []).map((h) => h.matchId).filter((id): id is string => Boolean(id));
}

async function fetchPuuidByRiotId(params: {
  gameName: string;
  tagLine: string;
  region: RiotRegion;
}): Promise<string> {
  const cfg = getRiotConfig();
  const token = process.env.RIOT_API_KEY;
  if (!token) {
    throw new Error("missing_riot_api_key");
  }

  const path = `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(params.gameName)}/${encodeURIComponent(
    params.tagLine,
  )}`;
  const res = await fetch(`${cfg.accountApiBase(params.region)}${path}`, {
    headers: { "X-Riot-Token": token },
    cache: "no-store",
  });

  if (res.status === 404) {
    throw new Error("riot_id_not_found");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`riot_account_lookup_failed_${res.status}:${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as { puuid?: string };
  if (!json.puuid) {
    throw new Error("riot_id_not_found");
  }
  return json.puuid;
}

async function fetchMatchDetail(matchId: string, region: RiotRegion): Promise<unknown> {
  const cfg = getRiotConfig();
  const token = process.env.RIOT_API_KEY;
  if (!token) {
    throw new Error("missing_riot_api_key");
  }

  const res = await fetch(`${cfg.accountApiBase(region)}/val/match/v1/matches/${encodeURIComponent(matchId)}`, {
    headers: { "X-Riot-Token": token },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`riot_match_failed_${res.status}:${text.slice(0, 200)}`);
  }
  return res.json();
}

function parseRealMatch(
  raw: unknown,
  context: { userId: string; puuid: string; externalMatchId: string },
): ParsedMatchRecord | null {
  if (!raw || typeof raw !== "object") return null;

  const matchInfo = safeObj((raw as Record<string, unknown>).matchInfo);
  const players = safeArr((raw as Record<string, unknown>).players);
  const teams = safeArr((raw as Record<string, unknown>).teams);
  const roundResults = safeArr((raw as Record<string, unknown>).roundResults);

  const player = players.find((p) => safeStr(safeObj(p).puuid) === context.puuid);
  if (!player) return null;

  const playerObj = safeObj(player);
  const playerStats = safeObj(playerObj.stats);
  const playerTeamId = safeStr(playerObj.teamId) || "Blue";

  const playerTeam = teams.find((t) => safeStr(safeObj(t).teamId) === playerTeamId);
  const enemyTeam = teams.find((t) => safeStr(safeObj(t).teamId) !== playerTeamId);
  const playerTeamObj = safeObj(playerTeam);
  const enemyTeamObj = safeObj(enemyTeam);

  const scoreFor = asInt(playerTeamObj.roundsWon);
  const scoreAgainst = asInt(playerTeamObj.roundsLost || enemyTeamObj.roundsWon);
  const roundsPlayed = Math.max(scoreFor + scoreAgainst, 1);

  const headshots = asInt(playerStats.headshots);
  const bodyshots = asInt(playerStats.bodyshots);
  const legshots = asInt(playerStats.legshots);
  const totalShots = headshots + bodyshots + legshots;

  const rawCharacter = safeStr(playerObj.characterName) || safeStr(playerObj.characterId) || "Unknown Agent";
  const agent = normalizeAgentName(rawCharacter);
  const role = AGENT_ROLE[agent] ?? "duelist";

  const damage = asFloat(playerStats.damage || playerStats.damageMade);
  const score = asInt(playerStats.score);

  const startMillis = asInt(matchInfo.gameStartMillis || matchInfo.gameStartTimeMillis);
  const startedAt = startMillis > 0 ? new Date(startMillis).toISOString() : new Date().toISOString();
  const queue = normalizeQueue(safeStr(matchInfo.queueId));
  const rounds = parseRoundRows(roundResults, context.puuid, playerTeamId);

  const match: MatchInsertRow = {
    user_id: context.userId,
    external_match_id: context.externalMatchId,
    map_name: normalizeMapName(safeStr(matchInfo.mapId) || safeStr(matchInfo.mapName) || "Unknown"),
    mode: safeStr(matchInfo.gameMode) || queue,
    queue,
    agent_name: agent,
    role,
    started_at: startedAt,
    duration_minutes: millisToMinutes(asInt(matchInfo.gameLengthMillis)),
    won: asBool(playerTeamObj.won) || scoreFor > scoreAgainst,
    score_for: scoreFor,
    score_against: scoreAgainst,
    kills: asInt(playerStats.kills),
    deaths: asInt(playerStats.deaths),
    assists: asInt(playerStats.assists),
    headshot_percent: totalShots > 0 ? round((headshots * 100) / totalShots, 2) : 0,
    adr: roundsPlayed > 0 && damage > 0 ? round(damage / roundsPlayed, 2) : 0,
    acs: roundsPlayed > 0 && score > 0 ? Math.round(score / roundsPlayed) : score,
    first_bloods: asInt(playerStats.firstBloods),
    plants: asInt(playerStats.plants),
    defuses: asInt(playerStats.defuses),
    econ_rating: 0,
    created_at: new Date().toISOString(),
  };

  return { match, rounds };
}

function parseRoundRows(
  roundResults: unknown[],
  puuid: string,
  playerTeamId: string,
): Omit<RoundInsertRow, "match_id" | "user_id">[] {
  return roundResults.map((entry, index) => {
    const round = safeObj(entry);
    const roundNumRaw = asInt(round.roundNum);
    const roundNumber = roundNumRaw > 0 ? roundNumRaw : index + 1;
    const playerWonRound = safeStr(round.winningTeam) === playerTeamId;

    const playerStats = safeArr(round.playerStats).find((row) => safeStr(safeObj(row).puuid) === puuid);
    const playerRound = safeObj(playerStats);

    const killsValue = playerRound.kills;
    const assistsValue = playerRound.assists;
    const deathsValue = playerRound.deaths;

    const kills = typeof killsValue === "number" ? killsValue : Array.isArray(killsValue) ? killsValue.length : 0;
    const assists =
      typeof assistsValue === "number" ? assistsValue : Array.isArray(assistsValue) ? assistsValue.length : 0;
    const deaths = typeof deathsValue === "number" ? deathsValue : asBool(playerRound.died) ? 1 : 0;

    const killEvents = safeArr(round.playerStats);
    const firstBlood = detectFirstBlood(killEvents, puuid);
    const firstDeath = detectFirstDeath(killEvents, puuid);

    const highlight: RoundHighlight | null =
      kills >= 5 ? "ace" : kills >= 3 ? "triple-kill" : firstBlood ? "first-blood" : null;

    return {
      round_number: roundNumber,
      won: playerWonRound,
      side: inferSide(roundNumber, playerTeamId),
      buy_type: null,
      kills,
      deaths,
      assists,
      first_blood: firstBlood,
      first_death: firstDeath,
      clutch: false,
      highlight,
    };
  });
}

function detectFirstBlood(roundPlayerStats: unknown[], puuid: string): boolean {
  const first = extractFirstKillEvent(roundPlayerStats);
  return first ? first.killer === puuid : false;
}

function detectFirstDeath(roundPlayerStats: unknown[], puuid: string): boolean {
  const first = extractFirstKillEvent(roundPlayerStats);
  return first ? first.victim === puuid : false;
}

function extractFirstKillEvent(
  roundPlayerStats: unknown[],
): { killer: string | null; victim: string | null } | null {
  let firstTime = Number.POSITIVE_INFINITY;
  let first: { killer: string | null; victim: string | null } | null = null;

  for (const stat of roundPlayerStats) {
    const kills = safeObj(stat).kills;
    if (!Array.isArray(kills)) continue;
    for (const kill of kills) {
      const event = safeObj(kill);
      const t = asInt(event.timeSinceGameStartMillis || event.killTimeInRound);
      if (t <= firstTime) {
        firstTime = t;
        first = {
          killer: safeStr(event.killer),
          victim: safeStr(event.victim),
        };
      }
    }
  }

  return first;
}

async function persistRiotMatches(
  supabase: SupabaseClient,
  userId: string,
  records: ParsedMatchRecord[],
): Promise<{ inserted: number; updated: number }> {
  if (records.length === 0) {
    return { inserted: 0, updated: 0 };
  }

  const matchRows = records.map((r) => r.match);
  const externalIds = matchRows.map((row) => row.external_match_id);

  const { data: existingRows, error: existingErr } = await supabase
    .from("matches")
    .select("external_match_id")
    .eq("user_id", userId)
    .in("external_match_id", externalIds);
  if (existingErr) throw existingErr;

  const existing = new Set(
    (existingRows ?? [])
      .map((row) => (row.external_match_id ? String(row.external_match_id) : null))
      .filter((value): value is string => Boolean(value)),
  );

  const { error: upsertErr } = await supabase
    .from("matches")
    .upsert(matchRows, { onConflict: "user_id,external_match_id" });
  if (upsertErr) throw upsertErr;

  const { data: persistedMatches, error: persistedErr } = await supabase
    .from("matches")
    .select("id, external_match_id")
    .eq("user_id", userId)
    .in("external_match_id", externalIds);
  if (persistedErr) throw persistedErr;

  const idByExternal = new Map<string, string>();
  for (const row of persistedMatches ?? []) {
    if (!row.external_match_id) continue;
    idByExternal.set(String(row.external_match_id), String(row.id));
  }

  const roundRows: RoundInsertRow[] = [];
  for (const record of records) {
    const matchId = idByExternal.get(record.match.external_match_id);
    if (!matchId || record.rounds.length === 0) continue;
    for (const round of record.rounds) {
      roundRows.push({
        match_id: matchId,
        user_id: userId,
        ...round,
      });
    }
  }

  if (roundRows.length > 0) {
    const { error: roundsErr } = await supabase
      .from("match_round_summaries")
      .upsert(roundRows, { onConflict: "match_id,round_number" });
    if (roundsErr) throw roundsErr;
  }

  const inserted = externalIds.filter((id) => !existing.has(id)).length;
  return {
    inserted,
    updated: externalIds.length - inserted,
  };
}

function normalizeQueue(value: string | null): QueueType {
  const queue = (value ?? "").toLowerCase();
  if (queue.includes("premier")) return "premier";
  if (queue.includes("competitive") || queue.includes("comp")) return "competitive";
  return "unrated";
}

function normalizeAgentName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Unknown Agent";
  if (/^[0-9a-fA-F-]{30,}$/.test(trimmed)) return "Unknown Agent";
  if (trimmed.includes("/")) {
    const leaf = trimmed.split("/").filter(Boolean).pop() ?? trimmed;
    return normalizeAgentName(leaf);
  }
  return trimmed.replace(/_/g, " ");
}

function normalizeMapName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Unknown";
  if (trimmed.includes("/")) {
    const leaf = trimmed.split("/").filter(Boolean).pop() ?? trimmed;
    return leaf.replace(/_/g, " ");
  }
  return trimmed;
}

function inferSide(roundNumber: number, teamId: string): Side {
  const firstHalf = roundNumber <= 12;
  const normalizedTeam = teamId.toLowerCase();
  const blueStartsAttack = true;

  if (normalizedTeam === "blue") {
    return firstHalf === blueStartsAttack ? "attack" : "defense";
  }
  if (normalizedTeam === "red") {
    return firstHalf === blueStartsAttack ? "defense" : "attack";
  }
  return firstHalf ? "attack" : "defense";
}

function parseScoreline(scoreline: string): [number, number] {
  const [a, b] = scoreline.split("-").map((part) => asInt(part));
  return [a, b];
}

function millisToMinutes(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.max(1, Math.round(value / 60000));
}

function asBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

function asFloat(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function asInt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function safeObj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function safeArr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function safeStr(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function toMatchRowsFromMock(matches: ValorantMatch[], userId: string): MatchInsertRow[] {
  const now = new Date().toISOString();
  return matches.map((match) => {
    const [forScore, againstScore] = parseScoreline(match.scoreline);
    return {
      user_id: userId,
      external_match_id: `mock_${match.id}`,
      map_name: match.map,
      mode: "competitive",
      queue: match.queue,
      agent_name: match.agent,
      role: match.role,
      started_at: match.playedAtIso,
      duration_minutes: match.durationMinutes ?? null,
      won: match.result === "win",
      score_for: forScore,
      score_against: againstScore,
      kills: match.kda.kills,
      deaths: match.kda.deaths,
      assists: match.kda.assists,
      headshot_percent: round(match.hsPercentage, 2),
      adr: round(match.performance.combatScore * 0.34, 2),
      acs: match.performance.combatScore,
      first_bloods: match.performance.firstBloods,
      plants: match.performance.plants,
      defuses: match.performance.defuses,
      econ_rating: match.performance.econRating,
      created_at: now,
    };
  });
}
