import { NormalizedMatchOutput } from "../transform/normalize-match";

export interface InsightRow {
  owner_user_id: string;
  match_id: string;
  insight_type: string;
  title: string;
  body: string;
  severity: number;
  rule_id: string;
  metric_snapshot: Record<string, unknown>;
}

export function generateMatchInsights(normalized: NormalizedMatchOutput): InsightRow[] {
  const rows: InsightRow[] = [];
  const { match, featureVector } = normalized;

  const firstDuelDelta = asNumber(featureVector.first_duel_delta);
  const tradeRate = asNumber(featureVector.trade_participation_rate);
  const objectiveRate = asNumber(featureVector.objective_participation_rate);

  if (match.match_rating < 45) {
    rows.push({
      owner_user_id: match.owner_user_id,
      match_id: match.match_id,
      insight_type: "focus_area",
      title: "Stabilize impact across rounds",
      body: "Your round-to-round value dipped this match. Prioritize safer opening peeks and trade proximity in early fights.",
      severity: 2,
      rule_id: "low_match_rating_v1",
      metric_snapshot: {
        match_rating: match.match_rating,
        avg_round_rating: match.avg_round_rating,
        consistency_score: match.consistency_score,
      },
    });
  }

  if (firstDuelDelta < -2) {
    rows.push({
      owner_user_id: match.owner_user_id,
      match_id: match.match_id,
      insight_type: "opening_duels",
      title: "Opening duel discipline",
      body: "You lost more opening fights than you won. Use utility before first contact and avoid dry re-peeks.",
      severity: 2,
      rule_id: "negative_first_duel_delta_v1",
      metric_snapshot: {
        first_duel_delta: firstDuelDelta,
        first_kills: match.first_kills,
        first_deaths: match.first_deaths,
      },
    });
  }

  if (tradeRate < 0.2) {
    rows.push({
      owner_user_id: match.owner_user_id,
      match_id: match.match_id,
      insight_type: "teamplay",
      title: "Increase trade participation",
      body: "Your trade involvement was low. Play closer to teammates on entries and retakes to convert fights.",
      severity: 1,
      rule_id: "low_trade_participation_v1",
      metric_snapshot: {
        trade_participation_rate: tradeRate,
      },
    });
  }

  if (objectiveRate > 0.3 && match.match_rating >= 55) {
    rows.push({
      owner_user_id: match.owner_user_id,
      match_id: match.match_id,
      insight_type: "strength",
      title: "Strong objective impact",
      body: "You consistently influenced spike outcomes. Keep anchoring this by pairing objective timing with team utility.",
      severity: 0,
      rule_id: "strong_objective_impact_v1",
      metric_snapshot: {
        objective_participation_rate: objectiveRate,
      },
    });
  }

  return rows;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
