import {
  ArrowUpRight,
  Crosshair,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const previewStats = [
  { label: "Win rate", value: "57.4%", delta: "+3.2pp", good: true, icon: TrendingUp },
  { label: "Avg ACS", value: "241", delta: "+11", good: true, icon: Flame },
  { label: "K/D", value: "1.18", delta: "+0.06", good: true, icon: Crosshair },
  { label: "HS %", value: "27.9%", delta: "-1.1pp", good: false, icon: Sparkles },
];

const trend = [42, 46, 50, 48, 53, 57, 54, 58, 61, 59, 63, 66];

const previewMatches = [
  { result: "W", map: "Ascent", agent: "Sova", score: "13-9", acs: 261 },
  { result: "L", map: "Sunset", agent: "Skye", score: "10-13", acs: 212 },
  { result: "W", map: "Bind", agent: "KAY/O", score: "13-7", acs: 249 },
  { result: "W", map: "Lotus", agent: "Gekko", score: "13-11", acs: 234 },
];

const agentRows = [
  { agent: "Sova", winRate: 68, acs: 248, games: 14 },
  { agent: "KAY/O", winRate: 61, acs: 232, games: 9 },
  { agent: "Skye", winRate: 44, acs: 201, games: 7 },
];

export function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Soft underglow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -bottom-16 -top-10 rounded-[48px]"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 30%, hsl(var(--primary) / 0.10), transparent 70%)",
        }}
      />

      <div className="relative rounded-2xl border border-border bg-card/70 p-2 shadow-soft backdrop-blur">
        {/* Chrome */}
        <div className="flex items-center gap-1.5 border-b border-border/70 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">
            spikeiq.gg / dashboard
          </span>
          <span className="ml-auto hidden items-center gap-2 font-mono text-[10px] text-muted-foreground md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-ring" />
            synced · just now
          </span>
        </div>

        <div className="grid gap-3 p-3 md:grid-cols-[1fr_1.2fr]">
          {/* Left column */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {previewStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-border bg-background/50 p-3"
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>{s.label}</span>
                    <s.icon className="h-3 w-3" aria-hidden />
                  </div>
                  <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                    {s.value}
                  </p>
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

            <div className="rounded-lg border border-border bg-background/50 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Win rate · last 30 days</span>
                <span className="font-mono text-success">+12pp</span>
              </div>
              <Sparkline values={trend} />
            </div>

            <div className="rounded-lg border border-border bg-background/50">
              <div className="flex items-center justify-between border-b border-border/70 px-3 py-2 text-xs text-muted-foreground">
                <span>Top agents</span>
                <span className="font-mono">WR · ACS</span>
              </div>
              <ul className="divide-y divide-border/70">
                {agentRows.map((a) => (
                  <li key={a.agent} className="flex items-center gap-3 px-3 py-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-[11px] font-semibold text-foreground">
                      {a.agent.slice(0, 2)}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{a.agent}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {a.games} games
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "font-mono text-xs",
                          a.winRate >= 55
                            ? "text-success"
                            : a.winRate >= 48
                              ? "text-foreground"
                              : "text-danger",
                        )}
                      >
                        {a.winRate}%
                      </span>
                      <span className="w-10 text-right font-mono text-xs text-muted-foreground">
                        {a.acs}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-background/50">
              <div className="flex items-center justify-between border-b border-border/70 px-3 py-2 text-xs text-muted-foreground">
                <span>Recent matches</span>
                <span className="font-mono">score · ACS</span>
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
                    <span className="w-10 text-right font-mono text-xs text-foreground">
                      {m.acs}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-primary/40 bg-primary/[0.06] p-3 shadow-glow">
              <div className="flex items-center gap-2 text-xs text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                <span className="font-semibold uppercase tracking-wider">
                  Coaching insight · high impact
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-foreground">
                You lose more rounds on defense
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Defense round WR is 46% vs 54% on attack. Drill one anchor setup per
                map before your next ranked session — we projected +2.1 RR / week.
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-card/80 px-2 py-0.5">
                  <Target className="h-3 w-3" aria-hidden /> 14 rounds audited
                </span>
                <span className="font-mono">confidence · 0.82</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Attack RW" value="54%" tone="success" bar={54} />
              <MiniStat label="Defense RW" value="46%" tone="danger" bar={46} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating annotation chips */}
      <FloatingChip
        className="hidden md:flex md:-top-4 md:left-6"
        icon={TrendingUp}
        label="Tracking 12 metrics"
      />
      <FloatingChip
        className="hidden md:flex md:-bottom-4 md:right-6"
        icon={Sparkles}
        label="4 new insights"
        tone="primary"
      />
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
  bar,
}: {
  label: string;
  value: string;
  tone: "success" | "danger" | "primary";
  bar: number;
}) {
  const track =
    tone === "success" ? "bg-success/15" : tone === "danger" ? "bg-danger/15" : "bg-primary/15";
  const fill =
    tone === "success" ? "bg-success" : tone === "danger" ? "bg-danger" : "bg-primary";
  const text =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-primary";
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span className={cn("font-mono", text)}>{value}</span>
      </div>
      <div className={cn("mt-2 h-1.5 w-full overflow-hidden rounded-full", track)}>
        <div
          className={cn("h-full rounded-full", fill)}
          style={{ width: `${bar}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function FloatingChip({
  icon: Icon,
  label,
  className,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  className?: string;
  tone?: "default" | "primary";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs backdrop-blur",
        tone === "primary"
          ? "border-primary/40 bg-primary/10 text-primary shadow-glow"
          : "border-border bg-card/80 text-muted-foreground shadow-soft",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
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
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-2 h-16 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
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
