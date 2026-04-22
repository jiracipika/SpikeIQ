export type MatchResult = "win" | "loss";

export type Role = "duelist" | "initiator" | "controller" | "sentinel";

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  tagline: string;
  region: "NA" | "EU" | "AP";
  accountLinked: boolean;
  avatarUrl?: string;
}

export interface DashboardOverview {
  rankLabel: string;
  rankTier: string;
  rr: number;
  totalMatches: number;
  winRate: number;
  avgCombatScore: number;
  kdRatio: number;
  headshotPercentage: number;
}

export interface Kda {
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchPerformance {
  combatScore: number;
  econRating: number;
  firstBloods: number;
  plants: number;
  defuses: number;
}

export interface ValorantMatch {
  id: string;
  playedAtIso: string;
  queue: "competitive" | "unrated" | "premier";
  map: string;
  agent: string;
  role: Role;
  result: MatchResult;
  scoreline: string;
  kda: Kda;
  hsPercentage: number;
  performance: MatchPerformance;
}

export interface WinRateTrendPoint {
  dayLabel: string;
  winRate: number;
  avgAcs: number;
}

export interface AgentPerformance {
  agent: string;
  role: Role;
  matches: number;
  winRate: number;
  kdRatio: number;
  avgAcs: number;
}

export interface MapPerformance {
  map: string;
  matches: number;
  winRate: number;
  attackRoundWinRate: number;
  defenseRoundWinRate: number;
}

export interface CoachingInsight {
  id: string;
  title: string;
  category: "mechanics" | "macro" | "consistency" | "mindset";
  priority: "high" | "medium" | "low";
  description: string;
  action: string;
}

export interface UserSettings {
  preferredRole: Role;
  preferredAgents: string[];
  profileVisibility: "private" | "friends" | "public";
  emailUpdates: boolean;
}
