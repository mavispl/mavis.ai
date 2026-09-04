import Link from 'next/link';
import { t } from '@/lib/i18n';

export function Footer({ lastVerified }: { lastVerified?: string | null }) {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div
        className="mx-auto grid gap-6 px-4 py-8 sm:px-6 md:grid-cols-[2fr_1fr_1fr]"
        style={{ maxWidth: 'var(--content-max)' }}
      >
        <div>
          <p className="font-display text-title-lg font-semibold">{t('site.title')}</p>
          <p className="mt-1 max-w-sm text-small text-text-muted">{t('site.tagline')}</p>
          {lastVerified && (
            <p className="mt-3 text-small text-text-faint">
              Content last verified {lastVerified}. Every page carries its own sources and date.
            </p>
          )}
        </div>
        <nav aria-label="Course">
          <p className="label-caps mb-2">Course</p>
          <ul className="space-y-1.5 text-small">
            <li><Link href="/crash-course" className="text-text-muted hover:text-primary">{t('nav.crashCourse')}</Link></li>
            <li><Link href="/deep-dive" className="text-text-muted hover:text-primary">{t('nav.deepDive')}</Link></li>
            <li><Link href="/agents" className="text-text-muted hover:text-primary">{t('nav.agents')}</Link></li>
          </ul>
        </nav>
        <nav aria-label="Reference">
          <p className="label-caps mb-2">Reference</p>
          <ul className="space-y-1.5 text-small">
            <li><Link href="/wiki" className="text-text-muted hover:text-primary">{t('nav.wiki')}</Link></li>
            <li><Link href="/tools" className="text-text-muted hover:text-primary">{t('nav.tools')}</Link></li>
            <li><Link href="/design" className="text-text-muted hover:text-primary">{t('nav.design')}</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
