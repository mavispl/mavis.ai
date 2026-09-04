import Link from 'next/link';
import type { ReactNode } from 'react';
import { Toc, type TocItem } from '@/components/ui/Toc';
import { PersonaSwitch } from './PersonaSwitch';
import { LessonProgress } from './LessonProgress';
import { FreshnessBadge } from './FreshnessBadge';
import { SourceList, type SourceRef } from './SourceList';
import type { Volatility } from '@/lib/freshness';
import { t } from '@/lib/i18n';

export interface LessonHeader {
  id: string;
  title: string;
  summary: string;
  week: number;
  weekTitle: string;
  module: number;
  moduleTitle: string;
  estMinutes: number;
  verifiedOn: string;
  volatility: Volatility;
  sources: readonly SourceRef[];
  toc: readonly TocItem[];
}

export interface NeighbourLink { title: string; permalink: string }

/**
 * The asymmetric reading grid from the design system: navigation implied by the
 * breadcrumb, a 68ch argument column, and a margin rail carrying the things a
 * reader reaches for without wanting them in the flow — the persona lens, the
 * contents, progress.
 *
 * Below 1280px the rail moves under the prose rather than shrinking; a squeezed
 * rail is worse than no rail.
 */
export function LessonLayout({
  lesson,
  prev,
  next,
  children,
}: {
  lesson: LessonHeader;
  prev?: NeighbourLink;
  next?: NeighbourLink;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto px-4 py-8 sm:px-6" style={{ maxWidth: 'var(--content-max)' }}>
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-small text-text-muted">
        <Link href="/deep-dive" className="hover:text-primary">{t('nav.deepDive')}</Link>
        <span aria-hidden="true" className="text-text-faint">/</span>
        <Link href={`/deep-dive/w${lesson.week}`} className="hover:text-primary">
          {t('common.week')} {lesson.week} · {lesson.weekTitle}
        </Link>
        <span aria-hidden="true" className="text-text-faint">/</span>
        <span>{lesson.moduleTitle}</span>
      </nav>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_var(--rail-width)] xl:gap-12">
        <div className="min-w-0">
          <header className="mb-7 border-b border-border pb-6">
            <h1 className="text-display-sm font-semibold">{lesson.title}</h1>
            <p className="measure mt-3 text-body-lg text-text-muted">
              <span className="label-caps mr-2 align-middle">{t('lesson.tldr')}</span>
              {lesson.summary}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-text-faint">
              <span>{t('lesson.minutes', { n: lesson.estMinutes })}</span>
              <FreshnessBadge verifiedOn={lesson.verifiedOn} volatility={lesson.volatility} />
              <LessonProgress id={lesson.id} />
            </div>
          </header>

          {children}

          <SourceList sources={lesson.sources} />

          {(prev || next) && (
            <nav
              aria-label="Lesson navigation"
              className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
            >
              {prev ? (
                <Link href={prev.permalink} className="state-layer rounded-md border border-border p-4">
                  <span className="label-caps">{t('lesson.previous')}</span>
                  <span className="mt-1 block text-title font-medium">{prev.title}</span>
                </Link>
              ) : <span />}
              {next && (
                <Link
                  href={next.permalink}
                  className="state-layer rounded-md border border-border p-4 sm:text-right"
                >
                  <span className="label-caps">{t('lesson.next')}</span>
                  <span className="mt-1 block text-title font-medium">{next.title}</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        <aside className="order-first flex flex-col gap-6 xl:order-none xl:sticky xl:top-[calc(var(--header-height)+1.5rem)] xl:self-start">
          <PersonaSwitch />
          <div className="hidden xl:block"><Toc items={lesson.toc} /></div>
        </aside>
      </div>
    </article>
  );
}
