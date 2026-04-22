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
      "Spot confidence spikes and consistency drops across your last 30 days — tuned for ranked sessions, not vanity stats.",
  },
  {
    icon: Crosshair,
    title: "Agent mastery",
    description:
      "Know exactly which agent to lock. Win rate, K/D, and ACS broken down by role and comp.",
  },
  {
    icon: Map,
    title: "Map-level edges",
    description:
      "Attack vs defense round win rates per map so you queue where you already have an advantage.",
  },
  {
    icon: BrainCircuit,
    title: "Coaching insights",
    description:
      "Plain-English takes on what to fix next — entry timing, retake discipline, session tilt.",
  },
  {
    icon: ShieldAlert,
    title: "Tilt guardrails",
    description:
      "Get a gentle nudge when your win rate drops after back-to-back losses. Queue smarter.",
  },
  {
    icon: BarChart3,
    title: "Benchmarks that matter",
    description:
      "Every stat is compared against your rank average so you see real signal, not noise.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Analytics that translate to RR
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Every stat is a decision you can make next game.
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          We obsess over signal. SpikeIQ highlights the handful of things actually
          holding you back — so you can stop scrolling and start improving.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group relative overflow-hidden rounded-lg border border-border bg-card/60 p-6 transition-all hover:border-border/80 hover:bg-card"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(400px circle at 50% 0%, hsl(var(--primary) / 0.08), transparent 60%)",
              }}
            />
            <div className="relative">
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
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
