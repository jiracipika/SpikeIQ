import Link from "next/link"
import { BrandMark } from "@/components/common/brand-mark"

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col gap-3">
          <BrandMark />
          <p className="max-w-md text-sm text-muted-foreground">
            SpikeIQ is an independent analytics companion for VALORANT players. Not endorsed by Riot Games.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/sign-in" className="hover:text-foreground">
            Sign in
          </Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-muted-foreground lg:px-8">
          <span>&copy; {new Date().getFullYear()} SpikeIQ Labs</span>
          <span className="font-mono uppercase tracking-[0.18em]">v1.0 beta</span>
        </div>
      </div>
    </footer>
  )
}
