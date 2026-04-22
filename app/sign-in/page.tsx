import Link from "next/link";
import { ArrowLeft, Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/common/brand-mark";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[360px] w-[720px] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(closest-side, hsl(var(--primary) / 0.15), transparent)",
        }}
      />
      <div className="relative w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="SpikeIQ home" className="focus-ring rounded-md">
            <BrandMark />
          </Link>
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-1 rounded-md text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden /> Back home
          </Link>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to view your personalized insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-center">
                <Github className="h-4 w-4" />
                Continue with GitHub
              </Button>
              <Button variant="outline" className="justify-center">
                <Mail className="h-4 w-4" />
                Continue with email code
              </Button>
            </div>

            <div className="relative py-1 text-center text-xs uppercase tracking-wider text-muted-foreground">
              <span
                aria-hidden
                className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-border"
              />
              <span className="bg-card px-2">or with password</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Email
                </label>
                <Input id="email" type="email" placeholder="you@spikeiq.gg" autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Password
                  </label>
                  <Link href="#" className="text-xs text-primary hover:text-primary/80">
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Link href="/connect-riot" className="block">
              <Button className="w-full" size="lg">
                Sign in
              </Button>
            </Link>

            <p className="text-center text-xs text-muted-foreground">
              New to SpikeIQ?{" "}
              <Link href="/connect-riot" className="text-primary hover:text-primary/80">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our Terms and Privacy Policy. Not endorsed by Riot Games.
        </p>
      </div>
    </div>
  );
}
