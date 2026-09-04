/**
 * Freshness: the reader-facing half of the fact policy.
 *
 * A page carries `verifiedOn` and a `volatility`. Volatility sets how fast that
 * verification decays — model names and pricing rot in weeks; how attention works
 * does not. The badge tells a reader how much to trust the page *today*, and the
 * same function drives the re-audit queue, so what the reader sees and what the
 * pipeline schedules can never disagree.
 */

export type Volatility = 'low' | 'medium' | 'high';
export type Freshness = 'fresh' | 'ageing' | 'stale';

/** Days until a verification is considered due for recheck / out of date. */
const WINDOWS: Record<Volatility, { ageing: number; stale: number }> = {
  high: { ageing: 30, stale: 90 },
  medium: { ageing: 90, stale: 240 },
  low: { ageing: 365, stale: 730 },
};

export function daysSince(iso: string, now: Date = new Date()): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((now.getTime() - then) / 86_400_000);
}

export function freshnessOf(
  verifiedOn: string,
  volatility: Volatility,
  now: Date = new Date(),
): Freshness {
  const age = daysSince(verifiedOn, now);
  const w = WINDOWS[volatility];
  if (age >= w.stale) return 'stale';
  if (age >= w.ageing) return 'ageing';
  return 'fresh';
}

/** Used by the fact audit to build its work queue, worst first. */
export function recheckPriority(verifiedOn: string, volatility: Volatility): number {
  return daysSince(verifiedOn) / WINDOWS[volatility].ageing;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
