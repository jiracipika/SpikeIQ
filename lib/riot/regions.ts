/**
 * Client-safe Riot region constants + types.
 *
 * This file has NO `server-only` import so it can be pulled into a Client
 * Component (e.g. the region picker in `RiotConnectForm`). All secret/
 * credential handling lives in `./config`, which depends on this file.
 */

export type RiotRegion = "NA" | "EU" | "AP";

export const SUPPORTED_REGIONS: RiotRegion[] = ["NA", "EU", "AP"];

/**
 * Riot Account-v1 uses a "routing value" that differs from the ranked region:
 * - NA -> americas
 * - EU -> europe
 * - AP -> asia
 */
export const REGION_TO_ROUTING: Record<RiotRegion, "americas" | "europe" | "asia"> = {
  NA: "americas",
  EU: "europe",
  AP: "asia",
};

export function isSupportedRegion(value: unknown): value is RiotRegion {
  return typeof value === "string" && (SUPPORTED_REGIONS as string[]).includes(value);
}
