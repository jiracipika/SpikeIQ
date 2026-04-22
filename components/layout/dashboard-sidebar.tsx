"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Link2, Settings2, Sparkles, Swords } from "lucide-react";
import { BrandMark } from "@/components/common/brand-mark";
import { cn } from "@/lib/utils";

const primary = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/matches", label: "Match History", icon: Swords },
];

const secondary = [
  { href: "/connect-riot", label: "Connect Riot", icon: Link2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2 },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card/40 p-4 lg:flex">
      <div className="mb-8 px-2">
        <Link href="/dashboard" className="focus-ring inline-flex rounded-md" aria-label="SpikeIQ home">
          <BrandMark />
        </Link>
      </div>

      <SectionLabel>Analytics</SectionLabel>
      <NavGroup items={primary} pathname={pathname} />

      <SectionLabel className="mt-6">Account</SectionLabel>
      <NavGroup items={secondary} pathname={pathname} />

      <div className="mt-auto rounded-lg border border-border bg-background/40 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          Upgrade to Pro
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Unlock VOD review, full match history, and advanced insights.
        </p>
        <Link
          href="#"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
        >
          <BookOpen className="h-3 w-3" aria-hidden />
          Learn more
        </Link>
      </div>
    </aside>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80",
        className,
      )}
    >
      {children}
    </p>
  );
}

function NavGroup({
  items,
  pathname,
}: {
  items: { href: string; label: string; icon: typeof BarChart3 }[];
  pathname: string;
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-ring relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive ? (
              <span
                aria-hidden
                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
              />
            ) : null}
            <Icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
