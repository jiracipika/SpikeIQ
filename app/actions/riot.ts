"use server";

import { fetchPlayerByName, fetchValorantMatchStats } from "@/lib/riot/api";
import { type ValorantMatchSummary } from "@/lib/riot/valorant-types";
import { isSupportedRegion } from "@/lib/riot/regions";

export async function lookupPlayer(gameName: string, tagLine: string, region: string) {
  if (!gameName.trim()) {
    return { error: "Enter your player name" };
  }

  const player = await fetchPlayerByName(gameName, tagLine, region);
  if (!player) {
    return { error: `Player "${gameName}#${tagLine}" not found on ${region}. Check spelling and region.` };
  }

  return {
    gameName: player.gameName,
    tagLine: player.tagLine,
    summonerLevel: player.summonerLevel,
    puuid: player.puuid,
  };
}

export async function lookupPlayerWithStats(
  gameName: string,
  tagLine: string,
  region: string,
): Promise<
  | { error: string }
  | {
      gameName: string;
      tagLine: string;
      summonerLevel: number;
      puuid: string;
      matches: ValorantMatchSummary[];
    }
> {
  if (!gameName.trim()) return { error: "Enter your player name" };
  if (!isSupportedRegion(region)) return { error: "Unsupported region" };

  const player = await fetchPlayerByName(gameName, tagLine, region);
  if (!player) {
    return { error: `Player "${gameName}#${tagLine}" not found on ${region}. Check spelling and region.` };
  }

  const matches = await fetchValorantMatchStats(player.puuid, region, 5);

  return {
    gameName: player.gameName,
    tagLine: player.tagLine,
    summonerLevel: player.summonerLevel,
    puuid: player.puuid,
    matches,
  };
}
