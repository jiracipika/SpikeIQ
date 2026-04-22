import { Link2, Activity, Target } from "lucide-react"

const steps = [
  {
    icon: Link2,
    title: "Connect your Riot ID",
    description:
      "Link your account in seconds. SpikeIQ imports your full competitive history automatically, no manual entry required.",
  },
  {
    icon: Activity,
    title: "We crunch every round",
    description:
      "Our engine breaks down every engagement, economy decision, and utility usage across agents, maps, and sides.",
  },
  {
    icon: Target,
    title: "Get actionable coaching",
    description:
      "Receive prioritized insights ranked by impact, so you know exactly what to work on before your next ranked session.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">How it works</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            From match log to match plan in three steps
          </h2>
        </div>

        <ol className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <li key={step.title} className="relative rounded-2xl border border-border bg-card p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background font-mono text-sm font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
