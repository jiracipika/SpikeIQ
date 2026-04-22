import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { valorantService } from "@/lib/services";

export default async function MatchHistoryPage() {
  const { matches } = await valorantService.getMatchHistoryPageData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Match History</h2>
        <p className="text-sm text-muted-foreground">Review your recent games and drill into match-level details.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentMatchesTable matches={matches} />
        </CardContent>
      </Card>
    </div>
  );
}
