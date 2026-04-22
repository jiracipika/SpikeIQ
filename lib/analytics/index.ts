import type { CoachingInsight } from "@/types/domain";
import {
  calculateCoreMetrics,
  calculateSideBreakdown,
  calculateStreakContext,
} from "./calculate-core-metrics";
import { calculateAgentBreakdowns } from "./calculate-agent-breakdowns";
import { calculateMapBreakdowns } from "./calculate-map-breakdowns";
import { generateInsights } from "./generate-insights";
import { computePerformanceScores } from "./scoring";
import type {
  AnalyticsMatchInput,
  AnalyticsRoundInput,
  AnalyticsSnapshot,
  InsightDraft,
} from "./types";

export * from "./types";
export { calculateCoreMetrics, calculateSideBreakdown, calculateStreakContext } from "./calculate-core-metrics";
export { calculateAgentBreakdowns } from "./calculate-agent-breakdowns";
export { calculateMapBreakdowns } from "./calculate-map-breakdowns";
export { generateInsights } from "./generate-insights";
export {
  computePerformanceScores,
  consistencyScore,
  aggressionScore,
  survivabilityScore,
  improvementScore,
} from "./scoring";

/**
 * Single entry point. Accepts normalized inputs so it works with any data source.
 *
 * Matches should be ordered newest-first; rounds may be in any order.
 */
export function runAnalytics(
  matches: AnalyticsMatchInput[],
  rounds: AnalyticsRoundInput[] = [],
): AnalyticsSnapshot {
  const core = calculateCoreMetrics(matches, rounds);
  const sides = calculateSideBreakdown(rounds);
  const streaks = calculateStreakContext(matches);
  const agents = calculateAgentBreakdowns(matches);
  const maps = calculateMapBreakdowns(matches, rounds);
  const scores = computePerformanceScores(matches, core.firstDeathRate);
  const insights = generateInsights({ core, scores, sides, streaks, agents, maps });

  return {
    core,
    scores,
    sides,
    streaks,
    agents,
    maps,
    insights,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Adapter: convert an analytics-layer `InsightDraft` into the UI-layer
 * `CoachingInsight` shape the dashboard components already render.
 */
export function toCoachingInsights(drafts: InsightDraft[]): CoachingInsight[] {
  return drafts.map((d) => ({
    id: d.id,
    title: d.title,
    category: d.type,
    priority: d.severity,
    description: d.description,
    action: d.action ?? "",
  }));
}
