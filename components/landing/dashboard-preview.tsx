import { ArrowUpRight, Crosshair, Flame, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const previewStats = [
  { label: "Win rate", value: "56.7%", delta: "+3.2pp", good: true, icon: TrendingUp },
  { label: "Avg ACS", value: "236", delta: "+8", good: true, icon: Flame },
  { label: "K/D", value: "1.18", delta: "+0.06", good: true, icon: Crosshair },
  { label: "HS %", value: "27.9%", delta: "-1.1pp", good: false, icon: Sparkles },
];

const trend = [42, 46, 50, 48, 53, 57, 54, 58, 61, 59, 63, 66];

const previewMatches = [
  { result: "W", map: "Ascent", agent: "Sova", score: "13-9", acs: 261 },
  { result: "L", map: "Sunset", agent: "Skye", score: "10-13", acs: 212 },
  { result: "W", map: "Bind", agent: "KAY/O", score: "13-7", acs: 249 },
];

export function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="rounded-2xl border border-border bg-card/60 p-2 shadow-soft backdrop-blur">
        <div className="flex items-center gap-1.5 border-b border-border/70 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">
            spikeiq.gg / dashboard
          </span>
        </div>
        <div className="grid gap-3 p-3 md:grid-cols-[1fr_1.2fr]">
          {/* Left: stats + sparkline */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {previewStats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>{s.label}</span>
                    <s.icon className="h-3 w-3" aria-hidden />
                  </div>
                  <p className="mt-1 font-mono text-lg font-semibold text-foreground">{s.value}</p>
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      s.good ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
                    )}
                  >
                    <ArrowUpRight className={cn("h-3 w-3", !s.good && "rotate-90")} aria-hidden />
                    {s.delta}
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Win rate trend</span>
                <span className="font-mono text-success">+12pp · 14 days</span>
              </div>
              <Sparkline values={trend} />
            </div>
          </div>

          {/* Right: match list + insight */}
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-background/40">
              <div className="flex items-center justify-between border-b border-border/70 px-3 py-2 text-xs text-muted-foreground">
                <span>Recent matches</span>
                <span>Last 24h</span>
              </div>
              <div className="divide-y divide-border/70">
                {previewMatches.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    <Badge variant={m.result === "W" ? "success" : "danger"}>
                      {m.result === "W" ? "WIN" : "LOSS"}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{m.map}</p>
                      <p className="text-[11px] text-muted-foreground">{m.agent}</p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{m.score}</span>
                    <span className="w-10 text-right font-mono text-xs text-foreground">{m.acs}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center gap-2 text-xs text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                <span className="font-semibold uppercase tracking-wider">Coaching insight</span>
              </div>
              <p className="mt-1 text-sm font-medium text-foreground">
                You lose more rounds on defense
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Your defense round win rate is 46% vs 54% on attack. Drill one anchor setup per map before your next ranked session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const w = 100;
  const h = 36;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-16 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#sparkGrad)" />
    </svg>
  );
}
