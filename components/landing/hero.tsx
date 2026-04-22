import Link from "next/link";
import { ArrowRight, PlayCircle, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.35]" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-120px] h-[620px] w-[1100px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary) / 0.22), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[380px] h-[320px] w-[720px] -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--chart-3) / 0.10), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-20 md:px-6 md:pb-16 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="#changelog"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-pulse-ring" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Private beta · 2,400+ climbers onboarded
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            See why you win.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-chart-3 bg-clip-text text-transparent">
              Fix why you lose.
            </span>
          </h1>

          <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            SpikeIQ is the coaching layer for VALORANT. We turn your match history
            into a personalized improvement plan{" — "}agent mastery, map edges, and
            round-level insights that translate directly to RR.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/sign-up">
              <Button size="lg" className="shadow-glow">
                Connect Riot account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                <PlayCircle className="h-4 w-4" />
                See live demo
              </Button>
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" aria-hidden />
              Read-only Riot OAuth
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              60-second setup
            </span>
            <span>Free in beta · no credit card</span>
          </div>
        </div>

        {/* Live metric strip — hints at the real product */}
        <div className="mx-auto mt-14 max-w-4xl">
          <LiveMetricStrip />
        </div>
      </div>
    </section>
  );
}

function LiveMetricStrip() {
  const chips = [
    { label: "Win rate", value: "57.4%", delta: "+3.2pp", good: true },
    { label: "Avg ACS", value: "241", delta: "+11", good: true },
    { label: "HS %", value: "27.9%", delta: "-1.1pp", good: false },
    { label: "Clutch rate", value: "34%", delta: "+5pp", good: true },
  ];
  return (
    <div
      role="group"
      aria-label="Live sample metrics"
      className="relative rounded-xl border border-border/80 bg-card/60 p-2 backdrop-blur"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-3 py-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-2 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-ring" />
          Live sample · synced 2m ago
        </span>
        <span className="font-mono">acs · kdr · hsr</span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-4">
        {chips.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-border bg-background/50 px-3 py-2.5"
          >
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{c.label}</span>
              <span
                className={
                  "font-mono " + (c.good ? "text-success" : "text-danger")
                }
              >
                {c.delta}
              </span>
            </div>
            <p className="mt-1 font-mono text-lg font-semibold text-foreground">
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
