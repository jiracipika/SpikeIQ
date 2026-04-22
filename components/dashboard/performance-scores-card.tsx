import type { LucideIcon } from "lucide-react";
import { Activity, Flame, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PerformanceScores } from "@/lib/analytics/types";

interface PerformanceScoresCardProps {
  scores: PerformanceScores;
  className?: string;
}

interface ScoreMeta {
  key: keyof PerformanceScores;
  label: string;
  icon: LucideIcon;
  description: string;
  /** Treat 50 as neutral (e.g. improvement score) or 100 as max (others). */
  mode?: "max" | "centered";
}

const scoreMeta: ScoreMeta[] = [
  {
    key: "consistencyScore",
    label: "Consistency",
    icon: Activity,
    description: "Match-to-match ACS stability",
  },
  {
    key: "aggressionScore",
    label: "Aggression",
    icon: Flame,
    description: "Entry frags + first-blood rate",
  },
  {
    key: "survivabilityScore",
    label: "Survivability",
    icon: Shield,
    description: "Deaths per round + first-death rate",
  },
  {
    key: "improvementScore",
    label: "Improvement",
    icon: TrendingUp,
    description: "Last 10 vs prior 10 matches",
    mode: "centered",
  },
];

function toneFor(value: number, mode: ScoreMeta["mode"] = "max") {
  if (mode === "centered") {
    if (value >= 60) return "success" as const;
    if (value >= 45) return "neutral" as const;
    return "danger" as const;
  }
  if (value >= 70) return "success" as const;
  if (value >= 50) return "neutral" as const;
  return "danger" as const;
}

const toneStyles = {
  success: { bar: "bg-success", text: "text-success", track: "bg-success/15" },
  neutral: { bar: "bg-primary", text: "text-primary", track: "bg-primary/10" },
  danger: { bar: "bg-danger", text: "text-danger", track: "bg-danger/15" },
};

export function PerformanceScoresCard({ scores, className }: PerformanceScoresCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="text-base">Performance scores</CardTitle>
        <CardDescription>
          A higher score is better. Scores update every sync based on your recent games.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {scoreMeta.map((meta) => {
          const value = scores[meta.key];
          const tone = toneFor(value, meta.mode);
          const styles = toneStyles[tone];
          const Icon = meta.icon;
          return (
            <div
              key={meta.key}
              className="rounded-lg border border-border/70 bg-card/70 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md",
                      styles.track,
                      styles.text,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="text-sm font-medium text-foreground">{meta.label}</span>
                </div>
                <span className={cn("font-mono text-sm font-semibold", styles.text)}>
                  {value}
                  <span className="text-muted-foreground">/100</span>
                </span>
              </div>
              <div
                className={cn("mt-3 h-1.5 w-full overflow-hidden rounded-full", styles.track)}
                role="progressbar"
                aria-label={meta.label}
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={cn("h-full rounded-full transition-[width]", styles.bar)}
                  style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{meta.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
