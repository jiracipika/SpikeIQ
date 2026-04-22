import type { AnalyticsMatchInput, PerformanceScores } from "./types";
import { clamp, mean, round, safeDiv, splitWindow, stdev } from "./utils";

/**
 * All scores return a 0–100 value. Formulas are intentionally transparent so
 * they can be tuned as we collect more real data.
 */

export function consistencyScore(matches: AnalyticsMatchInput[]): number {
  if (matches.length < 3) return 0;
  const acsValues = matches.map((m) => m.acs);
  const meanAcs = mean(acsValues);
  if (meanAcs <= 0) return 0;
  // Coefficient of variation → lower CV == more consistent. Typical CV is 0.12–0.35.
  const cv = stdev(acsValues) / meanAcs;
  const penalty = clamp(cv * 160, 0, 80); // 0.25 CV -> 40 penalty; 0.5 -> 80
  return round(clamp(100 - penalty, 0, 100), 0);
}

export function aggressionScore(matches: AnalyticsMatchInput[]): number {
  if (matches.length === 0) return 0;
  const totalRoundsEstimate = matches.reduce(
    (acc, m) => acc + Math.max(m.scoreFor + m.scoreAgainst, 1),
    0,
  );
  const totalKills = matches.reduce((acc, m) => acc + m.kills, 0);
  const totalFb = matches.reduce((acc, m) => acc + m.firstBloods, 0);
  const avgAdr = mean(matches.map((m) => m.adr));

  const fbRate = safeDiv(totalFb, totalRoundsEstimate); // ~0.06–0.18
  const kpr = safeDiv(totalKills, totalRoundsEstimate); // ~0.5–1.0
  const adrNorm = clamp(avgAdr / 175, 0, 1); // 175 ADR = max credit

  // Weighted blend: first-blood rate is the strongest signal of aggression.
  const score = fbRate * 260 + kpr * 35 + adrNorm * 15;
  return round(clamp(score, 0, 100), 0);
}

export function survivabilityScore(
  matches: AnalyticsMatchInput[],
  firstDeathRatePercent: number,
): number {
  if (matches.length === 0) return 0;
  const totalRounds = matches.reduce(
    (acc, m) => acc + Math.max(m.scoreFor + m.scoreAgainst, 1),
    0,
  );
  const totalDeaths = matches.reduce((acc, m) => acc + m.deaths, 0);
  const deathsPerRound = safeDiv(totalDeaths, totalRounds); // ~0.6–1.0
  const survivalBase = clamp(1 - deathsPerRound, 0, 1) * 70; // 0–70
  const firstDeathPenalty = clamp(firstDeathRatePercent / 30, 0, 1) * 30; // up to 30 penalty
  return round(clamp(survivalBase + (30 - firstDeathPenalty), 0, 100), 0);
}

export function improvementScore(matches: AnalyticsMatchInput[]): number {
  // Compare last 10 to the prior 10 across WR and ACS.
  const { recent, prev } = splitWindow(matches, 10);
  if (recent.length < 5 || prev.length < 5) return 50;

  const recentWr = (recent.filter((m) => m.won).length / recent.length) * 100;
  const prevWr = (prev.filter((m) => m.won).length / prev.length) * 100;
  const wrDeltaPp = recentWr - prevWr;

  const recentAcs = mean(recent.map((m) => m.acs));
  const prevAcs = mean(prev.map((m) => m.acs));
  const acsDelta = recentAcs - prevAcs;

  // 50 = flat. +10 pp WR ~= +25, +25 ACS ~= +15.
  const score = 50 + wrDeltaPp * 2.5 + acsDelta * 0.6;
  return round(clamp(score, 0, 100), 0);
}

export function computePerformanceScores(
  matches: AnalyticsMatchInput[],
  firstDeathRatePercent: number,
): PerformanceScores {
  return {
    consistencyScore: consistencyScore(matches),
    aggressionScore: aggressionScore(matches),
    survivabilityScore: survivabilityScore(matches, firstDeathRatePercent),
    improvementScore: improvementScore(matches),
  };
}
