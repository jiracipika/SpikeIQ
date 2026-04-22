import Link from "next/link";
import { BellDot, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppUser } from "@/types/domain";

interface DashboardTopbarProps {
  user: AppUser;
}

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border bg-background/60 p-4 backdrop-blur md:flex-row md:items-center md:justify-between md:p-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Player profile</p>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {user.displayName} <span className="text-muted-foreground">{user.tagline}</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {user.accountLinked ? (
          <Badge variant="success">Riot Linked</Badge>
        ) : (
          <Link href="/connect-riot">
            <Button variant="outline" size="sm">
              <Link2 className="h-4 w-4" />
              Link Riot account
            </Button>
          </Link>
        )}
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <BellDot className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
