'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { SearchDialog } from './SearchDialog';
import { t, type StringKey } from '@/lib/i18n';

const NAV: { href: string; key: StringKey }[] = [
  { href: '/crash-course', key: 'nav.crashCourse' },
  { href: '/deep-dive', key: 'nav.deepDive' },
  { href: '/agents', key: 'nav.agents' },
  { href: '/wiki', key: 'nav.wiki' },
  { href: '/tools', key: 'nav.tools' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div
        className="mx-auto flex items-center gap-4 px-4 sm:px-6"
        style={{ height: 'var(--header-height)', maxWidth: 'var(--content-max)' }}
      >
        <Link href="/" className="flex shrink-0 items-baseline gap-2">
          <span className="font-display text-title-lg font-semibold tracking-[-0.02em]">
            AI&nbsp;Engineering
          </span>
          <span className="hidden text-label text-text-faint sm:inline">course</span>
        </Link>

        <nav aria-label="Sections" className="ml-2 hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`state-layer rounded-sm px-2.5 py-1.5 text-body transition-colors ${
                    isActive(item.href)
                      ? 'font-semibold text-primary'
                      : 'text-text-muted'
                  }`}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <SearchDialog />
          <ThemeToggle />
          <button
            type="button"
            aria-expanded={open}
            aria-label={t('nav.menu')}
            onClick={() => setOpen((o) => !o)}
            className="state-layer flex h-9 w-9 items-center justify-center rounded-full text-text-muted lg:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" aria-hidden="true">
              {open
                ? <path d="M5 5l10 10M15 5L5 15" strokeWidth="1.6" strokeLinecap="round" />
                : <path d="M3.5 6h13M3.5 10h13M3.5 14h13" strokeWidth="1.6" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Sections" className="border-t border-border bg-surface px-4 py-2 lg:hidden">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`state-layer block rounded-sm px-2 py-2.5 ${
                    isActive(item.href) ? 'font-semibold text-primary' : 'text-text'
                  }`}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
