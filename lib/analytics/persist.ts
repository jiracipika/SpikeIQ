import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnalyticsSnapshot } from "./types";

/**
 * Write analytics output back to Supabase aggregates. Uses the user-scoped
 * client so RLS enforces `auth.uid() = user_id`.
 *
 * Strategy:
 * - `aggregated_agent_stats` / `aggregated_map_stats`: upsert by (user_id, name),
 *   then delete any stale keys that are no longer in the snapshot.
 * - `generated_insights`: fully replaced each run. Insight rules are deterministic
 *   and re-running should produce a fresh set rather than stacking duplicates.
 */
export async function persistAnalytics(
  supabase: SupabaseClient,
  userId: string,
  snapshot: AnalyticsSnapshot,
): Promise<void> {
  await Promise.all([
    persistAgentStats(supabase, userId, snapshot),
    persistMapStats(supabase, userId, snapshot),
    persistInsights(supabase, userId, snapshot),
  ]);
}

async function persistAgentStats(
  supabase: SupabaseClient,
  userId: string,
  snapshot: AnalyticsSnapshot,
) {
  if (snapshot.agents.length > 0) {
    const rows = snapshot.agents.map((a) => ({
      user_id: userId,
      agent_name: a.agent,
      role: a.role,
      matches_played: a.matches,
      wins: a.wins,
      losses: Math.max(a.matches - a.wins, 0),
      win_rate: a.winRate,
      kd_ratio: a.kdRatio,
      avg_kills: a.avgKills,
      avg_deaths: a.avgDeaths,
      avg_assists: a.avgAssists,
      avg_adr: a.avgAdr,
      avg_acs: a.avgAcs,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("aggregated_agent_stats")
      .upsert(rows, { onConflict: "user_id,agent_name" });
    if (error) throw error;
  }

  // Prune agents that no longer appear in the current window
  const keep = snapshot.agents.map((a) => a.agent);
  const { error: pruneErr } = keep.length
    ? await supabase
        .from("aggregated_agent_stats")
        .delete()
        .eq("user_id", userId)
        .not("agent_name", "in", `(${keep.map(quote).join(",")})`)
    : await supabase.from("aggregated_agent_stats").delete().eq("user_id", userId);
  if (pruneErr) throw pruneErr;
}

async function persistMapStats(
  supabase: SupabaseClient,
  userId: string,
  snapshot: AnalyticsSnapshot,
) {
  if (snapshot.maps.length > 0) {
    const rows = snapshot.maps.map((m) => ({
      user_id: userId,
      map_name: m.map,
      matches_played: m.matches,
      wins: m.wins,
      losses: Math.max(m.matches - m.wins, 0),
      win_rate: m.winRate,
      attack_round_win_rate: m.attackRoundWinRate,
      defense_round_win_rate: m.defenseRoundWinRate,
      avg_kills: m.avgKills,
      avg_deaths: m.avgDeaths,
      avg_assists: m.avgAssists,
      avg_adr: m.avgAdr,
      avg_acs: m.avgAcs,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("aggregated_map_stats")
      .upsert(rows, { onConflict: "user_id,map_name" });
    if (error) throw error;
  }

  const keep = snapshot.maps.map((m) => m.map);
  const { error: pruneErr } = keep.length
    ? await supabase
        .from("aggregated_map_stats")
        .delete()
        .eq("user_id", userId)
        .not("map_name", "in", `(${keep.map(quote).join(",")})`)
    : await supabase.from("aggregated_map_stats").delete().eq("user_id", userId);
  if (pruneErr) throw pruneErr;
}

async function persistInsights(
  supabase: SupabaseClient,
  userId: string,
  snapshot: AnalyticsSnapshot,
) {
  // Replace the user's insights with the latest generation.
  const { error: deleteErr } = await supabase
    .from("generated_insights")
    .delete()
    .eq("user_id", userId);
  if (deleteErr) throw deleteErr;

  if (snapshot.insights.length === 0) return;

  const rows = snapshot.insights.map((i) => ({
    user_id: userId,
    type: i.type,
    title: i.title,
    description: i.description,
    action: i.action ?? null,
    severity: i.severity,
    related_entity: i.relatedEntity ?? null,
  }));

  const { error: insertErr } = await supabase.from("generated_insights").insert(rows);
  if (insertErr) throw insertErr;
}

/** Postgrest `not in` list requires literal quoting. Values are validated earlier. */
function quote(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
