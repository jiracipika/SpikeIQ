import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { Swords } from "lucide-react";
import { cn, formatMatchDate, formatPercent } from "@/lib/utils";
import type { ValorantMatch } from "@/types/domain";

interface RecentMatchesTableProps {
  matches: ValorantMatch[];
}

export function RecentMatchesTable({ matches }: RecentMatchesTableProps) {
  if (matches.length === 0) {
    return (
      <EmptyState
        icon={Swords}
        title="No matches imported yet"
        description="Once your Riot account is connected, recent competitive matches will appear here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Result</TableHead>
          <TableHead>Map</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead className="text-right">KDA</TableHead>
          <TableHead className="text-right">ACS</TableHead>
          <TableHead className="text-right">HS%</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-10" aria-label="Open" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => {
          const isWin = match.result === "win";
          const kd = match.kda.deaths === 0 ? match.kda.kills : match.kda.kills / match.kda.deaths;
          return (
            <TableRow key={match.id} className="group">
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn("h-8 w-1 rounded-full", isWin ? "bg-success" : "bg-danger")}
                  />
                  <Badge variant={isWin ? "success" : "danger"}>{isWin ? "WIN" : "LOSS"}</Badge>
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/matches/${match.id}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {match.map}
                </Link>
                <p className="font-mono text-xs text-muted-foreground">{match.scoreline}</p>
              </TableCell>
              <TableCell>
                <p className="text-foreground">{match.agent}</p>
                <p className="text-xs capitalize text-muted-foreground">{match.role}</p>
              </TableCell>
              <TableCell className="text-right">
                <p className="font-mono text-foreground">
                  {match.kda.kills}/{match.kda.deaths}/{match.kda.assists}
                </p>
                <p className="font-mono text-xs text-muted-foreground">K/D {kd.toFixed(2)}</p>
              </TableCell>
              <TableCell className="text-right font-mono text-foreground">
                {match.performance.combatScore}
              </TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">
                {formatPercent(match.hsPercentage)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatMatchDate(match.playedAtIso)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/matches/${match.id}`}
                  className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:text-foreground"
                  aria-label={`Open match ${match.id}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
