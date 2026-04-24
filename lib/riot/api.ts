import "server-only";
import { REGION_TO_ROUTING, isSupportedRegion, type RiotRegion } from "./regions";
import { type ValorantMatchSummary } from "./valorant-types";

export type { ValorantMatchSummary };

const REGION_TO_PLATFORM: Record<RiotRegion, string> = {
  NA: "na1",
  EU: "euw1",
  AP: "kr",
};

const REGION_TO_VAL_ROUTING: Record<RiotRegion, string> = {
  NA: "na",
  EU: "eu",
  AP: "ap",
};

interface ValMatchListResponse {
  puuid: string;
  history: Array<{
    matchId: string;
    gameStartTimeMillis: number;
    teamId: string;
  }>;
}

interface ValMatchDetail {
  matchInfo: {
    matchId: string;
    mapId: string;
    gameStartMillis: number;
    queueID: string;
    gameLengthMillis: number;
  };
  players: Array<{
    puuid: string;
    teamId: string;
    characterId: string;
    stats: { score: number; roundsPlayed: number; kills: number; deaths: number; assists: number };
    competitiveTier: number;
    accountLevel: number;
  }>;
  teams: Array<{ teamId: string; won: boolean; roundsWon: number; roundsPlayed: number }>;
}

interface ValContentResponse {
  characters: Array<{ id: string; name: string }>;
  maps: Array<{ id: string; name: string; assetPath: string }>;
}

async function fetchValorantContent(valRegion: string): Promise<ValContentResponse | null> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://${valRegion}.api.riotgames.com/val/content/v1/contents`,
      { headers: { "X-Riot-Token": apiKey }, next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function extractMapName(mapId: string, maps?: ValContentResponse["maps"]): string {
  if (maps) {
    const match = maps.find((m) => m.assetPath === mapId || m.id === mapId);
    if (match) return match.name;
  }
  const segment = mapId.split("/").pop() ?? mapId;
  return segment;
}


export async function fetchValorantMatchStats(
  puuid: string,
  region: RiotRegion,
  count = 5,
): Promise<ValorantMatchSummary[]> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) return [];

  const valRegion = REGION_TO_VAL_ROUTING[region];

  const [listRes, content] = await Promise.all([
    fetch(
      `https://${valRegion}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${encodeURIComponent(puuid)}`,
      { headers: { "X-Riot-Token": apiKey }, cache: "no-store" },
    ),
    fetchValorantContent(valRegion),
  ]);

  if (!listRes.ok) {
    console.error(`[val] matchlist fetch failed: ${listRes.status}`);
    return [];
  }

  const list = (await listRes.json()) as ValMatchListResponse;
  const recentIds = list.history.slice(0, count).map((h) => h.matchId);

  const charMap = new Map(content?.characters.map((c) => [c.id, c.name]) ?? []);

  const details = await Promise.all(
    recentIds.map(async (matchId) => {
      try {
        const res = await fetch(
          `https://${valRegion}.api.riotgames.com/val/match/v1/matches/${encodeURIComponent(matchId)}`,
          { headers: { "X-Riot-Token": apiKey }, cache: "no-store" },
        );
        if (!res.ok) return null;
        return (await res.json()) as ValMatchDetail;
      } catch {
        return null;
      }
    }),
  );

  const summaries: ValorantMatchSummary[] = [];
  for (const detail of details) {
    if (!detail) continue;
    const player = detail.players.find((p) => p.puuid === puuid);
    if (!player) continue;

    const team = detail.teams.find((t) => t.teamId === player.teamId);
    const opponentTeam = detail.teams.find((t) => t.teamId !== player.teamId);
    const roundsPlayed = player.stats.roundsPlayed || 1;

    summaries.push({
      matchId: detail.matchInfo.matchId,
      map: extractMapName(detail.matchInfo.mapId, content?.maps),
      queue: detail.matchInfo.queueID || "unknown",
      won: team?.won ?? null,
      kills: player.stats.kills,
      deaths: player.stats.deaths,
      assists: player.stats.assists,
      acs: Math.round(player.stats.score / roundsPlayed),
      agent: charMap.get(player.characterId) ?? player.characterId.slice(0, 8),
      competitiveTier: player.competitiveTier,
      gameStartMillis: detail.matchInfo.gameStartMillis,
      roundsWon: team?.roundsWon ?? 0,
      roundsLost: (opponentTeam?.roundsWon) ?? 0,
      accountLevel: player.accountLevel,
    });
  }

  return summaries;
}

