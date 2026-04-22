import type { SupabaseClient } from "@supabase/supabase-js";
import type { ValorantDataRepository } from "@/lib/services/contracts";
import type {
  AgentPerformance,
  AppUser,
  CoachingInsight,
  DashboardOverview,
  MapPerformance,
  MatchHighlight,
  MatchRound,
  PerformanceBenchmark,
  Role,
  RoundBuyType,
  RoundHighlight,
  Side,
  UserSettings,
  ValorantMatch,
  WinRateTrendPoint,
} from "@/types/domain";
import type { AnalyticsSnapshot } from "@/lib/analytics/types";
import { runAnalytics } from "@/lib/analytics";
import { loadAnalyticsInputs } from "@/lib/analytics/supabase-loader";

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  region: AppUser["region"] | null;
};

type RiotAccountRow = {
  user_id: string;
  riot_game_name: string;
  riot_tag_line: string;
  region: AppUser["region"];
  is_verified: boolean;
};

type MatchRow = {
  id: string;
  user_id: string;
  external_match_id: string | null;
  map_name: string;
  mode: string | null;
  queue: "competitive" | "unrated" | "premier";
  agent_name: string;
  role: Role | null;
  started_at: string;
  duration_minutes: number | null;
  won: boolean;
  score_for: number;
  score_against: number;
  kills: number;
  deaths: number;
  assists: number;
  headshot_percent: number;
  adr: number;
  acs: number;
  first_bloods: number;
  plants: number;
  defuses: number;
  econ_rating: number;
};

type RoundRow = {
  id: string;
  match_id: string;
  round_number: number;
  won: boolean;
  side: Side;
  buy_type: RoundBuyType | null;
  kills: number;
  deaths: number;
  first_blood: boolean;
  first_death: boolean;
  clutch: boolean;
  highlight: RoundHighlight | null;
};

type AgentStatRow = {
  agent_name: string;
  role: Role | null;
  matches_played: number;
  wins: number;
  win_rate: number;
  kd_ratio: number;
  avg_acs: number;
};

type MapStatRow = {
  map_name: string;
  matches_played: number;
  wins: number;
  win_rate: number;
  attack_round_win_rate: number;
  defense_round_win_rate: number;
};

type InsightRow = {
  id: string;
  type: "mechanics" | "macro" | "consistency" | "mindset";
  title: string;
  description: string;
  action: string | null;
  severity: "high" | "medium" | "low";
};

type PreferencesRow = {
  preferred_role: Role | null;
  preferred_agents: string[] | null;
  profile_visibility: "private" | "friends" | "public" | null;
  email_updates: boolean;
  weekly_recap: boolean;
  auto_sync: boolean;
};

function mapRound(row: RoundRow): MatchRound {
  const kills = row.kills;
  let highlight: RoundHighlight | undefined = row.highlight ?? undefined;
  if (!highlight) {
    if (kills >= 5) highlight = "ace";
    else if (kills >= 3) highlight = "triple-kill";
    else if (row.first_blood) highlight = "first-blood";
    else if (row.clutch) highlight = "clutch";
  }
  return {
    roundNumber: row.round_number,
    winner: row.won ? "player" : "enemy",
    side: row.side,
    buyType: (row.buy_type ?? "full-buy") as RoundBuyType,
    playerKills: row.kills,
    playerDied: row.first_death || row.deaths > 0,
    highlight,
  };
}

function buildBenchmarks(
  totals: Pick<MatchRow, "acs" | "kills" | "deaths" | "headshot_percent" | "first_bloods">,
): PerformanceBenchmark[] {
  const kd = totals.deaths === 0 ? totals.kills : Math.round((totals.kills / totals.deaths) * 100) / 100;
  return [
    {
      metric: "acs",
      label: "Combat Score",
      playerValue: totals.acs,
      averageValue: 221,
      unit: "count",
    },
    {
      metric: "kd",
      label: "K/D Ratio",
      playerValue: kd,
      averageValue: 1.04,
      unit: "ratio",
    },
    {
      metric: "hsPercentage",
      label: "Headshot %",
      playerValue: totals.headshot_percent,
      averageValue: 24.2,
      unit: "percent",
    },
    {
      metric: "firstBloods",
      label: "First Bloods",
      playerValue: totals.first_bloods,
      averageValue: 2,
      unit: "count",
    },
  ];
}

function buildHighlights(rounds: MatchRound[]): MatchHighlight[] {
  if (rounds.length === 0) return [];
  const best = rounds.find((r) =>
    r.highlight && ["ace", "triple-kill", "clutch", "first-blood", "retake"].includes(r.highlight),
  );
  const worst = rounds.find((r) => r.winner === "enemy" && r.playerDied && r.playerKills === 0);

  const highlights: MatchHighlight[] = [];
  if (best) {
    highlights.push({
      roundNumber: best.roundNumber,
      label: `Round ${best.roundNumber} · Best round`,
      description: best.highlight
        ? `${best.highlight.replace("-", " ")} carried the round`
        : "Strong entry to win the round",
      kind: "best",
    });
  }
  if (worst) {
    highlights.push({
      roundNumber: worst.roundNumber,
      label: `Round ${worst.roundNumber} · Worst round`,
      description: "Got picked early without a trade",
      kind: "worst",
    });
  }
  return highlights;
}

