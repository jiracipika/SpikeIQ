import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getRiotConfig,
  isSupportedRegion,
  RIOT_REGION_COOKIE,
  RIOT_STATE_COOKIE,
  RIOT_STATE_COOKIE_MAX_AGE,
  type RiotRegion,
} from "@/lib/riot/config";
import { buildAuthorizationUrl, exchangeCodeForToken, generateState, safeEquals } from "@/lib/riot/oauth";
import { fetchRiotIdentity } from "@/lib/riot/client";
import { saveRiotAccountLink } from "@/lib/riot/store";

type CallbackErrorCode =
  | "unauthenticated"
  | "missing_params"
  | "state_mismatch"
  | "token_exchange_failed"
  | "identity_failed"
  | "persist_failed"
  | "riot_denied";

const OAUTH_STATE_PATTERN = /^[A-Za-z0-9_-]{20,256}$/;

function clearOauthCookies(response: NextResponse) {
  response.cookies.delete(RIOT_STATE_COOKIE);
  response.cookies.delete(RIOT_REGION_COOKIE);
}

function oauthErrorRedirect(request: NextRequest, code: CallbackErrorCode): NextResponse {
  const url = new URL("/connect-riot", request.url);
  url.searchParams.set("status", "error");
  url.searchParams.set("code", code);
  const response = NextResponse.redirect(url, { status: 303 });
  clearOauthCookies(response);
  return response;
}

export async function startRiotOAuth(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("redirectTo", "/connect-riot");
    return NextResponse.redirect(url, { status: 303 });
  }

  const regionParam = request.nextUrl.searchParams.get("region");
  const region: RiotRegion = isSupportedRegion(regionParam) ? regionParam : "NA";

  const state = generateState();
  const cfg = getRiotConfig();
  const callbackUrl = new URL(cfg.redirectUri, request.url);
  const target = cfg.mock
    ? (() => {
        callbackUrl.searchParams.set("code", `mock_${state.slice(0, 12)}`);
        callbackUrl.searchParams.set("state", state);
        return callbackUrl;
      })()
    : new URL(buildAuthorizationUrl({ state, region }));

  const response = NextResponse.redirect(target, { status: 303 });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: RIOT_STATE_COOKIE_MAX_AGE,
  };

  response.cookies.set(RIOT_STATE_COOKIE, state, cookieOptions);
  response.cookies.set(RIOT_REGION_COOKIE, region, cookieOptions);
  return response;
}

export async function completeRiotOAuth(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return oauthErrorRedirect(request, "unauthenticated");
  }

  if (request.nextUrl.searchParams.get("error")) {
    return oauthErrorRedirect(request, "riot_denied");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) {
    return oauthErrorRedirect(request, "missing_params");
  }

  if (!OAUTH_STATE_PATTERN.test(state)) {
    return oauthErrorRedirect(request, "state_mismatch");
  }

  const cookieState = request.cookies.get(RIOT_STATE_COOKIE)?.value;
  if (!cookieState || !safeEquals(cookieState, state)) {
    return oauthErrorRedirect(request, "state_mismatch");
  }

  const regionCookie = request.cookies.get(RIOT_REGION_COOKIE)?.value;
  const region: RiotRegion = isSupportedRegion(regionCookie) ? regionCookie : "NA";

  let tokens;
  try {
    tokens = await exchangeCodeForToken(code);
  } catch (error) {
    console.error("[spikeiq] riot token exchange failed", error);
    return oauthErrorRedirect(request, "token_exchange_failed");
  }

  let identity;
  try {
    identity = await fetchRiotIdentity({ tokens, region });
  } catch (error) {
    console.error("[spikeiq] riot identity fetch failed", error);
    return oauthErrorRedirect(request, "identity_failed");
  }

  try {
    await saveRiotAccountLink({ identity, tokens, verified: true });
  } catch (error) {
    console.error("[spikeiq] riot account persist failed", error);
    return oauthErrorRedirect(request, "persist_failed");
  }

  const successUrl = new URL("/connect-riot", request.url);
  successUrl.searchParams.set("status", "success");
  const response = NextResponse.redirect(successUrl, { status: 303 });
  clearOauthCookies(response);
  return response;
}
