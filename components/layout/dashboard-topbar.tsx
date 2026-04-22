import Link from "next/link";
import { BellDot, Link2, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppUser } from "@/types/domain";

interface DashboardTopbarProps {
  user: AppUser;
}

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  return (
    <div className="sticky top-0 z-30 flex flex-col gap-4 border-b border-border/70 bg-background/70 p-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex items-center gap-3">
        <Avatar initials={user.displayName} size="md" className="md:hidden" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Player profile
          </p>
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
            {user.displayName}
            <span className="font-mono text-sm text-muted-foreground">{user.tagline}</span>
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground md:flex">
          <Search className="h-3.5 w-3.5" aria-hidden />
          <span>Search matches…</span>
          <span className="ml-2 rounded border border-border px-1 font-mono text-[10px]">⌘K</span>
        </div>
        {user.accountLinked ? (
          <Badge variant="success">Riot Linked</Badge>
        ) : (
          <Link href="/connect-riot">
            <Button variant="outline" size="sm">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Link Riot account</span>
              <span className="sm:hidden">Link</span>
            </Button>
          </Link>
        )}
        <button
          type="button"
          className="focus-ring relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notifications"
        >
          <BellDot className="h-4 w-4" aria-hidden />
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger animate-pulse-ring"
          />
        </button>
      </div>
    </div>
  );
}
