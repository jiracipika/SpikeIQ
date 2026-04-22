import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMatchDate } from "@/lib/utils";
import type { ValorantMatch } from "@/types/domain";

interface RecentMatchesTableProps {
  matches: ValorantMatch[];
}

export function RecentMatchesTable({ matches }: RecentMatchesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Result</TableHead>
          <TableHead>Map</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>KDA</TableHead>
          <TableHead>ACS</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => (
          <TableRow key={match.id}>
            <TableCell>
              <Badge variant={match.result === "win" ? "success" : "danger"}>{match.result.toUpperCase()}</Badge>
            </TableCell>
            <TableCell>
              <Link href={`/dashboard/matches/${match.id}`} className="font-medium text-foreground hover:underline">
                {match.map}
              </Link>
              <p className="text-xs text-muted-foreground">{match.scoreline}</p>
            </TableCell>
            <TableCell>{match.agent}</TableCell>
            <TableCell>
              {match.kda.kills}/{match.kda.deaths}/{match.kda.assists}
            </TableCell>
            <TableCell>{match.performance.combatScore}</TableCell>
            <TableCell className="text-muted-foreground">{formatMatchDate(match.playedAtIso)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
