"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Link2, Settings2, ShieldCheck, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/matches", label: "Match History", icon: Swords },
  { href: "/connect-riot", label: "Connect Riot", icon: Link2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2 },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-card/50 p-4 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold text-foreground">ValorLab Analytics</span>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
