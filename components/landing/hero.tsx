import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[1000px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary) / 0.18), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-20 md:px-6 md:pb-16 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-ring" />
            Now in private beta · built for ranked grinders
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            Climb ranked with a{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-chart-3 bg-clip-text text-transparent">
              coach in your pocket.
            </span>
          </h1>
          <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            SpikeIQ turns your VALORANT match history into a focused improvement plan
            {" — "}win rate trends, agent mastery, map edges, and coaching-style insights
            you can action in your next queue.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/connect-riot">
              <Button size="lg" className="shadow-glow">
                Connect Riot account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                <PlayCircle className="h-4 w-4" />
                View live demo
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free forever for your last 20 matches · no credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
