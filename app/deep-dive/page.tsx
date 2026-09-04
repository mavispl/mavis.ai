import type { Metadata } from 'next';
import Link from 'next/link';
import { modulesOfWeek, lessonsOfWeek, WEEK_TITLES, courseStats } from '@/lib/content';
import { t } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Deep dive',
  description: 'The full four-week course: mechanics, agents, product, autonomy.',
};

const WEEKS = [1, 2, 3, 4];

export default function DeepDiveIndex() {
  const stats = courseStats();

  return (
    <div className="mx-auto px-4 py-10 sm:px-6" style={{ maxWidth: 'var(--content-max)' }}>
      <header className="border-b border-border pb-8">
        <p className="label-caps">The course</p>
        <h1 className="mt-2 text-display-md font-semibold">Deep dive</h1>
        <p className="measure mt-3 text-body-lg text-text-muted">
          Four weeks, twenty modules, one page per idea. Week 1 builds the mental model
          the other three stand on — if you are starting cold, start there rather than
          jumping to the part that matches your job title.
        </p>
        {stats.lessons > 0 && (
          <p className="mt-3 text-small text-text-faint">
            {stats.lessons} of 107 lessons published · {stats.readingMinutes} min ·{' '}
            {stats.sources} cited sources
          </p>
        )}
      </header>

      <div className="mt-8 grid gap-5">
        {WEEKS.map((week) => {
          const modules = modulesOfWeek(week);
          const lessons = lessonsOfWeek(week);
          const published = lessons.length > 0;

          return (
            <section
              key={week}
              className="rounded-lg border border-border bg-surface p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="label-caps text-primary">{t('common.week')} {week}</p>
                <h2 className="text-headline font-semibold">
                  {published ? (
                    <Link href={`/deep-dive/w${week}`} className="hover:text-primary">
                      {WEEK_TITLES[week].title}
                    </Link>
                  ) : (
                    WEEK_TITLES[week].title
                  )}
                </h2>
                <span className="ml-auto text-small text-text-faint">
                  {published
                    ? `${lessons.length} ${t('common.lessons')} · ${lessons.reduce((n, l) => n + l.estMinutes, 0)} min`
                    : 'queued'}
                </span>
              </div>
              <p className="measure mt-2 text-body text-text-muted">{WEEK_TITLES[week].goal}</p>

              {published ? (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {modules.map((mod) => (
                    <li key={mod.module}>
                      <Link
                        href={mod.lessons[0]?.permalink ?? `/deep-dive/w${week}`}
                        className="state-layer flex items-baseline gap-2.5 rounded-sm px-2 py-1.5"
                      >
                        <span className="font-mono text-small text-accent">
                          {String(mod.module).padStart(2, '0')}
                        </span>
                        <span className="text-body">{mod.moduleTitle}</span>
                        <span className="ml-auto text-small text-text-faint">
                          {mod.lessons.length}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-sm border border-border-faint bg-surface-sunken px-3 py-2 text-small text-text-faint">
                  Queued for generation. The outline is fixed in{' '}
                  <code>spec/curriculum/map.json</code>; the pages are produced and audited
                  a module at a time.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
