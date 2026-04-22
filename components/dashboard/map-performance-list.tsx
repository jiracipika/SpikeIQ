import { Badge } from "@/components/ui/badge";
import type { MapPerformance } from "@/types/domain";

interface MapPerformanceListProps {
  maps: MapPerformance[];
}

export function MapPerformanceList({ maps }: MapPerformanceListProps) {
  return (
    <div className="space-y-3">
      {maps.map((map) => (
        <div key={map.map} className="rounded-md border border-border bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-foreground">{map.map}</h3>
            <Badge variant={map.winRate >= 55 ? "success" : map.winRate >= 50 ? "warning" : "danger"}>
              {map.winRate.toFixed(1)}%
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>Matches: {map.matches}</span>
            <span>Atk WR: {map.attackRoundWinRate.toFixed(1)}%</span>
            <span>Def WR: {map.defenseRoundWinRate.toFixed(1)}%</span>
            <span>Overall WR: {map.winRate.toFixed(1)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
