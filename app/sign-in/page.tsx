import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/common/brand-mark";
import { SignInForm } from "@/components/auth/sign-in-form";

interface SignInPageProps {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { redirectTo, error } = await searchParams;

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

        <SignInForm redirectTo={redirectTo} initialError={error} />

        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our Terms and Privacy Policy. Not endorsed by Riot Games.
        </p>
      </div>
    </div>
  );
}
