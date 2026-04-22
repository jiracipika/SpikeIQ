import { Activity, Link2, Target } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Connect your Riot ID",
    description:
      "Link your account in seconds via read-only Riot OAuth. Your competitive history imports automatically — no manual entry.",
    meta: "~30 seconds",
  },
  {
    icon: Activity,
    title: "We crunch every round",
    description:
      "Our engine breaks down every engagement, economy decision, and utility usage across agents, maps, and sides.",
    meta: "Background sync",
  },
  {
    icon: Target,
    title: "Get actionable coaching",
    description:
      "Receive prioritized insights ranked by impact, so you know exactly what to work on before your next ranked session.",
    meta: "Session-ready",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-y border-border/70 bg-muted/20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            From match log to match plan in three steps.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
            No scrims to schedule. No VOD review rabbit holes. Just a clear read on
            what to work on next.
          </p>
        </div>

        <ol className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative overflow-hidden rounded-xl border border-border bg-card/70 p-7"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute right-3 top-3 font-mono text-[64px] font-semibold leading-none text-foreground/[0.04]"
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="relative flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background font-mono text-xs font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <step.icon className="h-4 w-4" aria-hidden />
                </span>
              </div>

              <h3 className="relative mt-6 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="relative mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
              <p className="relative mt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {step.meta}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