interface RiotSummoner {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  summonerLevel: number;
}

interface RiotMatch {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameEndTimestamp: number;
    gameId: number;
    gameMode: string;
    gameName: string;
    gameStartTimestamp: number;
    gameType: string;
    gameVersion: string;
    mapId: number;
    participants: Array<{
      allInPings: number;
      assistMePings: number;
      assists: number;
      baronKills: number;
      basicPings: number;
      bountyLevel: number;
      challenges: Record<string, unknown>;
      champExperience: number;
      champLevel: number;
      championId: number;
      championName: string;
      championTransform: number;
      consumablesPurchased: number;
      controlWardsPurchased: number;
      damageDealtToBuildings: number;
      damageDealtToObjectives: number;
      damageDealtToTurrets: number;
      damageSelfMitigated: number;
      dangerPings: number;
      deaths: number;
      detectorWardsPlaced: number;
      doubleKills: number;
      dragonKills: number;
      eligibleForProgression: boolean;
      enemyMissingPings: number;
      enemyVisionPings: boolean;
      firstBloodAssist: boolean;
      firstBloodKill: boolean;
      firstTowerAssist: boolean;
      firstTowerKill: boolean;
      gameEndedInEarlySurrender: boolean;
      gameEndedInSurrender: boolean;
      goldEarned: number;
      goldSpent: number;
      holdPings: number;
      inhibitorKills: number;
      inhibitorTakedowns: number;
      inhibitorsLost: number;
      item0: number;
      item1: number;
      item2: number;
      item3: number;
      item4: number;
      item5: number;
      item6: number;
      itemsPurchased: number;
      killingSprees: number;
      kills: number;
      lane: string;
      largestCriticalStrike: number;
      largestKillingSpree: number;
      largestMultiKill: number;
      longestTimeSpentLiving: number;
      magicDamageDealt: number;
      magicDamageDealtToChampions: number;
      magicDamageTaken: number;
      missions: Record<string, unknown>;
      missingPings: number;
      needVisionPings: number;
      neutralMinionsKilled: number;
      nexusKills: number;
      nexusTakedowns: number;
      nexusLost: number;
      objectivesStolen: number;
      objectivesStolenAssists: number;
      onMyWayPings: number;
      participantId: number;
      pentaKills: number;
      perksStats: Record<string, unknown>;
      physicalDamageDealt: number;
      physicalDamageDealtToChampions: number;
      physicalDamageTaken: number;
      placement: number;
      playerAugment1: number;
      playerAugment2: number;
      playerAugment3: number;
      playerAugment4: number;
      playerSubteamId: number;
      profileIcon: number;
      pushPings: number;
      puuid: string;
      quadraKills: number;
      riotIdName: string;
      riotIdTagline: string;
      role: string;
      sightWardsBoughtInGame: number;
      spell1Casts: number;
      spell2Casts: number;
      spell3Casts: number;
      spell4Casts: number;
      summoner1Casts: number;
      summoner1Id: number;
      summoner2Casts: number;
      summoner2Id: number;
      summonerId: string;
      summonerLevel: number;
      summonerName: string;
      teamEarlySurrendered: boolean;
      teamId: number;
      teamPosition: string;
      timeCCingOthers: number;
      timePlayed: number;
      totalDamageDealt: number;
      totalDamageDealtToChampions: number;
      totalDamageTaken: number;
      totalHeal: number;
      totalHealsOnTeammates: number;
      totalMinionsKilled: number;
      totalTimeCCDealt: number;
      totalUnitsHealed: number;
      tripleKills: number;
      trueDamageDealt: number;
      trueDamageDealtToChampions: number;
      trueDamageTaken: number;
      turretKills: number;
      turretTakedowns: number;
      turretsLost: number;
      unrealKills: number;
      visionClearedPings: number;
      visionScore: number;
      wardsKilled: number;
      wardsPlaced: number;
      win: boolean;
    }>;
    platformId: string;
    queueId: number;
    teams: Array<{
      bans: Array<{ championId: number; pickTurn: number }>;
      objectives: Record<string, { first: boolean; kills: number }>;
      teamId: number;
      win: boolean;
    }>;
    tournamentCode: string;
  };
}

