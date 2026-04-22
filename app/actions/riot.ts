"use server";

import { fetchRiotSummonerByName } from "@/lib/riot/api";

export async function lookupSummoner(summonerName: string, region: string) {
  if (!summonerName.trim()) {
    return { error: "Enter a summoner name" };
  }

  const summoner = await fetchRiotSummonerByName(summonerName, region);
  if (!summoner) {
    return { error: `Summoner "${summonerName}" not found on ${region}. Check spelling and region.` };
  }

  return {
    summoner: {
      name: summoner.name,
      level: summoner.summonerLevel,
      puuid: summoner.puuid,
    },
  };
}
