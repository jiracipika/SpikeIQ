import { Compass, Gauge, Quote, Zap } from "lucide-react";

const outcomes = [
  {
    icon: Zap,
    title: "Improve faster",
    description:
      "Fewer hours of mindless queueing. More hours pointed at the thing that actually raises your ceiling.",
    proof: "+3.2 RR / week median gain on the beta",
  },
  {
    icon: Compass,
    title: "Identify weaknesses",
    description:
      "Know your worst map, your bleeding side, and the agent that's dragging your average. No guessing.",
    proof: "12 metrics benchmarked against your rank",
  },
  {
    icon: Gauge,
    title: "Track progress",
    description:
      "Trend lines, deltas, and streak detection so improvement becomes visible — not a feeling.",
    proof: "Rolling 30-day and per-session deltas",
  },
];

const quotes = [
  {
    quote:
      "SpikeIQ spotted that I was losing 63% of my 2v2 post-plants on B Haven. Two weeks later that number is 41%.",
    author: "Kaito N.",
    role: "Immortal 2 · Duelist",
  },
  {
    quote:
      "The round breakdown is insane. I finally see where we leak economy and translate it into IGL calls that stick.",
    author: "Mira S.",
    role: "Diamond 3 · IGL",
  },
  {
    quote:
      "Every insight comes with the round it happened in. No more guessing — I queue the clip, learn, and move on.",
    author: "Leon K.",
    role: "Ascendant · Sentinel",
  },
];

export function Outcomes() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Why players use it
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
          Built for the climb, not the clout.
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
          SpikeIQ replaces vanity stats with outcomes. Every view in the product is
          designed around one question: what should I do differently next game?
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {outcomes.map((o) => (
          <article
            key={o.title}
            className="group relative overflow-hidden rounded-xl border border-border bg-card/70 p-7 transition-colors hover:border-primary/30"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
              <o.icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{o.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {o.description}
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-md border border-border bg-background/50 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
              <span className="font-mono text-[11px] text-foreground/80">{o.proof}</span>
            </div>
          </article>
        ))}
      </div>

      {/* Quote strip */}
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {quotes.map((q) => (
          <figure
            key={q.author}
            className="flex h-full flex-col justify-between rounded-xl border border-border bg-card/60 p-6"
          >
            <Quote className="h-5 w-5 text-primary" aria-hidden />
            <blockquote className="mt-4 text-pretty text-sm leading-relaxed text-foreground">
              &ldquo;{q.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
              <div className="text-sm font-medium text-foreground">{q.author}</div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {q.role}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
