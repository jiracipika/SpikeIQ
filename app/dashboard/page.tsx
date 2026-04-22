import Link from "next/link";
import { AgentPerformanceList } from "@/components/dashboard/agent-performance-list";
import { CoachingInsightsPanel } from "@/components/dashboard/coaching-insights-panel";
import { MapPerformanceList } from "@/components/dashboard/map-performance-list";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { WinrateTrendChart } from "@/components/dashboard/winrate-trend-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import { valorantService } from "@/lib/services";

export default async function DashboardOverviewPage() {
  const { overview, recentMatches, trend, agentPerformance, mapPerformance, insights } =
    await valorantService.getDashboardPageData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Rank" value={`${overview.rankLabel} ${overview.rankTier}`} helper={`${overview.rr} RR`} />
        <StatCard label="Win Rate" value={formatPercent(overview.winRate)} helper={`${overview.totalMatches} total matches`} />
        <StatCard label="Avg Combat Score" value={overview.avgCombatScore.toString()} helper="Last 30 days" />
        <StatCard label="K/D Ratio" value={overview.kdRatio.toFixed(2)} helper={`${formatPercent(overview.headshotPercentage)} HS`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Matches</CardTitle>
            <Link href="/dashboard/matches">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <RecentMatchesTable matches={recentMatches} />
          </CardContent>
        </Card>
        <CoachingInsightsPanel insights={insights} />
      </section>

      <section className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Win Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <WinrateTrendChart data={trend} />
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentPerformanceList agents={agentPerformance} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Map Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <MapPerformanceList maps={mapPerformance} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
