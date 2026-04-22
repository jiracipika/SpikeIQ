import { cn } from "@/lib/utils";
import type { MatchRound } from "@/types/domain";

interface RoundBreakdownProps {
  rounds: MatchRound[];
}

const buyAbbr: Record<MatchRound["buyType"], string> = {
  pistol: "P",
  eco: "E",
  force: "F",
  "full-buy": "FB",
  bonus: "B",
};

export function RoundBreakdown({ rounds }: RoundBreakdownProps) {
  if (!rounds.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Per-round telemetry will appear here once Riot data sync is enabled.
      </p>
    );
  }

  const firstHalf = rounds.slice(0, 12);
  const secondHalf = rounds.slice(12);

  return (
    <div className="space-y-4">
      <Half label="First half" rounds={firstHalf} />
      <Half label="Second half" rounds={secondHalf} />
      <Legend />
    </div>
  );
}

function Half({ label, rounds }: { label: string; rounds: MatchRound[] }) {
  if (rounds.length === 0) return null;
  const firstSide = rounds[0]?.side;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {label} · <span className="capitalize text-foreground">{firstSide}</span>
        </span>
        <span>
          {rounds.filter((r) => r.winner === "player").length}–{rounds.filter((r) => r.winner === "enemy").length}
        </span>
      </div>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
        {rounds.map((round) => (
          <RoundTile key={round.roundNumber} round={round} />
        ))}
      </div>
    </div>
  );
}

function RoundTile({ round }: { round: MatchRound }) {
  const win = round.winner === "player";
  return (
    <div
      title={`Round ${round.roundNumber} · ${win ? "Won" : "Lost"} · ${round.buyType} · ${round.playerKills} kill${round.playerKills === 1 ? "" : "s"}${round.highlight ? ` · ${round.highlight}` : ""}`}
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center rounded-md border text-[10px] font-mono",
        win
          ? "border-success/30 bg-success/15 text-success"
          : "border-danger/30 bg-danger/15 text-danger",
      )}
    >
      <span className="leading-none">{round.roundNumber}</span>
      <span className="mt-0.5 text-[9px] opacity-70">{buyAbbr[round.buyType]}</span>
      {round.highlight ? (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-primary shadow-glow"
        />
      ) : null}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
      <LegendItem label="Won round" className="border-success/30 bg-success/15 text-success" />
      <LegendItem label="Lost round" className="border-danger/30 bg-danger/15 text-danger" />
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" /> highlight (FB / clutch / multi-kill)
      </span>
      <span className="font-mono">P pistol · E eco · F force · FB full-buy · B bonus</span>
    </div>
  );
}

function LegendItem({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded border", className)} />
      {label}
    </span>
  );
}
