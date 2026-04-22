import type {
  AgentBreakdown,
  CoreMetrics,
  InsightDraft,
  MapBreakdown,
  PerformanceScores,
  SideBreakdown,
  StreakContext,
} from "./types";
import { clamp, round } from "./utils";

/**
 * Rule-based insight generator. Each rule is small, deterministic, and returns
 * 0 or 1 drafts. New rules should follow the same pattern so we can unit test
 * and tune thresholds independently.
 */

interface Context {
  core: CoreMetrics;
  scores: PerformanceScores;
  sides: SideBreakdown;
  streaks: StreakContext;
  agents: AgentBreakdown[];
  maps: MapBreakdown[];
}

type Rule = (ctx: Context) => InsightDraft | null;

function mk(
  id: string,
  fields: Omit<InsightDraft, "id" | "generatedAt">,
): InsightDraft {
  return { id, generatedAt: new Date().toISOString(), ...fields };
}

const sideImbalanceRule: Rule = ({ sides }) => {
  const { attackRoundWinRate: atk, defenseRoundWinRate: def } = sides;
  if (sides.attackRoundsPlayed < 20 || sides.defenseRoundsPlayed < 20) return null;
  const delta = Math.abs(atk - def);
  if (delta < 8) return null;
  const weaker = def < atk ? "defense" : "attack";
  return mk("side-imbalance", {
    type: "macro",
    title: `Your ${weaker}-side win rate is noticeably lower`,
    description: `Attack ${atk}% vs defense ${def}%. A ${round(delta, 1)} pp gap usually points to a setup or retake problem, not aim.`,
    action: `Pick 2 maps, drill one default ${weaker} setup each, and rehearse it before the next ranked session.`,
    severity: delta > 14 ? "high" : "medium",
    relatedEntity: `side:${weaker}`,
    confidence: clamp(delta / 30, 0.3, 0.95),
  });
};

const highFirstDeathRule: Rule = ({ core }) => {
  if (core.firstDeathRate < 20) return null;
  return mk("high-first-death", {
    type: "mechanics",
    title: "You die first too often",
    description: `You are the first player to die in ${core.firstDeathRate}% of rounds. Rank benchmark is ~16%.`,
    action: "Tighten crosshair placement on common angles and delay aggressive peeks until you have utility confirmed.",
    severity: core.firstDeathRate > 24 ? "high" : "medium",
    relatedEntity: "metric:firstDeathRate",
    confidence: clamp((core.firstDeathRate - 18) / 12, 0.3, 0.95),
  });
};

const downtrendRule: Rule = ({ core }) => {
  if (core.winRateDeltaPp == null) return null;
  if (core.winRateDeltaPp > -8) return null;
  return mk("downtrend", {
    type: "mindset",
    title: "Your last 10 matches show a downward trend",
    description: `Recent 10-match win rate is ${core.winRateDeltaPp} pp below the prior window. ACS moved ${core.acsDelta ?? 0}.`,
    action: "Take a 30-minute break, review one loss focusing on decision-making, then cap the next session at 4 games.",
    severity: core.winRateDeltaPp < -15 ? "high" : "medium",
    relatedEntity: "trend:winRate",
    confidence: clamp(Math.abs(core.winRateDeltaPp) / 20, 0.3, 0.95),
  });
};

const uptrendRule: Rule = ({ core }) => {
  if (core.winRateDeltaPp == null) return null;
  if (core.winRateDeltaPp < 8) return null;
  return mk("uptrend", {
    type: "consistency",
    title: "You're on an upward trend",
    description: `Recent win rate is +${core.winRateDeltaPp} pp vs the prior 10. Ride the momentum but keep session length short.`,
    action: "Lock in your current warm-up routine and review wins for patterns you can repeat.",
    severity: "low",
    relatedEntity: "trend:winRate",
    confidence: clamp(core.winRateDeltaPp / 20, 0.3, 0.9),
  });
};

const bestAgentRule: Rule = ({ agents }) => {
  if (agents.length < 2) return null;
  const eligible = agents.filter((a) => a.matches >= 5);
  if (eligible.length < 2) return null;
  const top = [...eligible].sort((a, b) => b.winRate - a.winRate)[0];
  const worst = [...eligible].sort((a, b) => a.winRate - b.winRate)[0];
  if (!top || !worst || top.agent === worst.agent) return null;
  const gap = top.winRate - worst.winRate;
  if (gap < 12) return null;
  return mk("best-agent", {
    type: "consistency",
    title: `You perform significantly better on ${top.agent} than ${worst.agent}`,
    description: `${top.agent}: ${top.winRate}% WR over ${top.matches} matches. ${worst.agent}: ${worst.winRate}% over ${worst.matches}.`,
    action: `Queue ${top.agent} first when the map pool fits. Reserve ${worst.agent} for practice sessions, not ranked.`,
    severity: gap > 20 ? "high" : "medium",
    relatedEntity: `agent:${top.agent}`,
    confidence: clamp(gap / 30, 0.4, 0.95),
  });
};

