/**
 * Riot Sign On (RSO) configuration.
 *
 * All values here are read from env on the server ONLY. Do NOT import this
 * module from client components. If `RIOT_CLIENT_ID` or `RIOT_CLIENT_SECRET`
 * are missing we fall back to a fully self-contained mock flow so the UX is
 * demoable without production credentials.
 *
 * Docs (for future real implementation):
 *   - https://developer.riotgames.com/docs/portal#_rso-integration
 *   - https://developer.riotgames.com/apis#account-v1
 */

import "server-only";
import { REGION_TO_ROUTING, type RiotRegion } from "./regions";

// Re-export the client-safe pieces so existing `@/lib/riot/config` consumers
// (server components, route handlers) keep working unchanged.
export {
  SUPPORTED_REGIONS,
  REGION_TO_ROUTING,
  isSupportedRegion,
} from "./regions";
export type { RiotRegion } from "./regions";

export const RIOT_SCOPES = ["openid", "offline_access"].join(" ");

export const RIOT_STATE_COOKIE = "riot_oauth_state";
export const RIOT_REGION_COOKIE = "riot_oauth_region";
export const RIOT_STATE_COOKIE_MAX_AGE = 60 * 10; // 10 minutes

export interface RiotConfig {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  accountApiBase: (region: RiotRegion) => string;
  /** Absolute callback URL registered with Riot. */
  redirectUri: string;
  mock: boolean;
}

function envOrigin(): string {
  // Prefer an explicit public app URL for stability across environments.
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export function getRiotConfig(): RiotConfig {
  const clientId = process.env.RIOT_CLIENT_ID ?? "";
  const clientSecret = process.env.RIOT_CLIENT_SECRET ?? "";
  const explicitMock = process.env.RIOT_OAUTH_MOCK === "true";
  const mock = explicitMock || !clientId || !clientSecret;

  return {
    clientId,
    clientSecret,
    // These are Riot's production RSO endpoints; kept here so we have a single
    // source of truth if they ever change.
    authorizeUrl: "https://auth.riotgames.com/authorize",
    tokenUrl: "https://auth.riotgames.com/token",
    userinfoUrl: "https://auth.riotgames.com/userinfo",
    accountApiBase: (region) => `https://${REGION_TO_ROUTING[region]}.api.riotgames.com`,
    redirectUri:
      process.env.RIOT_REDIRECT_URI ?? `${envOrigin().replace(/\/$/, "")}/auth/riot/callback`,
    mock,
  };
}

export function isMockMode(): boolean {
  return getRiotConfig().mock;
}
