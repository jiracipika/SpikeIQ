import { computeMatchRating } from "../metrics/match-rating";
import { computeRoundRating } from "../metrics/round-rating";
import { RawMatchPayload, RawMatchPlayer, RawRoundResult } from "../provider/types";

type RoundSide = "attack" | "defense" | "unknown";

export interface NormalizedMatchRow {
  owner_user_id: string;
  match_id: string;
  region: string;
  queue_id: string | null;
  mode_id: string | null;
  map_id: string | null;
  season_id: string | null;
  game_start_ms: number | null;
  game_start_at: string | null;
  game_length_ms: number | null;
  team_id: string | null;
  won: boolean | null;
  agent_id: string | null;
  kills: number;
  deaths: number;
  assists: number;
  damage_dealt: number;
  score: number;
  first_kills: number;
  first_deaths: number;
  trade_kills: number;
  traded_deaths: number;
  plants: number;
  defuses: number;
  rounds_played: number;
  rounds_won: number;
  avg_round_rating: number;
  consistency_score: number;
  match_rating: number;
}

export interface NormalizedRoundRow {
  owner_user_id: string;
  match_id: string;
  round_num: number;
  side: RoundSide;
  round_won: boolean | null;
  survived_round: boolean;
  kills: number;
  deaths: number;
  assists: number;
  damage_dealt: number;
  first_kill: boolean;
  first_death: boolean;
  trade_kill: boolean;
  traded_death: boolean;
  plant: boolean;
  defuse: boolean;
  loadout_value: number | null;
  spent_credits: number | null;
  remaining_credits: number | null;
  round_rating: number;
}

export interface NormalizedMatchOutput {
  match: NormalizedMatchRow;
  rounds: NormalizedRoundRow[];
  featureVector: Record<string, number | string | boolean | null>;
}

export function normalizeMatchForUser(params: {
  ownerUserId: string;
  region: string;
  puuid: string;
  raw: RawMatchPayload;
}): NormalizedMatchOutput {
  const { ownerUserId, region, puuid, raw } = params;

  const matchId = raw.matchInfo?.matchId;
  if (!matchId) {
    throw new Error("Raw match payload is missing matchInfo.matchId");
  }

  const player = raw.players?.find((entry) => entry.puuid === puuid);
  if (!player) {
    throw new Error(`Player ${puuid} not found in match ${matchId}`);
  }

  const teamId = player.teamId ?? null;
  const teams = raw.teams ?? [];
  const ownTeam = teams.find((team) => team.teamId === teamId);
  const inferRoundSide = createRoundSideResolver({
    teamId,
    rounds: raw.roundResults ?? [],
    players: raw.players ?? [],
  });

  const rounds = (raw.roundResults ?? []).map((roundResult) =>
    normalizeRound({
      ownerUserId,
      matchId,
      teamId,
      puuid,
      roundResult,
      side: inferRoundSide(roundResult),
    }),
  );

  const roundRatings = rounds.map((round) => round.round_rating);
  const rating = computeMatchRating(roundRatings);

  const firstKills = rounds.filter((r) => r.first_kill).length;
  const firstDeaths = rounds.filter((r) => r.first_death).length;
  const tradeKills = rounds.filter((r) => r.trade_kill).length;
  const tradedDeaths = rounds.filter((r) => r.traded_death).length;
  const plants = rounds.filter((r) => r.plant).length;
  const defuses = rounds.filter((r) => r.defuse).length;
  const roundsWon = rounds.filter((r) => r.round_won).length;

  const match: NormalizedMatchRow = {
    owner_user_id: ownerUserId,
    match_id: matchId,
    region,
    queue_id: raw.matchInfo?.queueId ?? null,
    mode_id: raw.matchInfo?.provisioningFlowId ?? null,
    map_id: raw.matchInfo?.mapId ?? null,
    season_id: raw.matchInfo?.seasonId ?? null,
    game_start_ms: raw.matchInfo?.gameStartMillis ?? null,
    game_start_at: raw.matchInfo?.gameStartMillis ? new Date(raw.matchInfo.gameStartMillis).toISOString() : null,
    game_length_ms: raw.matchInfo?.gameLengthMillis ?? null,
    team_id: teamId,
    won: ownTeam?.won ?? null,
    agent_id: player.characterId ?? null,
    kills: asNumber(player.stats?.kills),
    deaths: asNumber(player.stats?.deaths),
    assists: asNumber(player.stats?.assists),
    damage_dealt: asNumber(player.stats?.damage?.dealt),
    score: asNumber(player.stats?.score),
    first_kills: firstKills,
    first_deaths: firstDeaths,
    trade_kills: tradeKills,
    traded_deaths: tradedDeaths,
    plants,
    defuses,
    rounds_played: rounds.length,
    rounds_won: roundsWon,
    avg_round_rating: rating.avgRoundRating,
    consistency_score: rating.consistencyScore,
    match_rating: rating.matchRating,
  };

  const featureVector = {
    match_id: matchId,
    rounds: rounds.length,
    first_duel_delta: firstKills - firstDeaths,
    trade_participation_rate: ratio(tradeKills + tradedDeaths, rounds.length),
    objective_participation_rate: ratio(plants + defuses, rounds.length),
    survival_rate: ratio(rounds.filter((r) => r.survived_round).length, rounds.length),
    avg_round_rating: rating.avgRoundRating,
    consistency_score: rating.consistencyScore,
    match_rating: rating.matchRating,
    won: match.won,
    map_id: match.map_id,
    queue_id: match.queue_id,
  };

  return {
    match,
    rounds,
    featureVector,
  };
}

