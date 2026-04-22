import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Your next rank up is sitting in your VOD.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
          Connect your Riot ID and SpikeIQ will surface the three biggest leaks in your
          gameplay within minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/connect-riot">
            <Button size="lg">
              Connect Riot ID
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              View demo dashboard
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Free during beta. No credit card required.
        </p>
      </div>
    </section>
  );
}
