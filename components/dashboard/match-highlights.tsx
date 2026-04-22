import { Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchHighlight } from "@/types/domain";

interface MatchHighlightsProps {
  highlights: MatchHighlight[];
}

export function MatchHighlights({ highlights }: MatchHighlightsProps) {
  if (!highlights.length) return null;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {highlights.map((highlight) => {
        const isBest = highlight.kind === "best";
        const Icon = isBest ? Sparkles : AlertTriangle;
        return (
          <div
            key={`${highlight.kind}-${highlight.roundNumber}`}
            className={cn(
              "relative overflow-hidden rounded-lg border p-4",
              isBest
                ? "border-success/30 bg-success/5"
                : "border-danger/30 bg-danger/5",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  isBest ? "bg-success/20 text-success" : "bg-danger/20 text-danger",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {isBest ? "Best round" : "Worst round"}
                </p>
                <p className="text-sm font-semibold text-foreground">Round {highlight.roundNumber}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{highlight.description}</p>
          </div>
        );
      })}
    </div>
  );
}
