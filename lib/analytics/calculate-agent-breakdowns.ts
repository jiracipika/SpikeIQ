import type { Role } from "@/types/domain";
import type { AgentBreakdown, AnalyticsMatchInput } from "./types";
import { mean, percent, round, safeDiv } from "./utils";

export function calculateAgentBreakdowns(matches: AnalyticsMatchInput[]): AgentBreakdown[] {
  if (matches.length === 0) return [];

  const grouped = new Map<string, { agent: string; role: Role; items: AnalyticsMatchInput[] }>();
  for (const m of matches) {
    const key = m.agent;
    const existing = grouped.get(key);
    if (existing) existing.items.push(m);
    else grouped.set(key, { agent: m.agent, role: m.role, items: [m] });
  }

  return Array.from(grouped.values())
    .map(({ agent, role, items }) => {
      const wins = items.filter((m) => m.won).length;
      const totalKills = items.reduce((a, m) => a + m.kills, 0);
      const totalDeaths = items.reduce((a, m) => a + m.deaths, 0);
      return {
        agent,
        role,
        matches: items.length,
        wins,
        winRate: percent(wins, items.length),
        kdRatio: round(safeDiv(totalKills, Math.max(totalDeaths, 1)), 2),
        avgKills: round(mean(items.map((m) => m.kills)), 1),
        avgDeaths: round(mean(items.map((m) => m.deaths)), 1),
        avgAssists: round(mean(items.map((m) => m.assists)), 1),
        avgAdr: round(mean(items.map((m) => m.adr)), 1),
        avgAcs: Math.round(mean(items.map((m) => m.acs))),
      } satisfies AgentBreakdown;
    })
    .sort((a, b) => b.matches - a.matches || b.winRate - a.winRate);
}
