import type { ValorantDataRepository } from "@/lib/services/contracts";
import { MockValorantRepository } from "@/lib/services/mock-valorant-repository";

export class ValorantService {
  constructor(private readonly repository: ValorantDataRepository) {}

  async getCurrentUser() {
    return this.repository.getCurrentUser();
  }

  async getDashboardPageData() {
    const user = await this.requireUser();

    const [overview, recentMatches, trend, agentPerformance, mapPerformance, insights] = await Promise.all([
      this.repository.getDashboardOverview(user.id),
      this.repository.getRecentMatches(user.id, 5),
      this.repository.getWinRateTrend(user.id),
      this.repository.getAgentPerformance(user.id),
      this.repository.getMapPerformance(user.id),
      this.repository.getCoachingInsights(user.id),
    ]);

    return { user, overview, recentMatches, trend, agentPerformance, mapPerformance, insights };
  }

  async getMatchHistoryPageData() {
    const user = await this.requireUser();
    const matches = await this.repository.getAllMatches(user.id);
    return { user, matches };
  }

  async getMatchDetailPageData(matchId: string) {
    const user = await this.requireUser();
    const match = await this.repository.getMatchById(user.id, matchId);
    return { user, match };
  }

  async getSettingsPageData() {
    const user = await this.requireUser();
    const settings = await this.repository.getUserSettings(user.id);
    return { user, settings };
  }

  private async requireUser() {
    const user = await this.repository.getCurrentUser();

    // TODO(auth): replace with real auth session + redirect when Supabase Auth is integrated.
    if (!user) {
      throw new Error("Authenticated user not found");
    }

    return user;
  }
}

// TODO(data): swap MockValorantRepository with Supabase/Riot-backed repository
// via dependency injection once backend integration is available.
export const valorantService = new ValorantService(new MockValorantRepository());