function mapMatch(row: MatchRow, rounds: MatchRound[] = []): ValorantMatch {
  return {
    id: row.id,
    playedAtIso: row.started_at,
    queue: row.queue,
    map: row.map_name,
    agent: row.agent_name,
    role: (row.role ?? "duelist") as Role,
    result: row.won ? "win" : "loss",
    scoreline: `${row.score_for}-${row.score_against}`,
    kda: { kills: row.kills, deaths: row.deaths, assists: row.assists },
    hsPercentage: Number(row.headshot_percent),
    performance: {
      combatScore: row.acs,
      econRating: row.econ_rating,
      firstBloods: row.first_bloods,
      plants: row.plants,
      defuses: row.defuses,
    },
    durationMinutes: row.duration_minutes ?? undefined,
    rounds: rounds.length > 0 ? rounds : undefined,
    highlights: rounds.length > 0 ? buildHighlights(rounds) : undefined,
    benchmarks: buildBenchmarks(row),
  };
}

function toDayKey(iso: string) {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(key: string) {
  const [, month, day] = key.split("-");
  const monthName = new Date(`${key}T00:00:00Z`).toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  return `${monthName} ${parseInt(day, 10)}`;
}

export class SupabaseValorantRepository implements ValorantDataRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getCurrentUser(): Promise<AppUser | null> {
    const {
      data: { user: authUser },
    } = await this.supabase.auth.getUser();
    if (!authUser) return null;

    const [profileResult, riotResult] = await Promise.all([
      this.supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, region")
        .eq("id", authUser.id)
        .maybeSingle<ProfileRow>(),
      this.supabase
        .from("connected_riot_accounts")
        .select("user_id, riot_game_name, riot_tag_line, region, is_verified")
        .eq("user_id", authUser.id)
        .maybeSingle<RiotAccountRow>(),
    ]);

    const profile = profileResult.data;
    const riot = riotResult.data;

    return {
      id: authUser.id,
      email: authUser.email ?? "",
      displayName:
        profile?.display_name ??
        profile?.username ??
        (authUser.email ? authUser.email.split("@")[0] : "Player"),
      tagline: riot ? `#${riot.riot_tag_line}` : "#—",
      region: (riot?.region ?? profile?.region ?? "NA") as AppUser["region"],
      accountLinked: Boolean(riot?.is_verified),
      avatarUrl: profile?.avatar_url ?? undefined,
    };
  }

  async getDashboardOverview(userId: string): Promise<DashboardOverview> {
    const { data, error } = await this.supabase
      .from("matches")
      .select("won, acs, kills, deaths, headshot_percent")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const rows = data ?? [];
    const total = rows.length;
    if (total === 0) {
      return {
        rankLabel: "Unranked",
        rankTier: "—",
        rr: 0,
        totalMatches: 0,
        winRate: 0,
        avgCombatScore: 0,
        kdRatio: 0,
        headshotPercentage: 0,
      };
    }

    const wins = rows.filter((r) => r.won).length;
    const avgAcs = Math.round(rows.reduce((acc, r) => acc + (r.acs ?? 0), 0) / total);
    const totalKills = rows.reduce((acc, r) => acc + (r.kills ?? 0), 0);
    const totalDeaths = rows.reduce((acc, r) => acc + (r.deaths ?? 0), 0);
    const hs = rows.reduce((acc, r) => acc + Number(r.headshot_percent ?? 0), 0) / total;

    // Compute deltas vs the previous 20-match window
    const half = Math.floor(total / 2);
    const recent = rows.slice(0, half || 1);
    const prev = rows.slice(half || 1);
    const recentWr = recent.length ? (recent.filter((r) => r.won).length / recent.length) * 100 : 0;
    const prevWr = prev.length ? (prev.filter((r) => r.won).length / prev.length) * 100 : 0;
    const recentAcs = recent.length
      ? Math.round(recent.reduce((a, r) => a + (r.acs ?? 0), 0) / recent.length)
      : 0;
    const prevAcs = prev.length
      ? Math.round(prev.reduce((a, r) => a + (r.acs ?? 0), 0) / prev.length)
      : 0;

    return {
      rankLabel: "Competitive",
      rankTier: "Active",
      rr: 0,
      totalMatches: total,
      winRate: Math.round((wins / total) * 1000) / 10,
      avgCombatScore: avgAcs,
      kdRatio: totalDeaths === 0 ? totalKills : Math.round((totalKills / totalDeaths) * 100) / 100,
      headshotPercentage: Math.round(hs * 10) / 10,
      winRateDelta: prev.length ? Math.round((recentWr - prevWr) * 10) / 10 : undefined,
      acsDelta: prev.length ? recentAcs - prevAcs : undefined,
    };
  }

  async getRecentMatches(userId: string, limit = 5): Promise<ValorantMatch[]> {
    const { data, error } = await this.supabase
      .from("matches")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit)
      .returns<MatchRow[]>();
    if (error) throw error;
    return (data ?? []).map((row) => mapMatch(row));
  }

  async getAllMatches(userId: string): Promise<ValorantMatch[]> {
    const { data, error } = await this.supabase
      .from("matches")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .returns<MatchRow[]>();
    if (error) throw error;
    return (data ?? []).map((row) => mapMatch(row));
  }

  async getMatchById(userId: string, matchId: string): Promise<ValorantMatch | null> {
    const { data: match, error } = await this.supabase
      .from("matches")
      .select("*")
      .eq("user_id", userId)
      .eq("id", matchId)
      .maybeSingle<MatchRow>();
    if (error) throw error;
    if (!match) return null;

    const { data: rounds, error: roundsError } = await this.supabase
      .from("match_round_summaries")
      .select("*")
      .eq("match_id", matchId)
      .order("round_number", { ascending: true })
      .returns<RoundRow[]>();
    if (roundsError) throw roundsError;

    return mapMatch(match, (rounds ?? []).map(mapRound));
  }

  async getAgentPerformance(userId: string): Promise<AgentPerformance[]> {
    const { data, error } = await this.supabase
      .from("aggregated_agent_stats")
      .select("agent_name, role, matches_played, wins, win_rate, kd_ratio, avg_acs")
      .eq("user_id", userId)
      .order("win_rate", { ascending: false })
      .returns<AgentStatRow[]>();
    if (error) throw error;
    return (data ?? []).map((row) => ({
      agent: row.agent_name,
      role: (row.role ?? "duelist") as Role,
      matches: row.matches_played,
      winRate: Number(row.win_rate),
      kdRatio: Number(row.kd_ratio),
      avgAcs: row.avg_acs,
    }));
  }

  async getMapPerformance(userId: string): Promise<MapPerformance[]> {
    const { data, error } = await this.supabase
      .from("aggregated_map_stats")
      .select(
        "map_name, matches_played, wins, win_rate, attack_round_win_rate, defense_round_win_rate",
      )
      .eq("user_id", userId)
      .order("win_rate", { ascending: false })
      .returns<MapStatRow[]>();
    if (error) throw error;
    return (data ?? []).map((row) => ({
      map: row.map_name,
      matches: row.matches_played,
      winRate: Number(row.win_rate),
      attackRoundWinRate: Number(row.attack_round_win_rate),
      defenseRoundWinRate: Number(row.defense_round_win_rate),
    }));
  }

  async getWinRateTrend(userId: string): Promise<WinRateTrendPoint[]> {
    const { data, error } = await this.supabase
      .from("matches")
      .select("started_at, won, acs")
      .eq("user_id", userId)
      .order("started_at", { ascending: true });
    if (error) throw error;

    const rows = data ?? [];
    if (rows.length === 0) return [];

    const byDay = new Map<string, { wins: number; total: number; acsSum: number }>();
    for (const row of rows) {
      const key = toDayKey(row.started_at);
      const agg = byDay.get(key) ?? { wins: 0, total: 0, acsSum: 0 };
      agg.total += 1;
      agg.wins += row.won ? 1 : 0;
      agg.acsSum += row.acs ?? 0;
      byDay.set(key, agg);
    }

    const keys = Array.from(byDay.keys()).sort().slice(-8);
    return keys.map((key) => {
      const agg = byDay.get(key)!;
      return {
        dayLabel: formatDayLabel(key),
        winRate: Math.round((agg.wins / agg.total) * 1000) / 10,
        avgAcs: Math.round(agg.acsSum / agg.total),
      };
    });
  }

  async getCoachingInsights(userId: string): Promise<CoachingInsight[]> {
    const { data, error } = await this.supabase
      .from("generated_insights")
      .select("id, type, title, description, action, severity")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<InsightRow[]>();
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      category: row.type,
      priority: row.severity,
      description: row.description,
      action: row.action ?? "",
    }));
  }

  async getAnalyticsSnapshot(userId: string): Promise<AnalyticsSnapshot> {
    const { matches, rounds } = await loadAnalyticsInputs(this.supabase, userId);
    return runAnalytics(matches, rounds);
  }

  async getUserSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await this.supabase
      .from("user_preferences")
      .select(
        "preferred_role, preferred_agents, profile_visibility, email_updates, weekly_recap, auto_sync",
      )
      .eq("user_id", userId)
      .maybeSingle<PreferencesRow>();
    if (error) throw error;

    return {
      preferredRole: (data?.preferred_role ?? "initiator") as Role,
      preferredAgents: data?.preferred_agents ?? [],
      profileVisibility: (data?.profile_visibility ?? "public") as UserSettings["profileVisibility"],
      emailUpdates: data?.email_updates ?? true,
      weeklyRecap: data?.weekly_recap ?? true,
      autoSync: data?.auto_sync ?? true,
    };
  }
}
