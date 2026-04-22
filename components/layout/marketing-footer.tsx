import Link from "next/link";
import { BrandMark } from "@/components/common/brand-mark";

const nav = [
  {
    heading: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#how-it-works", label: "How it works" },
      { href: "#preview", label: "Dashboard" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/auth/sign-up", label: "Get started" },
      { href: "/sign-in", label: "Sign in" },
      { href: "/dashboard", label: "Demo dashboard" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "#", label: "Roadmap" },
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6 md:py-14">
        <div className="flex flex-col gap-4">
          <BrandMark />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            SpikeIQ is an independent analytics companion for VALORANT players.
            Not endorsed or affiliated with Riot Games.
          </p>
        </div>
        {nav.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {col.heading}
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-muted-foreground md:flex-row md:items-center md:px-6">
          <span>&copy; {new Date().getFullYear()} SpikeIQ Labs</span>
          <span className="font-mono uppercase tracking-[0.18em]">
            v1.0 · private beta
          </span>
        </div>
      </div>
    </footer>
  );
}
