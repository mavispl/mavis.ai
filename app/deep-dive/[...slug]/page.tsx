import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  allLessons, lessonsOfWeek, modulesOfWeek, weeksPresent, neighbours, WEEK_TITLES,
} from '@/lib/content';
import { LessonLayout } from '@/components/course/LessonLayout';
import { LessonCard } from '@/components/course/LessonCard';
import { MdxContent } from '@/components/mdx/MdxContent';
import { t } from '@/lib/i18n';

/**
 * One catch-all serves both shapes under /deep-dive:
 *   /deep-dive/w1              — a week index
 *   /deep-dive/w1/m01/b02      — a lesson
 * Slug length disambiguates, and both are enumerated at build time.
 */
type Params = { slug: string[] };

export function generateStaticParams(): Params[] {
  const weeks = weeksPresent().map((w) => ({ slug: [`w${w}`] }));
  const lessons = allLessons().map((l) => ({
    slug: l.permalink.replace('/deep-dive/', '').split('/'),
  }));
  return [...weeks, ...lessons];
}

const parseWeek = (segment: string) => {
  const m = segment.match(/^w([1-4])$/);
  return m ? Number(m[1]) : null;
};

export async function generateMetadata({
  params,
}: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug.length === 1) {
    const week = parseWeek(slug[0]);
    if (week && WEEK_TITLES[week]) {
      return {
        title: `Week ${week}: ${WEEK_TITLES[week].title}`,
        description: WEEK_TITLES[week].goal,
      };
    }
  }
  const lesson = allLessons().find((l) => l.permalink === `/deep-dive/${slug.join('/')}`);
  return lesson
    ? { title: lesson.title, description: lesson.summary }
    : { title: t('nav.deepDive') };
}

export default async function DeepDivePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  /* ---- week index ---- */
  if (slug.length === 1) {
    const week = parseWeek(slug[0]);
    if (!week || !WEEK_TITLES[week]) notFound();
    const modules = modulesOfWeek(week);
    const lessons = lessonsOfWeek(week);
    if (modules.length === 0) notFound();

    return (
      <div className="mx-auto px-4 py-10 sm:px-6" style={{ maxWidth: 'var(--content-max)' }}>
        <nav aria-label="Breadcrumb" className="mb-5 text-small text-text-muted">
          <Link href="/deep-dive" className="hover:text-primary">{t('nav.deepDive')}</Link>
        </nav>
        <p className="label-caps text-primary">{t('common.week')} {week}</p>
        <h1 className="mt-1 text-display-md font-semibold">{WEEK_TITLES[week].title}</h1>
        <p className="measure mt-3 text-body-lg text-text-muted">{WEEK_TITLES[week].goal}</p>
        <p className="mt-2 text-small text-text-faint">
          {modules.length} modules · {lessons.length} {t('common.lessons')} ·{' '}
          {lessons.reduce((n, l) => n + l.estMinutes, 0)} min
        </p>

        {modules.map((mod) => (
          <section key={mod.module} className="mt-10">
            <h2 className="text-headline font-semibold">
              <span className="mr-2 font-mono text-small font-normal text-accent">
                {String(mod.module).padStart(2, '0')}
              </span>
              {mod.moduleTitle}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {mod.lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} index={lesson.bullet} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  /* ---- lesson ---- */
  const lesson = allLessons().find((l) => l.permalink === `/deep-dive/${slug.join('/')}`);
  if (!lesson) notFound();

  const { prev, next } = neighbours(lesson.id);
  return (
    <LessonLayout
      lesson={lesson}
      prev={prev && { title: prev.title, permalink: prev.permalink }}
      next={next && { title: next.title, permalink: next.permalink }}
    >
      <MdxContent code={lesson.content} />
    </LessonLayout>
  );
}
