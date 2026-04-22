import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  delta?: number;
  deltaSuffix?: string;
  /** If true, a negative delta is interpreted as "good" (e.g. avg death time). */
  invertDelta?: boolean;
  icon?: LucideIcon;
}

export function StatCard({
  label,
  value,
  helper,
  delta,
  deltaSuffix,
  invertDelta,
  icon: Icon,
}: StatCardProps) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const isPositive = hasDelta ? delta! > 0 : false;
  const isNeutral = hasDelta ? delta === 0 : false;
  const good = hasDelta ? (invertDelta ? !isPositive : isPositive) : false;

  return (
    <Card className="group relative overflow-hidden transition-colors hover:border-border/80">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(500px circle at 0% 0%, hsl(var(--primary) / 0.08), transparent 60%)",
        }}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        {Icon ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
        ) : null}
      </CardHeader>
      <CardContent className="relative">
        <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          {hasDelta && !isNeutral ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                good ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              ) : (
                <ArrowDownRight className="h-3 w-3" aria-hidden />
              )}
              {Math.abs(delta!).toFixed(Math.abs(delta!) < 1 ? 2 : 1)}
              {deltaSuffix ?? ""}
            </span>
          ) : null}
          {helper ? <span className="text-muted-foreground">{helper}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
