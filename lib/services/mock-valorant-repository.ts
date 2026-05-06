import { runAnalytics } from "@/lib/analytics";
import type { AnalyticsMatchInput, AnalyticsRoundInput, AnalyticsSnapshot } from "@/lib/analytics/types";
import { mockInsights } from "@/lib/mocks/insights";
import { mockMatches } from "@/lib/mocks/matches";
import { mockAgentPerformance, mockMapPerformance, mockOverview } from "@/lib/mocks/performance";
import { mockTrend } from "@/lib/mocks/trends";
import { mockSettings, mockUser } from "@/lib/mocks/user";
import type { ValorantDataRepository } from "@/lib/services/contracts";
import type { ValorantMatch } from "@/types/domain";
import { buildMatchAdvancedAnalysis } from "@/lib/services/match-analysis";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toAnalyticsInputs(matches: ValorantMatch[]): {
  matches: AnalyticsMatchInput[];
  rounds: AnalyticsRoundInput[];
} {
  const analyticsMatches: AnalyticsMatchInput[] = matches.map((m) => ({
    id: m.id,
    playedAtIso: m.playedAtIso,
    queue: m.queue,
    map: m.map,
    agent: m.agent,
    role: m.role,
    won: m.result === "win",
    scoreFor: parseInt(m.scoreline.split("-")[0] ?? "0", 10),
    scoreAgainst: parseInt(m.scoreline.split("-")[1] ?? "0", 10),
    kills: m.kda.kills,
    deaths: m.kda.deaths,
    assists: m.kda.assists,
    headshotPercent: m.hsPercentage,
    // Mock matches don't ship ADR; approximate from ACS so analytics still
    // produces meaningful aggression/survivability signals in dev.
    adr: Math.round(m.performance.combatScore * 0.6 * 10) / 10,
    acs: m.performance.combatScore,
    firstBloods: m.performance.firstBloods,
    durationMinutes: m.durationMinutes,
  }));

  const analyticsRounds: AnalyticsRoundInput[] = matches.flatMap((m) =>
    (m.rounds ?? []).map((r) => ({
      matchId: m.id,
      roundNumber: r.roundNumber,
      won: r.winner === "player",
      side: r.side,
      buyType: r.buyType,
      kills: r.playerKills,
      deaths: r.playerDied ? 1 : 0,
      firstBlood: r.highlight === "first-blood" && r.winner === "player",
      firstDeath:
        r.playerDied && r.winner === "enemy" && r.playerKills === 0 && r.highlight !== "clutch",
      clutch: r.highlight === "clutch",
      highlight: r.highlight,
    })),
  );

  return { matches: analyticsMatches, rounds: analyticsRounds };
}

export class MockValorantRepository implements ValorantDataRepository {
  async getCurrentUser() {
    await wait(50);
    return mockUser;
  }

  async getDashboardOverview(_userId: string) {
    await wait(70);
    return mockOverview;
  }

  async getRecentMatches(_userId: string, limit = 5) {
    await wait(100);
    return mockMatches.slice(0, limit);
  }

  async getAllMatches(_userId: string) {
    await wait(100);
    return mockMatches;
  }

  async getMatchById(_userId: string, matchId: string) {
    await wait(80);
    const match = mockMatches.find((item) => item.id === matchId);
    if (!match) return null;

    return {
      ...match,
      analysis: buildMatchAdvancedAnalysis({
        match: {
          scoreFor: parseInt(match.scoreline.split("-")[0] ?? "0", 10),
          scoreAgainst: parseInt(match.scoreline.split("-")[1] ?? "0", 10),
          kills: match.kda.kills,
          deaths: match.kda.deaths,
          assists: match.kda.assists,
          headshotPercent: match.hsPercentage,
          plants: match.performance.plants,
          defuses: match.performance.defuses,
        },
        rounds: (match.rounds ?? []).map((round) => ({
          won: round.winner === "player",
          side: round.side,
          buyType: round.buyType,
          kills: round.playerKills,
          deaths: round.playerDied ? 1 : 0,
          assists: 0,
          firstBlood: round.highlight === "first-blood",
          firstDeath: round.playerDied && round.playerKills === 0,
          clutch: round.highlight === "clutch",
        })),
      }),
    };
  }

  async getAgentPerformance(_userId: string) {
    await wait(60);
    return mockAgentPerformance;
  }

  async getMapPerformance(_userId: string) {
    await wait(60);
    return mockMapPerformance;
  }

  async getWinRateTrend(_userId: string) {
    await wait(60);
    return mockTrend;
  }

  async getCoachingInsights(_userId: string) {
    await wait(60);
    return mockInsights;
  }

  async getUserSettings(_userId: string) {
    await wait(30);
    return mockSettings;
  }

  async getAnalyticsSnapshot(_userId: string): Promise<AnalyticsSnapshot> {
    await wait(40);
    const { matches, rounds } = toAnalyticsInputs(mockMatches);
    return runAnalytics(matches, rounds);
  }
}
