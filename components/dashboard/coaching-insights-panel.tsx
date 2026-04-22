import { BrainCircuit, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightCard } from "@/components/dashboard/insight-card";
import { EmptyState } from "@/components/common/empty-state";
import type { CoachingInsight } from "@/types/domain";

interface CoachingInsightsPanelProps {
  insights: CoachingInsight[];
  limit?: number;
}

export function CoachingInsightsPanel({ insights, limit }: CoachingInsightsPanelProps) {
  const visible = typeof limit === "number" ? insights.slice(0, limit) : insights;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BrainCircuit className="h-4 w-4" aria-hidden />
          </span>
          <CardTitle className="text-base">Coaching Insights</CardTitle>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" aria-hidden />
          AI-generated
        </span>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {visible.length === 0 ? (
          <EmptyState
            icon={BrainCircuit}
            title="No insights yet"
            description="Play a few ranked matches — SpikeIQ will surface personalized coaching notes here."
          />
        ) : (
          visible.map((insight) => <InsightCard key={insight.id} insight={insight} />)
        )}
      </CardContent>
    </Card>
  );
}
