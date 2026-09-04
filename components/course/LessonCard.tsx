'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readProgress } from '@/lib/progress';
import { FreshnessBadge } from './FreshnessBadge';
import type { Volatility } from '@/lib/freshness';
import { t } from '@/lib/i18n';

export interface LessonCardData {
  id: string;
  title: string;
  summary: string;
  permalink: string;
  estMinutes: number;
  verifiedOn: string;
  volatility: Volatility;
  moduleTitle?: string;
}

export function LessonCard({
  lesson,
  index,
  showModule = false,
}: {
  lesson: LessonCardData;
  index?: number;
  showModule?: boolean;
}) {
  const [done, setDone] = useState(false);
  useEffect(() => setDone(lesson.id in readProgress()), [lesson.id]);

  return (
    <Link
      href={lesson.permalink}
      className="state-layer group block rounded-md border border-border bg-surface-raised p-4 shadow-elev-1 transition-shadow hover:shadow-elev-2"
    >
      <div className="mb-1.5 flex items-center gap-2">
        {index != null && (
          <span className="label-caps tabular-nums text-primary">
            {String(index).padStart(2, '0')}
          </span>
        )}
        {showModule && lesson.moduleTitle && (
          <span className="label-caps truncate">{lesson.moduleTitle}</span>
        )}
        {done && (
          <span className="ml-auto inline-flex items-center gap-1 text-label font-semibold text-ok">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
              <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('lesson.markedDone')}
          </span>
        )}
      </div>

      <h3 className="text-title-lg font-semibold group-hover:text-primary">{lesson.title}</h3>
      <p className="mt-1.5 text-body text-text-muted">{lesson.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-text-faint">
        <span>{t('lesson.minutes', { n: lesson.estMinutes })}</span>
        <FreshnessBadge verifiedOn={lesson.verifiedOn} volatility={lesson.volatility} compact />
      </div>
    </Link>
  );
}
