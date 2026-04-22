import Link from "next/link";
import { ArrowRight, Clock, Crosshair, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatMatchDate, formatPercent } from "@/lib/utils";
import type { ValorantMatch } from "@/types/domain";

interface MatchCardProps {
  match: ValorantMatch;
  className?: string;
}

export function MatchCard({ match, className }: MatchCardProps) {
  const isWin = match.result === "win";
  const kd = match.kda.deaths === 0 ? match.kda.kills : match.kda.kills / match.kda.deaths;

  return (
    <Link
      href={`/dashboard/matches/${match.id}`}
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card/70 p-4 transition-all hover:border-border/80 hover:bg-card",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          isWin ? "bg-success" : "bg-danger",
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={isWin ? "success" : "danger"}>
              {isWin ? "WIN" : "LOSS"}
            </Badge>
            <span className="font-mono text-sm text-foreground">{match.scoreline}</span>
          </div>
          <h3 className="mt-1.5 text-base font-semibold text-foreground">
            {match.map}
          </h3>
          <p className="text-xs text-muted-foreground">
            {match.agent} · <span className="capitalize">{match.role}</span> · {match.queue}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Metric
          icon={Target}
          label="KDA"
          value={`${match.kda.kills}/${match.kda.deaths}/${match.kda.assists}`}
          sub={`K/D ${kd.toFixed(2)}`}
        />
        <Metric icon={Crosshair} label="ACS" value={match.performance.combatScore.toString()} sub={`${formatPercent(match.hsPercentage)} HS`} />
        <Metric
          icon={Clock}
          label="Played"
          value={formatMatchDate(match.playedAtIso)}
          sub={match.durationMinutes ? `${match.durationMinutes}m` : undefined}
        />
      </div>
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </div>
      <p className="mt-1 truncate font-mono text-sm text-foreground">{value}</p>
      {sub ? <p className="truncate text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
