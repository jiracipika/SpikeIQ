import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logRiotSyncEvent } from "@/lib/riot/observability";
import { syncLatestRiotMatches } from "@/lib/riot/sync";

export const dynamic = "force-dynamic";

type SyncErrorCode =
  | "unauthenticated"
  | "riot_not_connected"
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

function withSyncStatus(
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

function mapErrorCode(error: unknown): SyncErrorCode {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("unauthenticated")) return "unauthenticated";
  if (message.includes("riot_not_connected")) return "riot_not_connected";
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

  logRiotSyncEvent({
    request,
    stage: "start",
    userId: user.id,
  });

  try {
    const result = await syncLatestRiotMatches({
      limit: Number.parseInt(process.env.RIOT_SYNC_MATCH_LIMIT ?? "20", 10) || 20,
    });

    logRiotSyncEvent({
      request,
      stage: "complete",
      userId: user.id,
      details: result,
    });

    return withSyncStatus(request, target, {
      sync: "success",
      mode: result.mode,
      fetched: String(result.fetched),
      inserted: String(result.inserted),
      updated: String(result.updated),
      analyzed: String(result.analyzed),
    });
  } catch (error) {
    const code = mapErrorCode(error);
    logRiotSyncEvent({
      request,
      stage: "failed",
      level: "error",
      userId: user.id,
      details: {
        code,
        error: error instanceof Error ? error.message : "unknown",
      },
    });
    return withSyncStatus(request, target, { sync: "error", code });
  }
}
