import { Progress } from "@/components/ui/progress";
import { cn, formatPercent } from "@/lib/utils";
import type { AgentPerformance } from "@/types/domain";

interface AgentPerformanceCardProps {
  agent: AgentPerformance;
  className?: string;
}

const roleAccent: Record<AgentPerformance["role"], string> = {
  duelist: "from-danger/25 via-danger/10",
  initiator: "from-primary/25 via-primary/10",
  controller: "from-chart-5/25 via-chart-5/10",
  sentinel: "from-success/25 via-success/10",
};

export function AgentPerformanceCard({ agent, className }: AgentPerformanceCardProps) {
  const wrColor =
    agent.winRate >= 60 ? "text-success" : agent.winRate >= 50 ? "text-foreground" : "text-danger";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card/60 p-4 transition-colors hover:border-border/80",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-60",
          roleAccent[agent.role],
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">{agent.agent}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
            {agent.role} · {agent.matches} matches
          </p>
        </div>
        <div className="text-right">
          <p className={cn("font-mono text-lg font-semibold", wrColor)}>
            {formatPercent(agent.winRate)}
          </p>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Win rate</p>
        </div>
      </div>
      <div className="relative mt-3 space-y-2">
        <Progress value={agent.winRate} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            K/D <span className="font-mono text-foreground">{agent.kdRatio.toFixed(2)}</span>
          </span>
          <span>
            ACS <span className="font-mono text-foreground">{agent.avgAcs}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
