import { freshnessOf, formatDate, type Volatility } from '@/lib/freshness';
import { t, type StringKey } from '@/lib/i18n';

const KEY: Record<ReturnType<typeof freshnessOf>, StringKey> = {
  fresh: 'freshness.fresh',
  ageing: 'freshness.ageing',
  stale: 'freshness.stale',
};

const COLOR = {
  fresh: 'var(--ok)',
  ageing: 'var(--warn)',
  stale: 'var(--err)',
} as const;

/**
 * How much to trust this page today. Shape and text carry the signal alongside
 * colour — a filled dot is fresh, a ring is ageing, a cross is stale — so the
 * badge still works in greyscale and for colour-blind readers.
 */
export function FreshnessBadge({
  verifiedOn,
  volatility,
  compact = false,
}: {
  verifiedOn: string;
  volatility: Volatility;
  compact?: boolean;
}) {
  const state = freshnessOf(verifiedOn, volatility);
  const color = COLOR[state];

  return (
    <span
      className="inline-flex items-center gap-1.5 text-small text-text-muted"
      title={t('freshness.explain')}
    >
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 shrink-0" aria-hidden="true">
        {state === 'fresh' && <circle cx="5" cy="5" r="4" fill={color} />}
        {state === 'ageing' && <circle cx="5" cy="5" r="3.2" fill="none" stroke={color} strokeWidth="1.6" />}
        {state === 'stale' && (
          <path d="M2 2l6 6M8 2l-6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        )}
      </svg>
      {compact ? formatDate(verifiedOn) : t(KEY[state], { date: formatDate(verifiedOn) })}
    </span>
  );
}
