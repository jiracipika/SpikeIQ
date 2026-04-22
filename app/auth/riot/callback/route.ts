/**
 * GET /auth/riot/callback?code=...&state=...
 *
 * OAuth return leg:
 *   1. Require a Supabase session (the user must be logged in to link)
 *   2. Validate the `state` cookie matches the query param (CSRF protection)
 *   3. Exchange the code for tokens (mock or real)
 *   4. Fetch the Riot identity
 *   5. Persist via `saveRiotAccountLink`
 *   6. Redirect back to `/connect-riot?status=...` with a friendly status code
 *
 * All failures redirect with `?status=error&code=...` so the UI can render
 * a useful message rather than leaking error details.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isSupportedRegion,
  RIOT_REGION_COOKIE,
  RIOT_STATE_COOKIE,
  type RiotRegion,
} from "@/lib/riot/config";
import { exchangeCodeForToken, safeEquals } from "@/lib/riot/oauth";
import { fetchRiotIdentity } from "@/lib/riot/client";
import { saveRiotAccountLink } from "@/lib/riot/store";

export const dynamic = "force-dynamic";

type ErrorCode =
  | "unauthenticated"
  | "missing_params"
  | "state_mismatch"
  | "token_exchange_failed"
  | "identity_failed"
  | "persist_failed"
  | "riot_denied";

function errorRedirect(request: NextRequest, code: ErrorCode): NextResponse {
  const url = new URL("/connect-riot", request.url);
  url.searchParams.set("status", "error");
  url.searchParams.set("code", code);

  const response = NextResponse.redirect(url);
  response.cookies.delete(RIOT_STATE_COOKIE);
  response.cookies.delete(RIOT_REGION_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorRedirect(request, "unauthenticated");
  }

  // Riot may send back ?error=access_denied if the user cancels.
  if (request.nextUrl.searchParams.get("error")) {
    return errorRedirect(request, "riot_denied");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) {
    return errorRedirect(request, "missing_params");
  }

  const cookieState = request.cookies.get(RIOT_STATE_COOKIE)?.value;
  if (!cookieState || !safeEquals(cookieState, state)) {
    return errorRedirect(request, "state_mismatch");
  }

  const regionCookie = request.cookies.get(RIOT_REGION_COOKIE)?.value;
  const region: RiotRegion = isSupportedRegion(regionCookie) ? regionCookie : "NA";

  let tokens;
  try {
    tokens = await exchangeCodeForToken(code);
  } catch (err) {
    console.error("[v0] riot token exchange failed", err);
    return errorRedirect(request, "token_exchange_failed");
  }

  let identity;
  try {
    identity = await fetchRiotIdentity({ tokens, region });
  } catch (err) {
    console.error("[v0] riot identity fetch failed", err);
    return errorRedirect(request, "identity_failed");
  }

  try {
    await saveRiotAccountLink({ identity, tokens, verified: true });
  } catch (err) {
    console.error("[v0] riot account persist failed", err);
    return errorRedirect(request, "persist_failed");
  }

  const successUrl = new URL("/connect-riot", request.url);
  successUrl.searchParams.set("status", "success");

  const response = NextResponse.redirect(successUrl);
  response.cookies.delete(RIOT_STATE_COOKIE);
  response.cookies.delete(RIOT_REGION_COOKIE);
  return response;
}
