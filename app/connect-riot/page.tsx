import Link from "next/link";
import { ArrowLeft, CheckCircle2, Link2, Lock, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/common/brand-mark";

export default function ConnectRiotPage() {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 md:px-6">
        <Link href="/" aria-label="SpikeIQ home" className="focus-ring rounded-md">
          <BrandMark />
        </Link>
        <Link
          href="/dashboard"
          className="focus-ring inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Skip for now
        </Link>
      </header>

      <main className="relative mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_1fr] md:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Link2 className="h-4 w-4" aria-hidden />
              </span>
              <CardTitle className="text-xl">Connect your Riot account</CardTitle>
            </div>
            <CardDescription>
              Link once and SpikeIQ will keep your match history, stats, and coaching insights up to date
              automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div className="space-y-1.5">
                <label htmlFor="riot-id" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Riot ID
                </label>
                <Input id="riot-id" placeholder="AimTheory" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="riot-tag" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tag
                </label>
                <Input id="riot-tag" placeholder="NA1" className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="region" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Region
                </label>
                <select
                  id="region"
                  className="focus-ring h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground"
                  defaultValue="NA"
                >
                  <option>NA</option>
                  <option>EU</option>
                  <option>AP</option>
                </select>
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <Lock className="h-4 w-4 text-primary" aria-hidden />
                What happens next
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>· You&apos;ll be redirected to Riot&apos;s secure login (no password stored here).</li>
                <li>· We import your last 20 competitive matches to build your baseline.</li>
                <li>· You can disconnect anytime from Settings in two clicks.</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="lg" className="shadow-glow">
                <Link2 className="h-4 w-4" />
                Authorize with Riot
              </Button>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Skip and browse demo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <CardTitle className="text-base">You&apos;ll unlock</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <FeatureRow title="Full match history" description="Every competitive match, not just the last 20." />
              <FeatureRow title="Round-level analysis" description="Per-round buy types, highlights, and outcomes." />
              <FeatureRow title="Auto-sync" description="New matches appear in SpikeIQ within a few minutes." />
              <FeatureRow title="Personalized insights" description="Coaching notes tuned to your playstyle." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Shield className="h-4 w-4" aria-hidden />
                </span>
                <CardTitle className="text-base">Privacy first</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                SpikeIQ is read-only and never sees your Riot password. We don&apos;t share your data with third
                parties, and your profile defaults to private.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function FeatureRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" aria-hidden />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
