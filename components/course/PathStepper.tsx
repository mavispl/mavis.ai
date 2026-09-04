'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readProgress, completionOf } from '@/lib/progress';
import { t } from '@/lib/i18n';

export interface PathStep {
  id: string;
  title: string;
  permalink: string;
  estMinutes: number;
}

/**
 * A sequenced route through lessons — the crash course, or a module.
 *
 * The connecting line fills as the reader completes steps, so "how far in am I"
 * is answerable at a glance without reading any number.
 */
export function PathStepper({ steps }: { steps: readonly PathStep[] }) {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setDoneIds(new Set(Object.keys(readProgress())));
    sync();
    window.addEventListener('mavis:progress', sync);
    return () => window.removeEventListener('mavis:progress', sync);
  }, []);

  const { done, total } = completionOf(
    steps.map((s) => s.id),
    Object.fromEntries([...doneIds].map((id) => [id, 1])),
  );

  return (
    <div>
      <p className="label-caps mb-4">{t('progress.complete', { done, total })}</p>
      <ol className="relative">
        {steps.map((step, i) => {
          const isDone = doneIds.has(step.id);
          const isLast = i === steps.length - 1;
          return (
            <li key={step.id} className="relative flex gap-4 pb-5">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[13px] top-7 bottom-0 w-px"
                  style={{ background: isDone ? 'var(--ok)' : 'var(--border)' }}
                />
              )}
              <span
                aria-hidden="true"
                className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-label font-semibold tabular-nums"
                style={
                  isDone
                    ? { borderColor: 'var(--ok)', background: 'var(--ok)', color: 'var(--on-primary)' }
                    : { borderColor: 'var(--border-strong)', background: 'var(--surface)', color: 'var(--text-muted)' }
                }
              >
                {isDone ? (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                    <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2.4"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={step.permalink}
                  className="text-title font-medium hover:text-primary hover:underline underline-offset-2"
                >
                  {step.title}
                </Link>
                <p className="text-small text-text-faint">
                  {t('lesson.minutes', { n: step.estMinutes })}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
