import "server-only";
import { type SupabaseClient } from "@supabase/supabase-js";

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
      totalHealsOnTeammates: number;
      totalUnitsHealed: number;
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
