/**
 * Riot Sign On (RSO) OAuth helpers.
 *
 * Pure server-side. Nothing in this file should ever be imported from a
 * Client Component. All network calls and secret usage live behind
 * `getRiotConfig()` so mock mode works without production credentials.
 */

import "server-only";
import { getRiotConfig, RIOT_SCOPES, type RiotRegion } from "./config";

export interface RiotTokenSet {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: Date;
  scope: string | null;
}

/** CSRF-safe state: 32 bytes of random base64url. */
export function generateState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export function buildAuthorizationUrl(params: { state: string; region: RiotRegion }): string {
  const cfg = getRiotConfig();
  const search = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: RIOT_SCOPES,
    state: params.state,
  });
  return `${cfg.authorizeUrl}?${search.toString()}`;
}

/**
 * Exchange an auth code for a token set. In mock mode returns a deterministic
 * fake token set so the downstream flow can be demoed end-to-end.
 */
export async function exchangeCodeForToken(code: string): Promise<RiotTokenSet> {
  const cfg = getRiotConfig();

  if (cfg.mock) {
    return {
      accessToken: `mock_access_${code.slice(0, 8)}`,
      refreshToken: `mock_refresh_${code.slice(0, 8)}`,
      idToken: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 55),
      scope: RIOT_SCOPES,
    };
  }

  const basic = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: cfg.redirectUri,
  });

  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    // Never cache token exchanges.
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Riot token exchange failed (${res.status}): ${text.slice(0, 240)}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in: number;
    scope?: string;
    token_type: string;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    idToken: json.id_token ?? null,
    expiresAt: new Date(Date.now() + json.expires_in * 1000),
    scope: json.scope ?? RIOT_SCOPES,
  };
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Constant-time string compare for the CSRF `state`. */
export function safeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
