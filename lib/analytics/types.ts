import type { Role, RoundBuyType, RoundHighlight, Side } from "@/types/domain";

/**
 * Analytics is kept framework-agnostic: it operates on plain normalized inputs
 * rather than Supabase rows or the richer UI-facing `ValorantMatch` shape so we
 * can feed it from any source (Supabase, Riot API, tests, mocks).
 */

export interface AnalyticsMatchInput {
  id: string;
  playedAtIso: string;
  queue: "competitive" | "unrated" | "premier";
  map: string;
  agent: string;
  role: Role;
  won: boolean;
  scoreFor: number;
  scoreAgainst: number;
  kills: number;
  deaths: number;
  assists: number;
  headshotPercent: number;
  adr: number;
  acs: number;
  firstBloods: number;
  durationMinutes?: number;
}

export interface AnalyticsRoundInput {
  matchId: string;
  roundNumber: number;
  won: boolean;
  side: Side;
  buyType?: RoundBuyType;
  kills: number;
  deaths: number;
  firstBlood: boolean;
  firstDeath: boolean;
  clutch: boolean;
  highlight?: RoundHighlight;
}

export interface CoreMetrics {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  recentWinRate: number; // last 10
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kdRatio: number;
  headshotPercent: number;
  adr: number;
  acs: number;
  // Round-derived (may be 0 when round data is unavailable)
  firstDeathRate: number; // %
  openingDuelSuccessRate: number; // %
  clutchRate: number; // %
  // Deltas vs previous window (pp = percentage points)
  winRateDeltaPp?: number;
  acsDelta?: number;
  kdDelta?: number;
  headshotDeltaPp?: number;
}

export interface AgentBreakdown {
  agent: string;
  role: Role;
  matches: number;
  wins: number;
  winRate: number;
  kdRatio: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgAdr: number;
  avgAcs: number;
}

export interface MapBreakdown {
  map: string;
  matches: number;
  wins: number;
  winRate: number;
  attackRoundWinRate: number; // %
  defenseRoundWinRate: number; // %
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgAdr: number;
  avgAcs: number;
}

export interface SideBreakdown {
  attackRoundWinRate: number;
  defenseRoundWinRate: number;
  attackRoundsPlayed: number;
  defenseRoundsPlayed: number;
}

export interface StreakContext {
  current: { result: "win" | "loss"; length: number } | null;
  longestWin: number;
  longestLoss: number;
  postLossWinRate: number; // WR in matches played directly after ≥2 losses
}

export interface PerformanceScores {
  /** 0–100, higher = more stable round-to-round combat score. */
  consistencyScore: number;
  /** 0–100, higher = more proactive entry-fragging. */
  aggressionScore: number;
  /** 0–100, higher = harder to kill early. */
  survivabilityScore: number;
  /** 0–100, 50 = flat, >50 = trending up. */
  improvementScore: number;
}

export type InsightCategory = "mechanics" | "macro" | "consistency" | "mindset";
export type InsightSeverity = "high" | "medium" | "low";

export interface InsightDraft {
  id: string;
  type: InsightCategory;
  title: string;
  description: string;
  action?: string;
  severity: InsightSeverity;
  relatedEntity?: string;
  /** 0–1, how confidently the rule fires for this player. */
  confidence?: number;
  generatedAt: string;
}

export interface AnalyticsSnapshot {
  core: CoreMetrics;
  scores: PerformanceScores;
  sides: SideBreakdown;
  streaks: StreakContext;
  agents: AgentBreakdown[];
  maps: MapBreakdown[];
  insights: InsightDraft[];
  generatedAt: string;
}
