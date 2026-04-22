export interface MatchRatingOutput {
  avgRoundRating: number;
  consistencyScore: number;
  matchRating: number;
}

export function computeMatchRating(roundRatings: number[]): MatchRatingOutput {
  if (!roundRatings.length) {
    return {
      avgRoundRating: 0,
      consistencyScore: 0,
      matchRating: 0,
    };
  }

  const avg = average(roundRatings);
  const stdDev = standardDeviation(roundRatings, avg);
  const consistency = clamp(100 - stdDev * 2, 0, 100);

  // Keep this as an improvement signal, not a ladder replacement metric.
  const blended = avg * 0.85 + consistency * 0.15;

  return {
    avgRoundRating: round2(avg),
    consistencyScore: round2(consistency),
    matchRating: round2(blended),
  };
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[], avg: number): number {
  if (!values.length) {
    return 0;
  }

  const variance =
    values.reduce((sum, value) => {
      const diff = value - avg;
      return sum + diff * diff;
    }, 0) / values.length;

  return Math.sqrt(variance);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
