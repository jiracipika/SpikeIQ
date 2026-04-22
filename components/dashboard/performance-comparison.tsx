import { cn } from "@/lib/utils";
import type { PerformanceBenchmark } from "@/types/domain";

interface PerformanceComparisonProps {
  benchmarks: PerformanceBenchmark[];
}

function formatValue(b: PerformanceBenchmark, v: number) {
  if (b.unit === "percent") return `${v.toFixed(1)}%`;
  if (b.unit === "ratio") return v.toFixed(2);
  return Math.round(v).toString();
}

export function PerformanceComparison({ benchmarks }: PerformanceComparisonProps) {
  if (!benchmarks.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {benchmarks.map((b) => {
        const max = Math.max(b.playerValue, b.averageValue) * 1.25 || 1;
        const playerPct = (b.playerValue / max) * 100;
        const avgPct = (b.averageValue / max) * 100;
        const delta = b.playerValue - b.averageValue;
        const isAbove = delta >= 0;
        return (
          <div key={b.metric} className="rounded-lg border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{b.label}</p>
              <span
                className={cn(
                  "text-xs font-medium",
                  isAbove ? "text-success" : "text-danger",
                )}
              >
                {isAbove ? "+" : ""}
                {formatValue(b, delta)} vs rank avg
              </span>
            </div>
            <div className="mt-3 space-y-2">
              <Bar
                label="You"
                value={b.playerValue}
                pct={playerPct}
                formatted={formatValue(b, b.playerValue)}
                color="bg-primary"
                strong
              />
              <Bar
                label="Rank avg"
                value={b.averageValue}
                pct={avgPct}
                formatted={formatValue(b, b.averageValue)}
                color="bg-muted-foreground/40"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Bar({
  label,
  pct,
  formatted,
  color,
  strong,
}: {
  label: string;
  value: number;
  pct: number;
  formatted: string;
  color: string;
  strong?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</span>
        <span className={cn("font-mono", strong ? "text-foreground" : "text-muted-foreground")}>
          {formatted}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}
