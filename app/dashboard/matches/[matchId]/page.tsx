import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMatchDate } from "@/lib/utils";
import { valorantService } from "@/lib/services";

interface MatchDetailPageProps {
  params: Promise<{ matchId: string }>;
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { matchId } = await params;
  const { match } = await valorantService.getMatchDetailPageData(matchId);

  if (!match) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Match Detail</h2>
          <p className="text-sm text-muted-foreground">{formatMatchDate(match.playedAtIso)}</p>
        </div>
        <Link href="/dashboard/matches">
          <Button variant="outline">Back to matches</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {match.map} • {match.agent}
          </CardTitle>
          <Badge variant={match.result === "win" ? "success" : "danger"}>{match.result.toUpperCase()}</Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Scoreline</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{match.scoreline}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">KDA</p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {match.kda.kills}/{match.kda.deaths}/{match.kda.assists}
            </p>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Combat Score</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{match.performance.combatScore}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Headshot %</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{match.hsPercentage.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Round & Utility Indicators</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            First Bloods: <span className="font-medium text-foreground">{match.performance.firstBloods}</span>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Plants: <span className="font-medium text-foreground">{match.performance.plants}</span>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Defuses: <span className="font-medium text-foreground">{match.performance.defuses}</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        TODO(match-detail): enrich with per-round timeline, economy swings, and teammate context from Riot-linked data.
      </p>
    </div>
  );
}
