import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDevSelfTestEnabled, isSupportedRegion, type RiotRegion } from "@/lib/riot/config";
import { logRiotSyncEvent } from "@/lib/riot/observability";
import { syncLatestRiotMatchesForRiotId } from "@/lib/riot/sync";

export const dynamic = "force-dynamic";

type SelfTestErrorCode =
  | "unauthenticated"
  | "self_test_disabled"
  | "invalid_riot_id"
  | "riot_id_not_found"
  | "missing_riot_api_key"
  | "sync_failed";

function safeReturnPath(request: NextRequest): string {
  const fallback = "/dashboard/settings";
  const referer = request.headers.get("referer");
  if (!referer) return fallback;

  try {
    const url = new URL(referer);
    if (url.origin !== request.nextUrl.origin) return fallback;
    return url.pathname + url.search;
  } catch {
    return fallback;
  }
}

function withStatus(
  request: NextRequest,
  path: string,
  params: Record<string, string>,
): NextResponse {
  const url = new URL(path, request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url, { status: 303 });
}

function toErrorCode(error: unknown): SelfTestErrorCode {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("unauthenticated")) return "unauthenticated";
  if (message.includes("self_test_disabled")) return "self_test_disabled";
  if (message.includes("invalid_riot_id")) return "invalid_riot_id";
  if (message.includes("riot_id_not_found")) return "riot_id_not_found";
  if (message.includes("missing_riot_api_key")) return "missing_riot_api_key";
  return "sync_failed";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const target = safeReturnPath(request);

  if (!user) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", "/dashboard/settings");
    return NextResponse.redirect(signInUrl, { status: 303 });
  }

  if (!isDevSelfTestEnabled()) {
    return withStatus(request, target, { sync: "error", code: "self_test_disabled" });
  }

  const formData = await request.formData();
  const gameName = String(formData.get("gameName") ?? "").trim();
  const tagLine = String(formData.get("tagLine") ?? "").replace(/^#/, "").trim();
  const regionRaw = String(formData.get("region") ?? "").trim();
  const region: RiotRegion = isSupportedRegion(regionRaw) ? regionRaw : "NA";
  const riotId = `${gameName}#${tagLine}`;

  if (!gameName || !tagLine) {
    return withStatus(request, target, { sync: "error", code: "invalid_riot_id" });
  }

  logRiotSyncEvent({
    request,
    stage: "start",
    userId: user.id,
    details: { source: "self_test", riotId, region },
  });

  try {
    const result = await syncLatestRiotMatchesForRiotId({
      gameName,
      tagLine,
      region,
      limit: Number.parseInt(process.env.RIOT_SYNC_MATCH_LIMIT ?? "20", 10) || 20,
    });

    logRiotSyncEvent({
      request,
      stage: "complete",
      userId: user.id,
      details: { source: "self_test", riotId, ...result },
    });

    return withStatus(request, target, {
      sync: "success",
      source: "self_test",
      riot_id: riotId,
      mode: result.mode,
      fetched: String(result.fetched),
      inserted: String(result.inserted),
      updated: String(result.updated),
      analyzed: String(result.analyzed),
    });
  } catch (error) {
    const code = toErrorCode(error);
    logRiotSyncEvent({
      request,
      stage: "failed",
      level: "error",
      userId: user.id,
      details: {
        source: "self_test",
        riotId,
        code,
        error: error instanceof Error ? error.message : "unknown",
      },
    });

    return withStatus(request, target, {
      sync: "error",
      source: "self_test",
      code,
    });
  }
}
