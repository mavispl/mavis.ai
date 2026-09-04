'use client';

import { useEffect, useState } from 'react';
import { readProgress, toggleLesson } from '@/lib/progress';
import { t } from '@/lib/i18n';

export function LessonProgress({ id }: { id: string }) {
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDone(id in readProgress());
    setMounted(true);
  }, [id]);

  return (
    <button
      type="button"
      aria-pressed={done}
      // Rendered disabled until storage is read, so the first paint never claims
      // a state it hasn't checked.
      disabled={!mounted}
      onClick={() => {
        const next = toggleLesson(id);
        setDone(id in next);
      }}
      className={`state-layer inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-small font-medium transition-colors ${
        done
          ? 'border-ok bg-ok-container text-ok'
          : 'border-border text-text-muted'
      } disabled:opacity-60`}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        {done ? (
          <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
        )}
      </svg>
      {done ? t('lesson.markedDone') : t('lesson.markDone')}
    </button>
  );
}
