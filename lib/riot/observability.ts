import "server-only";
import type { NextRequest } from "next/server";

type RiotAuthFailureCode = "state_mismatch" | "token_exchange_failed" | "identity_failed";

function extractRequestMeta(request: NextRequest) {
  return {
    path: request.nextUrl.pathname,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null,
    userAgent: request.headers.get("user-agent") ?? null,
    requestId: request.headers.get("x-request-id") ?? request.headers.get("x-vercel-id") ?? null,
  };
}

export function logRiotAuthFailure(params: {
  request: NextRequest;
  code: RiotAuthFailureCode;
  userId?: string | null;
  details?: Record<string, unknown>;
}) {
  const event = {
    event: "riot_oauth_failure",
    code: params.code,
    userId: params.userId ?? null,
    mockMode: process.env.RIOT_OAUTH_MOCK === "true",
    timestamp: new Date().toISOString(),
    ...extractRequestMeta(params.request),
    ...(params.details ? { details: params.details } : {}),
  };
  console.error(JSON.stringify(event));
}

export function logRiotSyncEvent(params: {
  request: NextRequest;
  level?: "info" | "error";
  stage: "start" | "complete" | "failed";
  userId?: string | null;
  details?: unknown;
}) {
  const event = {
    event: "riot_sync",
    stage: params.stage,
    userId: params.userId ?? null,
    timestamp: new Date().toISOString(),
    ...extractRequestMeta(params.request),
    ...(params.details ? { details: params.details } : {}),
  };

  if (params.level === "error") {
    console.error(JSON.stringify(event));
    return;
  }
  console.info(JSON.stringify(event));
}
