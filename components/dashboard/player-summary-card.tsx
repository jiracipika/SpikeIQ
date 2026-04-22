import { ArrowDownRight, ArrowUpRight, Activity, Shield } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPercent, cn } from "@/lib/utils";
import type { AppUser, DashboardOverview, ValorantMatch } from "@/types/domain";

interface PlayerSummaryCardProps {
  user: AppUser;
  overview: DashboardOverview;
  recentForm: ValorantMatch[];
}

export function PlayerSummaryCard({ user, overview, recentForm }: PlayerSummaryCardProps) {
  const formStreak = recentForm.slice(0, 5);
  const wins = formStreak.filter((m) => m.result === "win").length;
  const losses = formStreak.length - wins;
  const delta = overview.winRateDelta ?? 0;
  const deltaPositive = delta >= 0;

  return (
    <Card className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid opacity-40"
        style={{
          background:
            "radial-gradient(600px circle at 100% 0%, hsl(var(--primary) / 0.08), transparent 60%), radial-gradient(500px circle at 0% 100%, hsl(var(--danger) / 0.06), transparent 60%)",
        }}
      />
      <CardContent className="relative grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar initials={user.displayName} size="lg" />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-primary">
              <Shield className="h-3 w-3" aria-hidden />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {user.displayName}
              </h2>
              <span className="font-mono text-sm text-muted-foreground">{user.tagline}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="default">{user.region}</Badge>
              <span>·</span>
              <span>
                {overview.rankLabel} {overview.rankTier} · <span className="font-mono">{overview.rr} RR</span>
              </span>
              {overview.peakRank ? (
                <>
                  <span>·</span>
                  <span>Peak {overview.peakRank}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryMetric
            label="Win rate"
            value={formatPercent(overview.winRate)}
            delta={delta}
            deltaSuffix="pp"
            caption={`${overview.totalMatches} matches`}
          />
          <SummaryMetric
            label="Avg ACS"
            value={overview.avgCombatScore.toString()}
            delta={overview.acsDelta}
            caption="last 30 days"
          />
          <SummaryMetric
            label="K/D"
            value={overview.kdRatio.toFixed(2)}
            delta={overview.kdDelta}
            caption={`${formatPercent(overview.headshotPercentage)} HS`}
          />
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <Activity className="h-3.5 w-3.5" aria-hidden />
            Recent form
          </div>
          <div className="flex items-center gap-1">
            {formStreak.map((match) => (
              <span
                key={match.id}
                title={`${match.result.toUpperCase()} · ${match.map}`}
                className={cn(
                  "h-6 w-6 rounded-md border text-center font-mono text-[10px] leading-6",
                  match.result === "win"
                    ? "border-success/30 bg-success/15 text-success"
                    : "border-danger/30 bg-danger/15 text-danger",
                )}
              >
                {match.result === "win" ? "W" : "L"}
              </span>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="text-success">{wins}W</span> · <span className="text-danger">{losses}L</span> last 5
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                deltaPositive ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
              )}
            >
              {deltaPositive ? (
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              ) : (
                <ArrowDownRight className="h-3 w-3" aria-hidden />
              )}
              {Math.abs(delta).toFixed(1)}pp
            </span>
            <span className="text-muted-foreground">vs last 2 weeks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryMetric({
  label,
  value,
  delta,
  deltaSuffix = "",
  caption,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaSuffix?: string;
  caption?: string;
}) {
  const hasDelta = typeof delta === "number";
  const good = hasDelta ? delta! >= 0 : false;
  return (
    <div className="rounded-md border border-border bg-card/60 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
              good ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
            )}
          >
            {good ? (
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            ) : (
              <ArrowDownRight className="h-3 w-3" aria-hidden />
            )}
            {Math.abs(delta!).toFixed(Math.abs(delta!) < 1 ? 2 : 1)}
            {deltaSuffix}
          </span>
        ) : null}
        {caption ? <span className="text-muted-foreground">{caption}</span> : null}
      </div>
    </div>
  );
}
