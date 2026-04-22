import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAnalytics } from "@/lib/analytics";
import { loadAnalyticsInputs } from "@/lib/analytics/supabase-loader";
import { persistAnalytics } from "@/lib/analytics/persist";

export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/recompute
 *
 * Re-runs the analytics pipeline for the current user, persists aggregates and
 * insights to Supabase, and returns the snapshot. Intended to be called:
 *   - immediately after a match ingestion sync
 *   - from the settings "Sync now" button
 *   - from a scheduled job
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { matches, rounds } = await loadAnalyticsInputs(supabase, user.id);
    const snapshot = runAnalytics(matches, rounds);

    if (matches.length > 0) {
      await persistAnalytics(supabase, user.id, snapshot);
    }

    return NextResponse.json({
      ok: true,
      matchesAnalyzed: matches.length,
      snapshot,
    });
  } catch (error) {
    console.error("[v0] analytics recompute failed", error);
    return NextResponse.json(
      { error: "Analytics recompute failed" },
      { status: 500 },
    );
  }
}
