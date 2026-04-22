import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CoachingInsight } from "@/types/domain";

interface CoachingInsightsPanelProps {
  insights: CoachingInsight[];
}

function priorityVariant(priority: CoachingInsight["priority"]) {
  if (priority === "high") return "danger" as const;
  if (priority === "medium") return "warning" as const;
  return "default" as const;
}

export function CoachingInsightsPanel({ insights }: CoachingInsightsPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Coaching Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={insight.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium text-foreground">{insight.title}</h3>
              <Badge variant={priorityVariant(insight.priority)}>{insight.priority}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
            <p className="text-sm text-foreground">Action: {insight.action}</p>
            {index !== insights.length - 1 ? <Separator className="mt-4" /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
