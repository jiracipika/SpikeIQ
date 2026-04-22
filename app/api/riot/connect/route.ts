/**
 * GET /api/riot/connect?region=NA
 *
 * Starts the Riot Sign On flow:
 *   1. Require an authenticated Supabase session
 *   2. Generate a CSRF-safe `state` and store it + chosen region in HttpOnly cookies
 *   3. In mock mode, redirect straight to our callback with a fake code
 *      so the UX is demoable without Riot credentials
 *   4. In real mode, redirect to Riot's /authorize endpoint
 */

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
import { buildAuthorizationUrl, generateState } from "@/lib/riot/oauth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("redirectTo", "/connect-riot");
    return NextResponse.redirect(url);
  }

  const regionParam = request.nextUrl.searchParams.get("region");
  const region: RiotRegion = isSupportedRegion(regionParam) ? regionParam : "NA";

  const state = generateState();
  const cfg = getRiotConfig();

  const target = cfg.mock
    ? new URL(
        `/auth/riot/callback?code=mock_${state.slice(0, 12)}&state=${encodeURIComponent(state)}`,
        request.url,
      )
    : new URL(buildAuthorizationUrl({ state, region }));

  const response = NextResponse.redirect(target);

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
