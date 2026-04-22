import { ShieldCheck, Trophy, Users } from "lucide-react";

const pills = [
  { icon: Trophy, label: "Radiant & Immortal duos" },
  { icon: Users, label: "Amateur esports rosters" },
  { icon: ShieldCheck, label: "NA · EU · KR · APAC" },
];

const stats = [
  { value: "2,400+", label: "Climbers on the beta" },
  { value: "180k", label: "Matches analyzed" },
  { value: "12 min", label: "Avg time to first insight" },
  { value: "+3.2 RR", label: "Median weekly gain" },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Trusted by ranked players"
      className="border-y border-border/70 bg-background/60"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="flex flex-col items-center gap-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Built with serious ranked players
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {pills.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground/80"
              >
                <p.icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                {p.label}
              </span>
            ))}
          </div>

          <dl className="mt-4 grid w-full grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border/80 md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center bg-card/70 px-4 py-6 text-center"
              >
                <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="mt-1.5 font-mono text-2xl font-semibold text-foreground md:text-3xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
