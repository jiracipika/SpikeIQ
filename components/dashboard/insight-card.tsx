import type { LucideIcon } from "lucide-react";
import { Activity, Brain, Crosshair, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CoachingInsight } from "@/types/domain";

interface InsightCardProps {
  insight: CoachingInsight;
  className?: string;
}

const categoryIcon: Record<CoachingInsight["category"], LucideIcon> = {
  mechanics: Crosshair,
  macro: Map,
  consistency: Activity,
  mindset: Brain,
};

const categoryLabel: Record<CoachingInsight["category"], string> = {
  mechanics: "Mechanics",
  macro: "Macro",
  consistency: "Consistency",
  mindset: "Mindset",
};

function priorityVariant(priority: CoachingInsight["priority"]) {
  if (priority === "high") return "danger" as const;
  if (priority === "medium") return "warning" as const;
  return "default" as const;
}

export function InsightCard({ insight, className }: InsightCardProps) {
  const Icon = categoryIcon[insight.category];
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-3 rounded-lg border border-border bg-card/70 p-4 transition-colors hover:border-border/80",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {categoryLabel[insight.category]}
          </span>
        </div>
        <Badge variant={priorityVariant(insight.priority)} className="capitalize">
          {insight.priority}
        </Badge>
      </div>
      <div>
        <h3 className="text-sm font-semibold leading-tight text-foreground text-pretty">
          {insight.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {insight.description}
        </p>
      </div>
      <div className="rounded-md border border-border/70 bg-muted/30 p-3 text-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Recommended action
        </p>
        <p className="mt-1 text-foreground">{insight.action}</p>
      </div>
    </article>
  );
}
