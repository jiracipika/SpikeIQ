import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MapPerformance } from "@/types/domain";

interface MapPerformanceCardProps {
  map: MapPerformance;
  className?: string;
}

function sideColor(value: number) {
  if (value >= 55) return "bg-success";
  if (value >= 50) return "bg-primary";
  if (value >= 45) return "bg-warning";
  return "bg-danger";
}

export function MapPerformanceCard({ map, className }: MapPerformanceCardProps) {
  const variant = map.winRate >= 55 ? "success" : map.winRate >= 48 ? "warning" : "danger";
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card/60 p-4 transition-colors hover:border-border/80",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{map.map}</h3>
          <p className="text-xs text-muted-foreground">{map.matches} matches played</p>
        </div>
        <Badge variant={variant}>
          <span className="font-mono">{map.winRate.toFixed(1)}%</span>
        </Badge>
      </div>

      <div className="grid gap-2">
        <SideBar label="Attack" value={map.attackRoundWinRate} colorClass={sideColor(map.attackRoundWinRate)} />
        <SideBar label="Defense" value={map.defenseRoundWinRate} colorClass={sideColor(map.defenseRoundWinRate)} />
      </div>
    </div>
  );
}

function SideBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label} round WR</span>
        <span className="font-mono text-foreground">{value.toFixed(1)}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
