import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/utils";
import type { AgentPerformance } from "@/types/domain";

interface AgentPerformanceListProps {
  agents: AgentPerformance[];
}

export function AgentPerformanceList({ agents }: AgentPerformanceListProps) {
  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <div key={agent.agent} className="rounded-md border border-border bg-muted/20 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{agent.agent}</p>
              <p className="text-xs text-muted-foreground">
                {agent.role} • {agent.matches} matches
              </p>
            </div>
            <p className="text-sm font-medium text-foreground">K/D {agent.kdRatio.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Win Rate</span>
              <span>{formatPercent(agent.winRate)}</span>
            </div>
            <Progress value={agent.winRate} />
          </div>
        </div>
      ))}
    </div>
  );
}
