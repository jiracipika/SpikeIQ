import Link from "next/link";
import { ArrowRight, Crosshair, Flame, Target, TrendingUp } from "lucide-react";
import { AgentPerformanceList } from "@/components/dashboard/agent-performance-list";
import { CoachingInsightsPanel } from "@/components/dashboard/coaching-insights-panel";
import { MapPerformanceList } from "@/components/dashboard/map-performance-list";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { PlayerSummaryCard } from "@/components/dashboard/player-summary-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { WinrateTrendChart } from "@/components/dashboard/winrate-trend-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import { getValorantService } from "@/lib/services";

export default async function DashboardOverviewPage() {
  const service = await getValorantService();
  const {
    user,
    overview,
    recentMatches,
    trend,
    agentPerformance,
    mapPerformance,
    insights,
  } = await service.getDashboardPageData();

  const hasData = overview.totalMatches > 0;

  return (
    <div className="space-y-6">
      {!hasData ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Welcome to SpikeIQ</CardTitle>
            <CardDescription>
              Connect your Riot account to import match history and unlock personalized insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/connect-riot">
              <Button>
                Connect Riot account
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <PlayerSummaryCard user={user} overview={overview} recentForm={recentMatches} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Win rate"
          value={formatPercent(overview.winRate)}
          helper={`${overview.totalMatches} matches`}
          delta={overview.winRateDelta}
          deltaSuffix="pp"
          icon={TrendingUp}
        />
        <StatCard
          label="Avg combat score"
          value={overview.avgCombatScore.toString()}
          helper="last 30 days"
          delta={overview.acsDelta}
          icon={Flame}
        />
        <StatCard
          label="K/D ratio"
          value={overview.kdRatio.toFixed(2)}
          helper={`${formatPercent(overview.headshotPercentage)} HS`}
          delta={overview.kdDelta}
          icon={Crosshair}
        />
        <StatCard
          label="Headshot %"
          value={formatPercent(overview.headshotPercentage)}
          helper="vs rank avg 24.2%"
          delta={overview.hsDelta}
          deltaSuffix="pp"
          icon={Target}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Win rate trend</CardTitle>
              <CardDescription>Last 8 play days · competitive only</CardDescription>
            </div>
            <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
              <LegendDot color="var(--chart-1)" label="Win rate" />
              <LegendDot color="var(--chart-2)" label="Avg ACS" dashed />
            </div>
          </CardHeader>
          <CardContent>
            <WinrateTrendChart data={trend} showAcs />
          </CardContent>
        </Card>
        <CoachingInsightsPanel insights={insights} limit={3} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent matches</CardTitle>
              <CardDescription>Your last {recentMatches.length} competitive games</CardDescription>
            </div>
            <Link
              href="/dashboard/matches"
              className="focus-ring inline-flex items-center gap-1 rounded-md text-xs font-medium text-primary hover:text-primary/80"
            >
              View all
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </CardHeader>
          <CardContent>
            <RecentMatchesTable matches={recentMatches.slice(0, 5)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent performance</CardTitle>
            <CardDescription>Best picks by win rate</CardDescription>
          </CardHeader>
          <CardContent>
            <AgentPerformanceList agents={agentPerformance} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Map performance</CardTitle>
              <CardDescription>
                Attack vs defense round win rate. Queue where you have an edge.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Filter by map
            </Button>
          </CardHeader>
          <CardContent>
            <MapPerformanceList maps={mapPerformance} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block h-0.5 w-4 rounded-full"
        style={{
          background: `hsl(${color})`,
          opacity: dashed ? 0.6 : 1,
        }}
      />
      {label}
    </span>
  );
}