function normalizeRound(params: {
  ownerUserId: string;
  matchId: string;
  teamId: string | null;
  puuid: string;
  roundResult: RawRoundResult;
  side: RoundSide;
}): NormalizedRoundRow {
  const { ownerUserId, matchId, teamId, puuid, roundResult, side } = params;
  const playerStats = roundResult.playerStats?.find((entry) => entry.puuid === puuid);

  const events = extractKillEvents(roundResult as unknown as Record<string, unknown>);
  const firstEvent = events[0];
  const firstKill = firstEvent?.killer === puuid;
  const firstDeath = firstEvent?.victim === puuid;

  const tradeKill = events.some((event) => event.killer === puuid && event.isTradeKill);
  const tradedDeath = events.some((event) => event.victim === puuid && event.victimWasTraded);

  const kills = asNumber(playerStats?.kills);
  const deaths = asNumber(playerStats?.deaths);
  const assists = asNumber(playerStats?.assists);
  const damageDealt = asNumber(playerStats?.damage);

  const roundWon = teamId ? roundResult.winningTeam === teamId : null;
  const survivedRound = deaths === 0;
  const plant = roundResult.bombPlanter === puuid;
  const defuse = roundResult.bombDefuser === puuid;

  const roundRating = computeRoundRating({
    kills,
    deaths,
    assists,
    damageDealt,
    firstKill,
    firstDeath,
    tradeKill,
    tradedDeath,
    plant,
    defuse,
    survivedRound,
    roundWon: Boolean(roundWon),
  });

  return {
    owner_user_id: ownerUserId,
    match_id: matchId,
    round_num: roundResult.roundNum,
    side,
    round_won: roundWon,
    survived_round: survivedRound,
    kills,
    deaths,
    assists,
    damage_dealt: damageDealt,
    first_kill: firstKill,
    first_death: firstDeath,
    trade_kill: tradeKill,
    traded_death: tradedDeath,
    plant,
    defuse,
    loadout_value: asNullableNumber(playerStats?.economy?.loadoutValue),
    spent_credits: asNullableNumber(playerStats?.economy?.spent),
    remaining_credits: asNullableNumber(playerStats?.economy?.remaining),
    round_rating: roundRating,
  };
}

function createRoundSideResolver(params: {
  teamId: string | null;
  rounds: RawRoundResult[];
  players: RawMatchPlayer[];
}): (round: RawRoundResult) => RoundSide {
  const { teamId, rounds, players } = params;
  const teamByPuuid = new Map<string, string>();
  for (const player of players) {
    if (player.puuid && player.teamId) {
      teamByPuuid.set(player.puuid, player.teamId);
    }
  }

  const firstHalfSide = inferFirstHalfSide(teamId, rounds, teamByPuuid);

  return (round: RawRoundResult): RoundSide => {
    const objectiveSide = inferSideFromObjective(round, teamId, teamByPuuid);
    if (objectiveSide !== "unknown") {
      return objectiveSide;
    }

    if (!firstHalfSide) {
      return "unknown";
    }

    if (round.roundNum >= 1 && round.roundNum <= 12) {
      return firstHalfSide;
    }
    if (round.roundNum >= 13 && round.roundNum <= 24) {
      return flipSide(firstHalfSide);
    }

    return "unknown";
  };
}

function inferFirstHalfSide(
  teamId: string | null,
  rounds: RawRoundResult[],
  teamByPuuid: Map<string, string>,
): Exclude<RoundSide, "unknown"> | null {
  if (!teamId) {
    return null;
  }

  const firstHalf = [...rounds]
    .filter((round) => round.roundNum >= 1 && round.roundNum <= 12)
    .sort((a, b) => a.roundNum - b.roundNum);

  for (const round of firstHalf) {
    const side = inferSideFromObjective(round, teamId, teamByPuuid);
    if (side !== "unknown") {
      return side;
    }
  }

  return null;
}

function inferSideFromObjective(
  round: RawRoundResult,
  teamId: string | null,
  teamByPuuid: Map<string, string>,
): RoundSide {
  if (!teamId) {
    return "unknown";
  }

  if (round.bombPlanter) {
    const planterTeam = teamByPuuid.get(round.bombPlanter);
    if (planterTeam) {
      return planterTeam === teamId ? "attack" : "defense";
    }
  }

  if (round.bombDefuser) {
    const defuserTeam = teamByPuuid.get(round.bombDefuser);
    if (defuserTeam) {
      return defuserTeam === teamId ? "defense" : "attack";
    }
  }

  return "unknown";
}

function flipSide(side: Exclude<RoundSide, "unknown">): Exclude<RoundSide, "unknown"> {
  return side === "attack" ? "defense" : "attack";
}

function asNumber(value: number | undefined): number {
  return Number.isFinite(value) ? (value as number) : 0;
}

function asNullableNumber(value: number | undefined): number | null {
  return Number.isFinite(value) ? (value as number) : null;
}

function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return Math.round((numerator / denominator) * 1000) / 1000;
}

interface KillEvent {
  killer?: string;
  victim?: string;
  isTradeKill?: boolean;
  victimWasTraded?: boolean;
}

function extractKillEvents(roundResult: Record<string, unknown>): KillEvent[] {
  const possible = roundResult["killEvents"];
  if (!Array.isArray(possible)) {
    return [];
  }

  const events: KillEvent[] = [];
  for (const entry of possible) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const data = entry as Record<string, unknown>;
    events.push({
      killer: typeof data.killer === "string" ? data.killer : undefined,
      victim: typeof data.victim === "string" ? data.victim : undefined,
      isTradeKill: Boolean(data.isTradeKill),
      victimWasTraded: Boolean(data.victimWasTraded),
    });
  }

  return events;
}
