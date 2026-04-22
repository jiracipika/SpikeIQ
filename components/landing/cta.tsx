import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.25]" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary) / 0.20), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center md:px-6 md:py-28">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-ring" />
          Invites opening weekly
        </div>

        <h2 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          Your next rank up is{" "}
          <span className="bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
            sitting in your VOD.
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground md:text-lg">
          Connect your Riot ID and SpikeIQ will surface the three biggest leaks in
          your gameplay within minutes.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/auth/sign-up">
            <Button size="lg" className="shadow-glow">
              Connect Riot account
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              View demo dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
            Read-only access · revoke anytime
          </span>
          <span>Free during beta · no credit card</span>
        </div>
      </div>
    </section>
  );
}
