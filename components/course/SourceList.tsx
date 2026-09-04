import { formatDate } from '@/lib/freshness';
import { t } from '@/lib/i18n';

export interface SourceRef {
  url: string;
  title: string;
  publisher: string;
  accessedOn: string;
}

/**
 * Provenance, shown plainly rather than tucked away.
 *
 * The access date matters as much as the URL: it tells a reader what the page
 * looked like when the claim was made, which is the only honest thing to say
 * about a fast-moving source.
 */
export function SourceList({ sources }: { sources: readonly SourceRef[] }) {
  if (sources.length === 0) return null;
  return (
    <section className="mt-8 border-t border-border pt-5">
      <h2 className="label-caps mb-3">{t('lesson.sources')}</h2>
      <ol className="space-y-2 text-small">
        {sources.map((s, i) => (
          <li key={s.url} className="flex gap-2.5">
            <span className="shrink-0 tabular-nums text-text-faint">[{i + 1}]</span>
            <span>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {s.title}
              </a>
              <span className="text-text-muted">
                {' '}— {s.publisher}, accessed {formatDate(s.accessedOn)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