/**
 * Fetch summoner by name using the Riot API key directly (no OAuth needed).
 * Used for quick manual testing when user enters their summoner name.
 */
export async function fetchRiotSummonerByName(
  summonerName: string,
  region: string = "na1"
): Promise<RiotSummoner | null> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) {
    console.error("[v0] RIOT_API_KEY not set");
    return null;
  }

  try {
    const response = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      {
        headers: { "X-Riot-Token": apiKey },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.error(`[v0] Summoner "${summonerName}" not found on ${region}`);
        return null;
      }
      console.error(`[v0] Riot API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return (await response.json()) as RiotSummoner;
  } catch (error) {
    console.error("[v0] Failed to fetch summoner:", error);
    return null;
  }
}

/**
 * Fetch recent matches for a PUUID using the Riot API key.
 */
export async function fetchRiotMatches(
  puuid: string,
  region: string = "americas",
  limit: number = 20
): Promise<string[]> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=0&count=${limit}`,
      {
        headers: { "X-Riot-Token": apiKey },
      }
    );

    if (!response.ok) {
      console.error(`[v0] Failed to fetch matches: ${response.status}`);
      return [];
    }

    return (await response.json()) as string[];
  } catch (error) {
    console.error("[v0] Failed to fetch matches:", error);
    return [];
  }
}

/**
 * Fetch a specific match detail using the Riot API key.
 */
export async function fetchRiotMatchDetail(
  matchId: string,
  region: string = "americas"
): Promise<RiotMatch | null> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://${region}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`,
      {
        headers: { "X-Riot-Token": apiKey },
      }
    );

    if (!response.ok) {
      console.error(`[v0] Failed to fetch match detail: ${response.status}`);
      return null;
    }

    return (await response.json()) as RiotMatch;
  } catch (error) {
    console.error("[v0] Failed to fetch match detail:", error);
    return null;
  }
}

/**
 * Look up a player by Riot ID (gameName#tagLine) using Account-v1, then resolve
 * their summoner level via Summoner-v4 on the region's platform shard.
 */
export async function fetchPlayerByName(
  gameName: string,
  tagLine: string,
  region: string,
): Promise<{ gameName: string; tagLine: string; summonerLevel: number; puuid: string } | null> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) {
    console.error("[v0] RIOT_API_KEY not set");
    return null;
  }

  if (!isSupportedRegion(region)) {
    console.error(`[v0] Unsupported region: ${region}`);
    return null;
  }

  const routing = REGION_TO_ROUTING[region];
  const platform = REGION_TO_PLATFORM[region];

  try {
    const accountRes = await fetch(
      `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { "X-Riot-Token": apiKey }, cache: "no-store" },
    );

    if (!accountRes.ok) {
      if (accountRes.status !== 404) {
        console.error(`[v0] Account lookup failed: ${accountRes.status}`);
      }
      return null;
    }

    const account = (await accountRes.json()) as {
      puuid: string;
      gameName: string;
      tagLine: string;
    };

    let summonerLevel = 0;
    const summonerRes = await fetch(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(account.puuid)}`,
      { headers: { "X-Riot-Token": apiKey }, cache: "no-store" },
    );
    if (summonerRes.ok) {
      const summoner = (await summonerRes.json()) as { summonerLevel?: number };
      summonerLevel = summoner.summonerLevel ?? 0;
    }

    return {
      gameName: account.gameName,
      tagLine: account.tagLine,
      summonerLevel,
      puuid: account.puuid,
    };
  } catch (error) {
    console.error("[v0] Failed to lookup player:", error);
    return null;
  }
}
