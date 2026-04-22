import { Filter, LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchCard } from "@/components/dashboard/match-card";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { valorantService } from "@/lib/services";
import { formatPercent } from "@/lib/utils";

export default async function MatchHistoryPage() {
  const { matches } = await valorantService.getMatchHistoryPageData();

  const wins = matches.filter((m) => m.result === "win").length;
  const losses = matches.length - wins;
  const winRate = matches.length > 0 ? (wins / matches.length) * 100 : 0;
  const avgAcs =
    matches.length > 0
      ? Math.round(matches.reduce((acc, m) => acc + m.performance.combatScore, 0) / matches.length)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Match history</h2>
          <p className="text-sm text-muted-foreground">
            Review every match, drill into rounds, and find the leaks worth fixing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            <button
              type="button"
              className="focus-ring inline-flex h-9 items-center gap-1.5 border-r border-border bg-card px-3 text-xs font-medium text-foreground"
              aria-pressed="true"
            >
              <Table2 className="h-3.5 w-3.5" /> Table
            </button>
            <button
              type="button"
              className="focus-ring inline-flex h-9 items-center gap-1.5 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
              aria-pressed="false"
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cards
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Matches" value={matches.length.toString()} />
        <SummaryTile label="Wins" value={`${wins}W`} accent="success" helper={`${losses}L losses`} />
        <SummaryTile label="Win rate" value={formatPercent(winRate)} />
        <SummaryTile label="Avg ACS" value={avgAcs.toString()} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All matches</CardTitle>
          <CardDescription>Sorted by most recent. Click a row to open the match.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentMatchesTable matches={matches} />
        </CardContent>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Card view
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string;
  helper?: string;
  accent?: "success" | "danger";
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={
          "mt-1 font-mono text-2xl font-semibold " +
          (accent === "success"
            ? "text-success"
            : accent === "danger"
              ? "text-danger"
              : "text-foreground")
        }
      >
        {value}
      </p>
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
