import type {
  AnalyticsMatchInput,
  AnalyticsRoundInput,
  CoreMetrics,
  SideBreakdown,
  StreakContext,
} from "./types";
import { mean, percent, round, safeDiv, splitWindow } from "./utils";

/**
 * Expects `matches` ordered most-recent first.
 */
export function calculateCoreMetrics(
  matches: AnalyticsMatchInput[],
  rounds: AnalyticsRoundInput[] = [],
): CoreMetrics {
  if (matches.length === 0) {
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      recentWinRate: 0,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      kdRatio: 0,
      headshotPercent: 0,
      adr: 0,
      acs: 0,
      firstDeathRate: 0,
      openingDuelSuccessRate: 0,
      clutchRate: 0,
    };
  }

  const wins = matches.filter((m) => m.won).length;
  const losses = matches.length - wins;
  const totalKills = matches.reduce((a, m) => a + m.kills, 0);
  const totalDeaths = matches.reduce((a, m) => a + m.deaths, 0);

  const last10 = matches.slice(0, 10);
  const recentWinRate = percent(last10.filter((m) => m.won).length, last10.length);

  const { recent, prev } = splitWindow(matches, 10);
  const recentWr = percent(recent.filter((m) => m.won).length, recent.length);
  const prevWr = percent(prev.filter((m) => m.won).length, prev.length);
  const recentAcs = Math.round(mean(recent.map((m) => m.acs)));
  const prevAcs = Math.round(mean(prev.map((m) => m.acs)));
  const recentHs = round(mean(recent.map((m) => m.headshotPercent)), 1);
  const prevHs = round(mean(prev.map((m) => m.headshotPercent)), 1);
  const recentKd = round(
    safeDiv(
      recent.reduce((a, m) => a + m.kills, 0),
      Math.max(
        recent.reduce((a, m) => a + m.deaths, 0),
        1,
      ),
    ),
    2,
  );
  const prevKd = round(
    safeDiv(
      prev.reduce((a, m) => a + m.kills, 0),
      Math.max(
        prev.reduce((a, m) => a + m.deaths, 0),
        1,
      ),
    ),
    2,
  );

  // Round-derived metrics (only compute when rounds are provided)
  let firstDeathRate = 0;
  let openingDuelSuccessRate = 0;
  let clutchRate = 0;
  if (rounds.length > 0) {
    firstDeathRate = percent(
      rounds.filter((r) => r.firstDeath).length,
      rounds.length,
    );
    const openingDuels = rounds.filter((r) => r.firstBlood || r.firstDeath);
    openingDuelSuccessRate = percent(
      openingDuels.filter((r) => r.firstBlood).length,
      openingDuels.length,
    );
    const clutches = rounds.filter((r) => r.clutch);
    clutchRate = percent(clutches.filter((r) => r.won).length, clutches.length);
  }

  return {
    totalMatches: matches.length,
    wins,
    losses,
    winRate: percent(wins, matches.length),
    recentWinRate,
    avgKills: round(mean(matches.map((m) => m.kills)), 1),
    avgDeaths: round(mean(matches.map((m) => m.deaths)), 1),
    avgAssists: round(mean(matches.map((m) => m.assists)), 1),
    kdRatio: round(safeDiv(totalKills, Math.max(totalDeaths, 1)), 2),
    headshotPercent: round(mean(matches.map((m) => m.headshotPercent)), 1),
    adr: round(mean(matches.map((m) => m.adr)), 1),
    acs: Math.round(mean(matches.map((m) => m.acs))),
    firstDeathRate,
    openingDuelSuccessRate,
    clutchRate,
    winRateDeltaPp: prev.length >= 5 ? round(recentWr - prevWr, 1) : undefined,
    acsDelta: prev.length >= 5 ? recentAcs - prevAcs : undefined,
    kdDelta: prev.length >= 5 ? round(recentKd - prevKd, 2) : undefined,
    headshotDeltaPp: prev.length >= 5 ? round(recentHs - prevHs, 1) : undefined,
  };
}

export function calculateSideBreakdown(rounds: AnalyticsRoundInput[]): SideBreakdown {
  if (rounds.length === 0) {
    return {
      attackRoundWinRate: 0,
      defenseRoundWinRate: 0,
      attackRoundsPlayed: 0,
      defenseRoundsPlayed: 0,
    };
  }
  const atk = rounds.filter((r) => r.side === "attack");
  const def = rounds.filter((r) => r.side === "defense");
  return {
    attackRoundWinRate: percent(atk.filter((r) => r.won).length, atk.length),
    defenseRoundWinRate: percent(def.filter((r) => r.won).length, def.length),
    attackRoundsPlayed: atk.length,
    defenseRoundsPlayed: def.length,
  };
}

export function calculateStreakContext(matches: AnalyticsMatchInput[]): StreakContext {
  if (matches.length === 0) {
    return { current: null, longestWin: 0, longestLoss: 0, postLossWinRate: 0 };
  }

  // `matches` is newest-first; iterate oldest-first to compute streaks naturally.
  const oldestFirst = [...matches].reverse();
  let longestWin = 0;
  let longestLoss = 0;
  let runLen = 0;
  let runResult: "win" | "loss" | null = null;

  for (const m of oldestFirst) {
    const result: "win" | "loss" = m.won ? "win" : "loss";
    if (result === runResult) {
      runLen += 1;
    } else {
      runResult = result;
      runLen = 1;
    }
    if (result === "win") longestWin = Math.max(longestWin, runLen);
    else longestLoss = Math.max(longestLoss, runLen);
  }

  // Current streak = the tail run (newest-first: look forward from index 0)
  let currentLen = 1;
  const currentResult: "win" | "loss" = matches[0].won ? "win" : "loss";
  for (let i = 1; i < matches.length; i += 1) {
    const r: "win" | "loss" = matches[i].won ? "win" : "loss";
    if (r === currentResult) currentLen += 1;
    else break;
  }

  // Post-loss WR: games played after a ≥2-loss streak (tilt check)
  let postLossWins = 0;
  let postLossTotal = 0;
  for (let i = 0; i < oldestFirst.length - 1; i += 1) {
    if (!oldestFirst[i].won && i > 0 && !oldestFirst[i - 1].won) {
      const next = oldestFirst[i + 1];
      postLossTotal += 1;
      if (next.won) postLossWins += 1;
    }
  }

  return {
    current: { result: currentResult, length: currentLen },
    longestWin,
    longestLoss,
    postLossWinRate: percent(postLossWins, postLossTotal),
  };
}
