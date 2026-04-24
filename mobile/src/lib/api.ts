const DEFAULT_API_URL = "https://spikeiq.vercel.app";

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");

export type RiotRegion = "NA" | "EU" | "AP";
export const REGIONS: RiotRegion[] = ["NA", "EU", "AP"];

export interface ValorantMatchSummary {
  matchId: string;
  map: string;
  queue: string;
  won: boolean | null;
  kills: number;
  deaths: number;
  assists: number;
  acs: number;
  agent: string;
  competitiveTier: number;
  gameStartMillis: number;
  roundsWon: number;
  roundsLost: number;
  accountLevel: number;
}

export interface PlayerSummary {
  gameName: string;
  tagLine: string;
  summonerLevel: number;
  puuid: string;
}

export interface LookupResponse {
  player: PlayerSummary;
  matches: ValorantMatchSummary[];
}

export const VALORANT_TIER_NAMES: Record<number, string> = {
  0: "Unranked",
  3: "Iron 1", 4: "Iron 2", 5: "Iron 3",
  6: "Bronze 1", 7: "Bronze 2", 8: "Bronze 3",
  9: "Silver 1", 10: "Silver 2", 11: "Silver 3",
  12: "Gold 1", 13: "Gold 2", 14: "Gold 3",
  15: "Platinum 1", 16: "Platinum 2", 17: "Platinum 3",
  18: "Diamond 1", 19: "Diamond 2", 20: "Diamond 3",
  21: "Ascendant 1", 22: "Ascendant 2", 23: "Ascendant 3",
  24: "Immortal 1", 25: "Immortal 2", 26: "Immortal 3",
  27: "Radiant",
};

export async function lookupPlayer(
  gameName: string,
  tagLine: string,
  region: RiotRegion,
): Promise<LookupResponse> {
  const url = new URL(`${API_BASE_URL}/api/riot/lookup`);
  url.searchParams.set("gameName", gameName);
  url.searchParams.set("tagLine", tagLine);
  url.searchParams.set("region", region);

  const res = await fetch(url.toString());
  const text = await res.text();

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Bad response from server (${res.status})`);
  }

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body as LookupResponse;
}
