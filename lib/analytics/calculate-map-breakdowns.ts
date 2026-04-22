import type { AnalyticsMatchInput, AnalyticsRoundInput, MapBreakdown } from "./types";
import { mean, percent, round } from "./utils";

export function calculateMapBreakdowns(
  matches: AnalyticsMatchInput[],
  rounds: AnalyticsRoundInput[] = [],
): MapBreakdown[] {
  if (matches.length === 0) return [];

  // Index rounds by match id so we can segment side win rates per map.
  const roundsByMatch = new Map<string, AnalyticsRoundInput[]>();
  for (const r of rounds) {
    const list = roundsByMatch.get(r.matchId) ?? [];
    list.push(r);
    roundsByMatch.set(r.matchId, list);
  }

  const grouped = new Map<string, AnalyticsMatchInput[]>();
  for (const m of matches) {
    const list = grouped.get(m.map) ?? [];
    list.push(m);
    grouped.set(m.map, list);
  }

  return Array.from(grouped.entries())
    .map(([map, items]) => {
      const wins = items.filter((m) => m.won).length;

      // Build per-map round slice
      const mapRounds = items.flatMap((m) => roundsByMatch.get(m.id) ?? []);
      const atk = mapRounds.filter((r) => r.side === "attack");
      const def = mapRounds.filter((r) => r.side === "defense");

      return {
        map,
        matches: items.length,
        wins,
        winRate: percent(wins, items.length),
        attackRoundWinRate:
          atk.length > 0 ? percent(atk.filter((r) => r.won).length, atk.length) : 0,
        defenseRoundWinRate:
          def.length > 0 ? percent(def.filter((r) => r.won).length, def.length) : 0,
        avgKills: round(mean(items.map((m) => m.kills)), 1),
        avgDeaths: round(mean(items.map((m) => m.deaths)), 1),
        avgAssists: round(mean(items.map((m) => m.assists)), 1),
        avgAdr: round(mean(items.map((m) => m.adr)), 1),
        avgAcs: Math.round(mean(items.map((m) => m.acs))),
      } satisfies MapBreakdown;
    })
    .sort((a, b) => b.matches - a.matches || b.winRate - a.winRate);
}
