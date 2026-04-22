"use server";

import { fetchPlayerByName } from "@/lib/riot/api";

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
