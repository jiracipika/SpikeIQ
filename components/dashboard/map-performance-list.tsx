import { MapPerformanceCard } from "@/components/dashboard/map-performance-card";
import { EmptyState } from "@/components/common/empty-state";
import { Map } from "lucide-react";
import type { MapPerformance } from "@/types/domain";

interface MapPerformanceListProps {
  maps: MapPerformance[];
}

export function MapPerformanceList({ maps }: MapPerformanceListProps) {
  if (maps.length === 0) {
    return (
      <EmptyState
        icon={Map}
        title="No map stats yet"
        description="Map-level performance shows up after a handful of completed competitive matches."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {maps.map((map) => (
        <MapPerformanceCard key={map.map} map={map} />
      ))}
    </div>
  );
}
