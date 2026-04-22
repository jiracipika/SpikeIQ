export interface RoundRatingInput {
  kills: number;
  deaths: number;
  assists: number;
  damageDealt: number;
  firstKill: boolean;
  firstDeath: boolean;
  tradeKill: boolean;
  tradedDeath: boolean;
  plant: boolean;
  defuse: boolean;
  survivedRound: boolean;
  roundWon: boolean;
}

export function computeRoundRating(input: RoundRatingInput): number {
  const combat = clamp01(input.kills / 2) * 0.6 + clamp01(input.damageDealt / 200) * 0.4;
  const opening = (input.firstKill ? 1 : 0) - (input.firstDeath ? 0.8 : 0);
  const trade = (input.tradeKill ? 1 : 0) + (input.tradedDeath ? 0.5 : 0);
  const objective = (input.plant ? 0.5 : 0) + (input.defuse ? 0.75 : 0);
  const survival = input.survivedRound ? 1 : 0;
  const support = clamp01(input.assists / 2);
  const roundWin = input.roundWon ? 1 : 0;
  const deathPenalty = input.deaths > 0 ? 0.2 : 0;

  const score01 =
    combat * 0.36 +
    normalizeSigned(opening) * 0.14 +
    clamp01(trade) * 0.12 +
    clamp01(objective) * 0.12 +
    survival * 0.08 +
    support * 0.08 +
    roundWin * 0.1 -
    deathPenalty;

  return roundTo2(clamp(score01, 0, 1) * 100);
}

function normalizeSigned(value: number): number {
  return clamp01((value + 1) / 2);
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}
