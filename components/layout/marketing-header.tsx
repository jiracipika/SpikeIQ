import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/common/brand-mark";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#preview", label: "Dashboard" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="focus-ring rounded-md"
          aria-label="SpikeIQ home"
        >
          <BrandMark />
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-8 text-sm text-muted-foreground md:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button size="sm" className="shadow-glow">
              Get started
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
