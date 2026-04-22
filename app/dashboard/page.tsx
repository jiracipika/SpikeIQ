import Link from "next/link";
import { ArrowRight, Crosshair, Flame, Target, TrendingUp } from "lucide-react";
import { AgentPerformanceList } from "@/components/dashboard/agent-performance-list";
import { CoachingInsightsPanel } from "@/components/dashboard/coaching-insights-panel";
import { MapPerformanceList } from "@/components/dashboard/map-performance-list";
import { PerformanceScoresCard } from "@/components/dashboard/performance-scores-card";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { PlayerSummaryCard } from "@/components/dashboard/player-summary-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { WinrateTrendChart } from "@/components/dashboard/winrate-trend-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import { toCoachingInsights } from "@/lib/analytics";
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
    snapshot,
  } = await service.getDashboardPageData();

  const hasData = overview.totalMatches > 0;
  // Prefer persisted insights; fall back to freshly-generated ones so the panel
  // is never empty for a player with match history.
  const displayedInsights =
    insights.length > 0 ? insights : toCoachingInsights(snapshot.insights);

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
        <CoachingInsightsPanel insights={displayedInsights} limit={3} />
      </section>

      {hasData ? (
        <section className="grid gap-6 xl:grid-cols-3">
          <PerformanceScoresCard scores={snapshot.scores} className="xl:col-span-2" />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Side performance</CardTitle>
              <CardDescription>Attack vs defense round win rate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SideRow label="Attack" value={snapshot.sides.attackRoundWinRate} />
              <SideRow label="Defense" value={snapshot.sides.defenseRoundWinRate} />
              <div className="flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
                <span>Recent WR (last 10)</span>
                <span className="font-mono text-foreground">
                  {formatPercent(snapshot.core.recentWinRate)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>First death rate</span>
                <span className="font-mono text-foreground">
                  {formatPercent(snapshot.core.firstDeathRate)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Clutch rate</span>
                <span className="font-mono text-foreground">
                  {formatPercent(snapshot.core.clutchRate)}
                </span>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

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

function SideRow({ label, value }: { label: string; value: number }) {
  const tone = value >= 55 ? "success" : value >= 45 ? "primary" : "danger";
  const track =
    tone === "success" ? "bg-success/15" : tone === "danger" ? "bg-danger/15" : "bg-primary/10";
  const bar =
    tone === "success" ? "bg-success" : tone === "danger" ? "bg-danger" : "bg-primary";
  const text =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-primary";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-mono font-semibold ${text}`}>{value.toFixed(1)}%</span>
      </div>
      <div
        className={`h-1.5 w-full overflow-hidden rounded-full ${track}`}
        role="progressbar"
        aria-label={`${label} round win rate`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] ${bar}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
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
