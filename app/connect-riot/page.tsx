import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Link2,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/common/brand-mark";
import { SUPPORTED_REGIONS, isMockMode, type RiotRegion } from "@/lib/riot/config";
import { getConnectedRiotAccount } from "@/lib/riot/store";
import { RiotConnectForm } from "@/components/riot/riot-connect-form";

type Status = "success" | "error" | "disconnected" | null;

interface ConnectRiotPageProps {
  searchParams: Promise<{ status?: string; code?: string; region?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  unauthenticated: "Your session expired before Riot returned. Sign in and try again.",
  missing_params: "Riot didn't return the expected data. Please restart the connection flow.",
  state_mismatch:
    "Security check failed (state mismatch). For your safety we cancelled the link. Please try again.",
  token_exchange_failed: "We couldn't exchange the authorization code with Riot. Please retry.",
  identity_failed: "Authorized, but we couldn't read your Riot identity. Please retry.",
  persist_failed: "Authorized, but saving the link to your account failed. Please retry.",
  riot_denied: "You cancelled the authorization on Riot's site.",
};

export default async function ConnectRiotPage({ searchParams }: ConnectRiotPageProps) {
  const params = await searchParams;
  const status = (params.status as Status) ?? null;
  const errorCode = params.code;
  const mock = isMockMode();

  const account = await getConnectedRiotAccount();
  const defaultRegion = (SUPPORTED_REGIONS.includes(params.region as RiotRegion)
    ? params.region
    : account?.region ?? "NA") as RiotRegion;

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
          Back to dashboard
        </Link>
      </header>

      <main className="relative mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_1fr] md:px-6">
        <div className="space-y-4">
          {status === "success" && account ? (
            <ConnectedCard account={account} mock={mock} />
          ) : status === "error" ? (
            <ErrorCard reason={errorCode ? ERROR_MESSAGES[errorCode] ?? null : null} />
          ) : null}

          {status === "disconnected" ? (
            <Card className="border-border/70">
              <CardContent className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Riot account disconnected. You can reconnect any time.
              </CardContent>
            </Card>
          ) : null}

          {account && status !== "success" ? (
            <ConnectedCard account={account} variant="existing" mock={mock} />
          ) : null}

          {!account ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Link2 className="h-4 w-4" aria-hidden />
                  </span>
                  <CardTitle className="text-xl">Connect your Riot account</CardTitle>
                </div>
                <CardDescription>
                  Link once and SpikeIQ will keep your match history, stats, and coaching
                  insights up to date automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <RiotConnectForm defaultRegion={defaultRegion} mock={mock} />

                <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <Lock className="h-4 w-4 text-primary" aria-hidden />
                    What happens next
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>
                      · You&apos;ll be redirected to Riot&apos;s secure login (no password stored
                      here).
                    </li>
                    <li>· We import your last 20 competitive matches to build your baseline.</li>
                    <li>· You can disconnect anytime from Settings in two clicks.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

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
              <FeatureRow
                title="Full match history"
                description="Every competitive match, not just the last 20."
              />
              <FeatureRow
                title="Round-level analysis"
                description="Per-round buy types, highlights, and outcomes."
              />
              <FeatureRow
                title="Auto-sync"
                description="New matches appear in SpikeIQ within a few minutes."
              />
              <FeatureRow
                title="Personalized insights"
                description="Coaching notes tuned to your playstyle."
              />
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
                SpikeIQ is read-only and never sees your Riot password. We don&apos;t share your
                data with third parties, and your profile defaults to private.
              </p>
            </CardContent>
          </Card>

          {mock ? (
            <Card className="border-warning/40 bg-warning/10">
              <CardContent className="py-4 text-xs text-foreground/80">
                <p className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" aria-hidden />
                  Demo mode
                </p>
                <p className="mt-1 text-muted-foreground">
                  Real Riot credentials aren&apos;t configured on this deployment, so the connect
                  flow uses a simulated account so you can preview the end-to-end experience.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function ConnectedCard({
  account,
  variant = "just-linked",
  mock = false,
}: {
  account: { gameName: string; tagLine: string; region: string; isVerified: boolean };
  variant?: "just-linked" | "existing";
  mock?: boolean;
}) {
  return (
    <Card className="border-success/40 bg-success/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-success/15 text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          </span>
          <CardTitle className="text-lg">
            {variant === "just-linked" ? "Riot account connected" : "You&apos;re already connected"}
          </CardTitle>
        </div>
        <CardDescription>
          {variant === "just-linked"
            ? "We&apos;re importing your match history now. Your dashboard will populate shortly."
            : "We&apos;re syncing your match history in the background."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/10 text-success">
            <Link2 className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {account.gameName}
              <span className="ml-1 font-mono text-muted-foreground">#{account.tagLine}</span>
            </p>
            <p className="text-xs text-muted-foreground">Region {account.region}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden /> Linked
          </Badge>
          {mock ? <Badge variant="warning">Demo mode</Badge> : null}
          <Link href="/dashboard">
            <Button size="sm">
              Go to dashboard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <form action="/api/riot/disconnect" method="post">
            <Button type="submit" variant="ghost" size="sm" className="text-danger hover:text-danger">
              Disconnect
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorCard({ reason }: { reason: string | null }) {
  return (
    <Card className="border-danger/40 bg-danger/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-danger/15 text-danger">
            <AlertTriangle className="h-4 w-4" aria-hidden />
          </span>
          <CardTitle className="text-lg">We couldn&apos;t link your Riot account</CardTitle>
        </div>
        <CardDescription>{reason ?? "Something went wrong. Please try again."}</CardDescription>
      </CardHeader>
    </Card>
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
