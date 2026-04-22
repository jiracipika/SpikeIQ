export function safeDiv(numerator: number, denominator: number, fallback = 0) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return fallback;
  }
  return numerator / denominator;
}

export function round(value: number, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  const m = 10 ** decimals;
  return Math.round(value * m) / m;
}

export function percent(numerator: number, denominator: number, decimals = 1) {
  return round(safeDiv(numerator, denominator) * 100, decimals);
}

export function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

export function stdev(values: number[]) {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compare a recent window to a prior window. Both slices should be non-overlapping
 * and already ordered most-recent-first.
 */
export function splitWindow<T>(items: T[], windowSize = 10) {
  const recent = items.slice(0, windowSize);
  const prev = items.slice(windowSize, windowSize * 2);
  return { recent, prev };
}
