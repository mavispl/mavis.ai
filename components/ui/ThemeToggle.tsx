'use client';

import { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';

type Mode = 'light' | 'dark' | 'system';
const KEY = 'mavis.theme';

function apply(mode: Mode) {
  const root = document.documentElement;
  if (mode === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(KEY); } catch { /* blocked */ }
    if (stored === 'light' || stored === 'dark') setMode(stored);
    setMounted(true);
  }, []);

  const cycle = () => {
    const next: Mode = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
    setMode(next);
    apply(next);
    try {
      if (next === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch { /* session-only is fine */ }
  };

  const label = mode === 'system' ? t('theme.system') : mode === 'light' ? t('theme.light') : t('theme.dark');

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${t('theme.toggle')} — ${label}`}
      title={`${t('theme.toggle')} — ${label}`}
      className="state-layer flex h-9 w-9 items-center justify-center rounded-full text-text-muted"
    >
      <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" aria-hidden="true">
        {mounted && mode === 'dark' ? (
          <path d="M16 11.5A6.5 6.5 0 018.5 4a6.5 6.5 0 107.5 7.5z" strokeWidth="1.4" strokeLinejoin="round" />
        ) : mounted && mode === 'light' ? (
          <>
            <circle cx="10" cy="10" r="3.4" strokeWidth="1.4" />
            <path d="M10 2.5v1.8M10 15.7v1.8M17.5 10h-1.8M4.3 10H2.5M15.3 4.7l-1.3 1.3M6 14l-1.3 1.3M15.3 15.3L14 14M6 6L4.7 4.7"
              strokeWidth="1.4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="10" cy="10" r="7" strokeWidth="1.4" />
            <path d="M10 3a7 7 0 000 14z" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    </button>
  );
}

/**
 * Runs before first paint so a dark-mode reader never sees a white flash.
 * Deliberately tiny and defensive: any throw leaves the system preference in
 * charge, which is a correct page.
 */
export const themeScript = `(function(){try{var m=localStorage.getItem('${KEY}');if(m==='light'||m==='dark')document.documentElement.setAttribute('data-theme',m);var p=localStorage.getItem('mavis.persona');if(p)document.documentElement.setAttribute('data-persona',p);}catch(e){}})();`;
