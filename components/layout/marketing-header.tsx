import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/common/brand-mark";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="focus-ring rounded-md" aria-label="SpikeIQ home">
          <BrandMark />
        </Link>
        <nav
          aria-label="Main"
          className="hidden items-center gap-8 text-sm text-muted-foreground md:flex"
        >
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#preview" className="transition-colors hover:text-foreground">
            Dashboard
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/connect-riot">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
