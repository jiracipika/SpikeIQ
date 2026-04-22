/**
 * Riot identity client.
 *
 * Calls the Account-v1 `/me` endpoint to get the canonical Riot ID + PUUID
 * for a user who authorized us. In mock mode we synthesize a plausible
 * identity deterministically from the access token so the rest of the flow
 * (DB write, UI) behaves identically to a real connection.
 */

import "server-only";
import { getRiotConfig, type RiotRegion } from "./config";
import type { RiotTokenSet } from "./oauth";

export interface RiotIdentity {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: RiotRegion;
}

export async function fetchRiotIdentity(params: {
  tokens: RiotTokenSet;
  region: RiotRegion;
}): Promise<RiotIdentity> {
  const cfg = getRiotConfig();

  if (cfg.mock) {
    return mockIdentity(params.tokens.accessToken, params.region);
  }

  const res = await fetch(`${cfg.accountApiBase(params.region)}/riot/account/v1/accounts/me`, {
    headers: {
      Authorization: `Bearer ${params.tokens.accessToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Riot Account-v1 /me failed (${res.status}): ${text.slice(0, 240)}`);
  }

  const json = (await res.json()) as { puuid: string; gameName: string; tagLine: string };
  return {
    puuid: json.puuid,
    gameName: json.gameName,
    tagLine: json.tagLine,
    region: params.region,
  };
}

function mockIdentity(accessToken: string, region: RiotRegion): RiotIdentity {
  const sample = [
    ["AimTheory", "NA1"],
    ["SpikeRush", "EUW"],
    ["ZeroPing", "AP1"],
    ["HeadshotFlick", "NA2"],
    ["Clutch", "EU2"],
  ] as const;
  const seed = Array.from(accessToken).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const [gameName, tagLine] = sample[seed % sample.length];
  const puuid = `mock-${toHex(seed)}-${accessToken.slice(-8)}`.padEnd(36, "0").slice(0, 36);
  return { puuid, gameName, tagLine, region };
}

function toHex(n: number): string {
  return Math.abs(n).toString(16).padStart(8, "0");
}
