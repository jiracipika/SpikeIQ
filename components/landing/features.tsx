import {
  BarChart3,
  BrainCircuit,
  Crosshair,
  LineChart,
  Map,
  ShieldAlert,
} from "lucide-react";

const features = [
  {
    icon: LineChart,
    title: "Win rate momentum",
    description:
      "Confidence spikes and slumps, surfaced across your last 30 days. Built for ranked sessions — not vanity stats.",
    accent: "Trend",
  },
  {
    icon: Crosshair,
    title: "Agent mastery",
    description:
      "Know exactly which agent to lock. Win rate, K/D, and ACS broken down by role, map pool, and comp.",
    accent: "Per-agent",
  },
  {
    icon: Map,
    title: "Map-level edges",
    description:
      "Attack vs defense round WR per map, so you queue where you already have an advantage — and avoid where you don't.",
    accent: "Per-map",
  },
  {
    icon: BrainCircuit,
    title: "Coaching insights",
    description:
      "Plain-English takes on what to fix next — entry timing, retake discipline, session tilt, post-plant positioning.",
    accent: "AI-assisted",
  },
  {
    icon: ShieldAlert,
    title: "Tilt guardrails",
    description:
      "A quiet nudge when your win rate craters after back-to-back losses. Queue smarter, not longer.",
    accent: "Session health",
  },
  {
    icon: BarChart3,
    title: "Benchmarks that matter",
    description:
      "Every stat is compared against your rank average. Real signal, not noise — and no vanity KDA for clout.",
    accent: "Rank-aware",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-28"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Analytics that translate to RR
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
          Every stat is a decision you can make next game.
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
          We obsess over signal. SpikeIQ highlights the few things actually holding
          you back — so you can stop scrolling and start improving.
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group relative overflow-hidden rounded-xl border border-border bg-card/60 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(420px circle at 50% -10%, hsl(var(--primary) / 0.10), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {feature.accent}
                </span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
