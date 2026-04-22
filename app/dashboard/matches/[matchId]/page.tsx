import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bomb, Clock, Crosshair, Flame, Shield, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchHighlights } from "@/components/dashboard/match-highlights";
import { PerformanceComparison } from "@/components/dashboard/performance-comparison";
import { RoundBreakdown } from "@/components/dashboard/round-breakdown";
import { formatMatchDate, formatPercent, cn } from "@/lib/utils";
import { getValorantService } from "@/lib/services";

interface MatchDetailPageProps {
  params: Promise<{ matchId: string }>;
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { matchId } = await params;
  const service = await getValorantService();
  const { match } = await service.getMatchDetailPageData(matchId);

  if (!match) {
    notFound();
  }

  const isWin = match.result === "win";
  const kd = match.kda.deaths === 0 ? match.kda.kills : match.kda.kills / match.kda.deaths;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/matches"
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
            aria-label="Back to matches"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Match detail
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {match.map} · {match.agent}
            </h2>
            <p className="text-xs text-muted-foreground">
              {formatMatchDate(match.playedAtIso)} · <span className="capitalize">{match.queue}</span>
              {match.durationMinutes ? ` · ${match.durationMinutes}m` : ""}
            </p>
          </div>
        </div>
        <Badge variant={isWin ? "success" : "danger"} className="text-sm">
          {isWin ? "VICTORY" : "DEFEAT"} · <span className="ml-1 font-mono">{match.scoreline}</span>
        </Badge>
      </div>

      <Card className="relative overflow-hidden">
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-0.5",
            isWin ? "bg-success" : "bg-danger",
          )}
        />
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailTile icon={Flame} label="Combat score" value={match.performance.combatScore.toString()} helper="Avg dmg + util impact" />
          <DetailTile
            icon={Target}
            label="KDA"
            value={`${match.kda.kills}/${match.kda.deaths}/${match.kda.assists}`}
            helper={`K/D ${kd.toFixed(2)}`}
          />
          <DetailTile
            icon={Crosshair}
            label="Headshot %"
            value={formatPercent(match.hsPercentage)}
            helper={`First bloods ${match.performance.firstBloods}`}
          />
          <DetailTile
            icon={Shield}
            label="Role"
            value={match.agent}
            helper={match.role.charAt(0).toUpperCase() + match.role.slice(1)}
          />
        </CardContent>
      </Card>

      {match.highlights && match.highlights.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Round highlights
          </h3>
          <MatchHighlights highlights={match.highlights} />
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Round-by-round breakdown</CardTitle>
          <CardDescription>
            Hover a round for the buy type, kills, and highlight tag. Dotted rounds contain notable
            plays.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoundBreakdown rounds={match.rounds ?? []} />
        </CardContent>
      </Card>

      {match.benchmarks && match.benchmarks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Benchmarks</CardTitle>
            <CardDescription>Your output this match vs the rank average.</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceComparison benchmarks={match.benchmarks} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Utility & objectives</CardTitle>
          <CardDescription>
            Economy and objective play that context the round outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ObjectiveTile icon={Bomb} label="Plants" value={match.performance.plants} />
          <ObjectiveTile icon={Shield} label="Defuses" value={match.performance.defuses} />
          <ObjectiveTile icon={Users} label="First bloods" value={match.performance.firstBloods} />
          <ObjectiveTile icon={Clock} label="Econ rating" value={match.performance.econRating} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <span>
          Want per-round deaths, damage, and utility usage? That arrives once you connect your Riot
          account.
        </span>
        <Link href="/connect-riot">
          <Button variant="outline" size="sm">
            Connect Riot
          </Button>
        </Link>
      </div>
    </div>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </div>
      <p className="mt-1 font-mono text-xl font-semibold text-foreground">{value}</p>
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function ObjectiveTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shield;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-background/40 p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-mono text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
