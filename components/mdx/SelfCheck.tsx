'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';

/**
 * A check for understanding. The answer is behind a deliberate click — the value
 * is in the reader attempting it first, so the answer is not merely visually
 * hidden but genuinely gated behind an action.
 */
export function SelfCheck({
  question,
  answer,
  hint,
}: {
  question: string;
  answer: string;
  hint?: string;
}) {
  const [shown, setShown] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  return (
    <div className="my-5 rounded-md border border-border bg-surface p-4">
      <p className="label-caps mb-2">{t('check.title')}</p>
      <p className="text-body-lg font-medium">{question}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {hint && !hintShown && !shown && (
          <button
            type="button"
            onClick={() => setHintShown(true)}
            className="state-layer rounded-full border border-border px-3 py-1 text-small text-text-muted"
          >
            {t('check.hint')}
          </button>
        )}
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-expanded={shown}
          className="state-layer rounded-full border border-primary px-3 py-1 text-small font-medium text-primary"
        >
          {shown ? t('check.hide') : t('check.reveal')}
        </button>
      </div>

      {hintShown && !shown && hint && (
        <p className="mt-3 text-body italic text-text-muted">{hint}</p>
      )}
      {shown && (
        <div className="mt-3 border-t border-border-faint pt-3 text-body-lg">{answer}</div>
      )}
    </div>
  );
}
