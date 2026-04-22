import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandMark } from "@/components/common/brand-mark";

export default function SignUpSuccessPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative w-full max-w-md space-y-6">
        <div className="flex items-center justify-center">
          <Link href="/" aria-label="SpikeIQ home" className="focus-ring rounded-md">
            <BrandMark />
          </Link>
        </div>

        <Card className="shadow-soft">
          <CardHeader className="items-center text-center">
            <span className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" aria-hidden />
            </span>
            <CardTitle className="text-xl">Check your inbox</CardTitle>
            <CardDescription>
              We sent a confirmation link to your email. Click it to activate your account and jump
              into your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Tip: if you do not see the email within a minute, check your spam folder. The link is
              valid for 24 hours.
            </p>
            <Link href="/sign-in" className="block">
              <Button variant="outline" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
