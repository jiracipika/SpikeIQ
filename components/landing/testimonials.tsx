import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "SpikeIQ spotted that I was losing 63% of my 2v2 post-plants on B Haven. Two weeks later that number is 41%. It just works.",
    author: "Kaito N.",
    role: "Immortal 2 Duelist",
  },
  {
    quote:
      "The round breakdown is insane. I can finally see where my team leaks economy and translate it into IGL calls that actually stick.",
    author: "Mira S.",
    role: "Diamond 3 IGL",
  },
  {
    quote:
      "Every coaching insight comes with the round it happened in. No more guessing — I queue up the clip, learn, and move on.",
    author: "Leon K.",
    role: "Ascendant Sentinel",
  },
]

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Loved by climbers</p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Rank up with players who take the tac side seriously
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.author}
            className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-8"
          >
            <Quote className="h-6 w-6 text-primary" aria-hidden />
            <blockquote className="mt-6 text-pretty text-base leading-relaxed text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-8 border-t border-border pt-4">
              <div className="font-medium text-foreground">{t.author}</div>
              <div className="text-sm text-muted-foreground">{t.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
