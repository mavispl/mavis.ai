'use client';

import { useCallback, useRef, useState } from 'react';
import { t } from '@/lib/i18n';

export function CopyButton({ value, className = '' }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // clipboard denied; the text is selectable either way
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      className={`state-layer rounded-xs border border-border px-2 py-1 text-label font-medium text-text-muted ${className}`}
    >
      <span aria-live="polite">{copied ? t('lab.copied') : t('lab.copy')}</span>
    </button>
  );
}
