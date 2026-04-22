import { mockInsights } from "@/lib/mocks/insights";
import { mockMatches } from "@/lib/mocks/matches";
import { mockAgentPerformance, mockMapPerformance, mockOverview } from "@/lib/mocks/performance";
import { mockTrend } from "@/lib/mocks/trends";
import { mockSettings, mockUser } from "@/lib/mocks/user";
import type { ValorantDataRepository } from "@/lib/services/contracts";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    return mockMatches.find((match) => match.id === matchId) ?? null;
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
}
