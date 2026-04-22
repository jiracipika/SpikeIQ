/**
 * POST /api/riot/disconnect
 *
 * Removes the authenticated user's linked Riot account. Uses a plain HTML
 * `<form method="post">` so no client JS is required. After deleting the
 * row, redirects back to the referring page (falling back to
 * `/connect-riot`) with a status flag so the UI can confirm the action.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteRiotAccountLink } from "@/lib/riot/store";

export const dynamic = "force-dynamic";

function statusRedirect(request: NextRequest, to: string, status: "disconnected" | "error") {
  const url = new URL(to, request.url);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // `Referer` is untrusted for auth but fine as a best-effort redirect target.
  const referer = request.headers.get("referer");
  const fallback = "/connect-riot";
  const target = (() => {
    if (!referer) return fallback;
    try {
      const url = new URL(referer);
      if (url.origin !== request.nextUrl.origin) return fallback;
      return url.pathname + url.search;
    } catch {
      return fallback;
    }
  })();

  if (!user) {
    const url = new URL("/sign-in", request.url);
    return NextResponse.redirect(url, { status: 303 });
  }

  try {
    await deleteRiotAccountLink();
  } catch (err) {
    console.error("[v0] riot disconnect failed", err);
    return statusRedirect(request, target, "error");
  }

  return statusRedirect(request, target, "disconnected");
}
