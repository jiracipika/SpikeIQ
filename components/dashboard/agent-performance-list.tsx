import { AgentPerformanceCard } from "@/components/dashboard/agent-performance-card";
import { EmptyState } from "@/components/common/empty-state";
import { Users } from "lucide-react";
import type { AgentPerformance } from "@/types/domain";

interface AgentPerformanceListProps {
  agents: AgentPerformance[];
}

export function AgentPerformanceList({ agents }: AgentPerformanceListProps) {
  if (agents.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No agent data yet"
        description="Queue a few competitive matches to populate agent performance stats."
      />
    );
  }

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <AgentPerformanceCard key={agent.agent} agent={agent} />
      ))}
    </div>
  );
}
