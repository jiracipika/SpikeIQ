import type { AgentPerformance, DashboardOverview, MapPerformance } from "@/types/domain";

export const mockOverview: DashboardOverview = {
  rankLabel: "Ascendant",
  rankTier: "2",
  rr: 64,
  totalMatches: 84,
  winRate: 56.7,
  avgCombatScore: 236,
  kdRatio: 1.18,
  headshotPercentage: 27.9,
  winRateDelta: 3.2,
  acsDelta: 8,
  kdDelta: 0.06,
  hsDelta: -1.1,
  peakRank: "Immortal 1",
  rankProgress: 64,
};

export const mockAgentPerformance: AgentPerformance[] = [
  { agent: "Sova", role: "initiator", matches: 33, winRate: 60.6, kdRatio: 1.23, avgAcs: 241 },
  { agent: "Skye", role: "initiator", matches: 19, winRate: 52.6, kdRatio: 1.08, avgAcs: 218 },
  { agent: "KAY/O", role: "initiator", matches: 11, winRate: 63.6, kdRatio: 1.19, avgAcs: 236 },
  { agent: "Gekko", role: "initiator", matches: 9, winRate: 55.6, kdRatio: 1.12, avgAcs: 224 },
];

export const mockMapPerformance: MapPerformance[] = [
  { map: "Ascent", matches: 17, winRate: 64.7, attackRoundWinRate: 53.1, defenseRoundWinRate: 58.8 },
  { map: "Bind", matches: 14, winRate: 57.1, attackRoundWinRate: 50.2, defenseRoundWinRate: 57.5 },
  { map: "Sunset", matches: 12, winRate: 50.0, attackRoundWinRate: 48.0, defenseRoundWinRate: 50.4 },
  { map: "Lotus", matches: 10, winRate: 40.0, attackRoundWinRate: 46.3, defenseRoundWinRate: 42.5 },
  { map: "Haven", matches: 16, winRate: 62.5, attackRoundWinRate: 51.4, defenseRoundWinRate: 56.9 },
];
