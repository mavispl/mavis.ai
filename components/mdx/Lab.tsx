import type { ReactNode } from 'react';
import { t } from '@/lib/i18n';
import { CopyButton } from './CopyButton';

/**
 * A hands-on exercise embedded in a lesson.
 *
 * Every lab must be falsifiable: `successLooksLike` states what the reader should
 * observe if it worked. A lab the reader cannot check is a lab they cannot learn
 * from, so the schema requires it.
 */
export function Lab({
  title,
  goal,
  minutes,
  successLooksLike,
  copyable,
  children,
}: {
  title: string;
  goal: string;
  minutes?: number;
  successLooksLike: string;
  copyable?: string;
  children: ReactNode;
}) {
  return (
    <section className="my-6 overflow-hidden rounded-md border border-accent/40 bg-surface-raised shadow-elev-1">
      <header
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-4 py-3"
        style={{ background: 'var(--accent-container)' }}
      >
        <span className="label-caps" style={{ color: 'var(--on-accent-container)' }}>
          {t('lab.title')}
        </span>
        <h4 className="text-title font-semibold" style={{ color: 'var(--on-accent-container)' }}>
          {title}
        </h4>
        {minutes != null && (
          <span className="ml-auto text-small" style={{ color: 'var(--on-accent-container)' }}>
            {t('lab.time', { n: minutes })}
          </span>
        )}
      </header>

      <div className="px-4 py-4">
        <p className="mb-4 text-body-lg">
          <span className="label-caps mr-2">{t('lab.goal')}</span>
          {goal}
        </p>

        <div className="lab-steps text-body-lg">{children}</div>

        {copyable && (
          <div className="mt-4 flex items-center gap-2">
            <CopyButton value={copyable} />
            <span className="text-small text-text-faint">the whole block above</span>
          </div>
        )}

        <p
          className="mt-4 rounded-sm border-l-[3px] px-3 py-2 text-body"
          style={{ borderLeftColor: 'var(--ok)', background: 'var(--ok-container)' }}
        >
          <span className="label-caps mr-2" style={{ color: 'var(--ok)' }}>
            {t('lab.success')}
          </span>
          {successLooksLike}
        </p>
      </div>
    </section>
  );
}
