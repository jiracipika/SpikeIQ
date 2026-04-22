import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ValorantDataRepository } from "@/lib/services/contracts";
import { SupabaseValorantRepository } from "@/lib/services/supabase-valorant-repository";

export class ValorantService {
  constructor(private readonly repository: ValorantDataRepository) {}

  async getCurrentUser() {
    return this.repository.getCurrentUser();
  }

  async getDashboardPageData() {
    const user = await this.requireUser();

    const [overview, recentMatches, trend, agentPerformance, mapPerformance, insights] =
      await Promise.all([
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
    if (!user) {
      redirect("/sign-in");
    }
    return user;
  }
}

/**
 * Build a ValorantService bound to the current request's Supabase session.
 * Must be called from a Server Component, Route Handler, or Server Action.
 */
export async function getValorantService(): Promise<ValorantService> {
  const supabase = await createClient();
  return new ValorantService(new SupabaseValorantRepository(supabase));
}
