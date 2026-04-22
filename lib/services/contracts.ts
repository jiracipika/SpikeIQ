import type {
  AgentPerformance,
  AppUser,
  CoachingInsight,
  DashboardOverview,
  MapPerformance,
  UserSettings,
  ValorantMatch,
  WinRateTrendPoint,
} from "@/types/domain";

export interface ValorantDataRepository {
  getCurrentUser(): Promise<AppUser | null>;
  getDashboardOverview(userId: string): Promise<DashboardOverview>;
  getRecentMatches(userId: string, limit?: number): Promise<ValorantMatch[]>;
  getAllMatches(userId: string): Promise<ValorantMatch[]>;
  getMatchById(userId: string, matchId: string): Promise<ValorantMatch | null>;
  getAgentPerformance(userId: string): Promise<AgentPerformance[]>;
  getMapPerformance(userId: string): Promise<MapPerformance[]>;
  getWinRateTrend(userId: string): Promise<WinRateTrendPoint[]>;
  getCoachingInsights(userId: string): Promise<CoachingInsight[]>;
  getUserSettings(userId: string): Promise<UserSettings>;
}
