import Link from "next/link";
import { Home, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/common/brand-mark";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative">
        <BrandMark />
      </div>
      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Error · 404</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Round not found.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-muted-foreground">
          The page you&apos;re looking for got picked off in a crossfire. Head back to the dashboard
          and we&apos;ll regroup.
        </p>
      </div>
      <div className="relative flex flex-wrap items-center justify-center gap-2">
        <Link href="/dashboard">
          <Button>
            <Home className="h-4 w-4" />
            Back to dashboard
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">
            <Target className="h-4 w-4" />
            View landing page
          </Button>
        </Link>
      </div>
    </div>
  );
}