const bestMapRule: Rule = ({ maps }) => {
  const eligible = maps.filter((m) => m.matches >= 4 && m.winRate >= 60);
  if (eligible.length === 0) return null;
  const top = eligible.sort((a, b) => b.winRate - a.winRate)[0];
  return mk("best-map", {
    type: "macro",
    title: `Your best map is ${top.map}`,
    description: `${top.winRate}% win rate across ${top.matches} matches on ${top.map}. Strong map pool anchor.`,
    action: `Keep ${top.map} instant-pick. Build a 2-minute pre-game checklist of your best utility lineups for it.`,
    severity: "low",
    relatedEntity: `map:${top.map}`,
    confidence: clamp((top.winRate - 55) / 20, 0.4, 0.9),
  });
};

const worstMapRule: Rule = ({ maps }) => {
  const eligible = maps.filter((m) => m.matches >= 5 && m.winRate <= 42);
  if (eligible.length === 0) return null;
  const worst = eligible.sort((a, b) => a.winRate - b.winRate)[0];
  return mk("worst-map", {
    type: "macro",
    title: `${worst.map} is dragging your win rate`,
    description: `${worst.winRate}% WR across ${worst.matches} games on ${worst.map}. Attack ${worst.attackRoundWinRate}% / defense ${worst.defenseRoundWinRate}%.`,
    action: `Watch one VOD of a pro match on ${worst.map} and note default A- and B-site setups before your next queue.`,
    severity: "medium",
    relatedEntity: `map:${worst.map}`,
    confidence: clamp((45 - worst.winRate) / 20, 0.4, 0.9),
  });
};

const tiltRule: Rule = ({ streaks }) => {
  if (streaks.postLossWinRate === 0) return null;
  if (streaks.postLossWinRate > 42) return null;
  return mk("tilt", {
    type: "mindset",
    title: "Performance drops after back-to-back losses",
    description: `After 2 consecutive losses, your win rate is ${streaks.postLossWinRate}% — well below your overall average.`,
    action: "Set a hard rule: after 2 losses in a row, step away for 15 minutes before queueing again.",
    severity: streaks.postLossWinRate < 35 ? "high" : "medium",
    relatedEntity: "streaks:postLoss",
    confidence: clamp((45 - streaks.postLossWinRate) / 20, 0.3, 0.9),
  });
};

const clutchImprovementRule: Rule = ({ core, scores }) => {
  if (core.clutchRate < 40) return null;
  if (scores.improvementScore < 55) return null;
  return mk("clutch-improving", {
    type: "mechanics",
    title: "Your clutch conversion is improving",
    description: `You're converting ${core.clutchRate}% of clutches with a rising momentum curve. That's a skill signal.`,
    action: "Keep drilling 1v1 aim resets; this is one of the highest-impact round swings you can influence.",
    severity: "low",
    relatedEntity: "metric:clutchRate",
    confidence: 0.7,
  });
};

const consistencyRule: Rule = ({ scores }) => {
  if (scores.consistencyScore >= 55) return null;
  return mk("low-consistency", {
    type: "consistency",
    title: "Your match-to-match performance swings a lot",
    description: `Consistency score is ${scores.consistencyScore}/100. Big ACS swings often trace back to warm-up quality.`,
    action: "Standardize a 10-minute warm-up: tracking DM, then 5 minutes of movement + peek drills before first queue.",
    severity: scores.consistencyScore < 40 ? "medium" : "low",
    relatedEntity: "score:consistency",
    confidence: 0.6,
  });
};

const rules: Rule[] = [
  sideImbalanceRule,
  highFirstDeathRule,
  downtrendRule,
  uptrendRule,
  bestAgentRule,
  bestMapRule,
  worstMapRule,
  tiltRule,
  clutchImprovementRule,
  consistencyRule,
];

export function generateInsights(ctx: Context, limit = 6): InsightDraft[] {
  const drafts = rules
    .map((rule) => {
      try {
        return rule(ctx);
      } catch {
        return null;
      }
    })
    .filter((d): d is InsightDraft => Boolean(d));

  const severityWeight = { high: 3, medium: 2, low: 1 } as const;
  drafts.sort((a, b) => {
    const sev = severityWeight[b.severity] - severityWeight[a.severity];
    if (sev !== 0) return sev;
    return (b.confidence ?? 0) - (a.confidence ?? 0);
  });

  return drafts.slice(0, limit);
}
