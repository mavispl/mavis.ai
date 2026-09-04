'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '@/lib/i18n';

interface Result {
  url: string;
  title: string;
  excerpt: string;
}

/**
 * Search over the static export, via Pagefind.
 *
 * Pagefind's bundle only exists after `next build`, so it is imported lazily at
 * first open with a webpack-ignored dynamic import. In `next dev` the index is
 * absent and the dialog says so rather than throwing.
 */
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState<'idle' | 'ready' | 'unavailable'>('idle');
  const pagefind = useRef<any>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
          (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const load = useCallback(async () => {
    if (pagefind.current || status === 'unavailable') return;
    try {
      pagefind.current = await import(/* webpackIgnore: true */ '/pagefind/pagefind.js' as string);
      await pagefind.current.init();
      setStatus('ready');
    } catch {
      setStatus('unavailable');
    }
  }, [status]);

  useEffect(() => { if (open) void load(); }, [open, load]);

  useEffect(() => {
    let cancelled = false;
    if (!query.trim() || !pagefind.current) { setResults([]); return; }
    (async () => {
      const search = await pagefind.current.search(query);
      const data = await Promise.all(search.results.slice(0, 12).map((r: any) => r.data()));
      if (!cancelled) {
        setResults(data.map((d: any) => ({
          url: d.url.replace(/\.html$/, ''),
          title: d.meta?.title ?? d.url,
          excerpt: d.excerpt ?? '',
        })));
      }
    })();
    return () => { cancelled = true; };
  }, [query]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="state-layer flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-small text-text-faint"
          aria-label={t('nav.search')}
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">{t('nav.search')}</span>
          <kbd className="hidden rounded-xs border border-border px-1 text-label sm:inline">/</kbd>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-surface-inverse/30 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-[12vh] z-50 w-[min(40rem,92vw)] -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-elev-4">
          <Dialog.Title className="sr-only">{t('nav.search')}</Dialog.Title>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full border-b border-border bg-transparent px-4 py-3.5 text-body-lg outline-none placeholder:text-text-faint"
          />
          <div className="max-h-[52vh] overflow-y-auto scrollbar-thin">
            {status === 'unavailable' && (
              <p className="px-4 py-6 text-small text-text-muted">
                Search index is built by <code>pnpm build</code>; it is not available in dev.
              </p>
            )}
            {status === 'ready' && query && results.length === 0 && (
              <p className="px-4 py-6 text-small text-text-muted">{t('search.empty')}</p>
            )}
            {results.map((r) => (
              <a
                key={r.url}
                href={r.url}
                className="state-layer block border-b border-border-faint px-4 py-3 last:border-0"
              >
                <p className="text-title font-medium">{r.title}</p>
                <p
                  className="mt-0.5 line-clamp-2 text-small text-text-muted"
                  dangerouslySetInnerHTML={{ __html: r.excerpt }}
                />
              </a>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
