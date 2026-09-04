import type { Metadata } from 'next';
import Link from 'next/link';
import { modulesOfWeek, lessonsOfWeek, allRecipes, WEEK_TITLES } from '@/lib/content';
import { LessonCard } from '@/components/course/LessonCard';
import { t } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Agents in project',
  description:
    'How agentic systems land in a real codebase: the deep dive, plus recipes shown across several harnesses.',
};

export default function AgentsPage() {
  const modules = modulesOfWeek(2);
  const lessons = lessonsOfWeek(2);
  const recipes = allRecipes();

  return (
    <div className="mx-auto px-4 py-10 sm:px-6" style={{ maxWidth: 'var(--content-max)' }}>
      <header className="border-b border-border pb-8">
        <p className="label-caps">Applied</p>
        <h1 className="mt-2 text-display-md font-semibold">Agents in project</h1>
        <p className="measure mt-3 text-body-lg text-text-muted">
          Week 2 of the course, plus the practical half: recipes you can run against your
          own repository today. {WEEK_TITLES[2].goal}
        </p>
        <p className="measure mt-3 text-body text-text-muted">
          Every recipe is shown for at least two harnesses. That is a structural rule, not
          a courtesy — a recipe written against one tool teaches that tool&rsquo;s
          vocabulary as if it were the domain&rsquo;s.
        </p>
      </header>

      <section className="mt-9">
        <h2 className="text-headline font-semibold">The deep dive</h2>
        {modules.length === 0 ? (
          <p className="measure mt-3 rounded-md border border-border bg-surface p-4 text-body text-text-muted">
            Week 2 is queued for generation. Its five modules — mechanics, primitives,
            tools and data, custom systems, multi-agent engineering — are fixed in the
            curriculum map. Start with{' '}
            <Link href="/deep-dive/w1" className="text-primary underline underline-offset-2">
              Week 1
            </Link>
            , which everything here assumes.
          </p>
        ) : (
          modules.map((mod) => (
            <div key={mod.module} className="mt-6">
              <h3 className="text-title-lg font-semibold">
                <span className="mr-2 font-mono text-small font-normal text-accent">
                  {String(mod.module).padStart(2, '0')}
                </span>
                {mod.moduleTitle}
              </h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {mod.lessons.map((l) => (
                  <LessonCard key={l.id} lesson={l} index={l.bullet} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-headline font-semibold">Recipes</h2>
        <p className="measure mt-2 text-body text-text-muted">
          Working patterns with the steps spelled out, each shown across the harnesses
          people actually use.
        </p>
        {recipes.length === 0 ? (
          <p className="measure mt-4 rounded-md border border-border bg-surface p-4 text-body text-text-muted">
            No recipes published yet. They are produced alongside the Week 2 lessons they
            apply, so a recipe never appears without the explanation behind it.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {recipes.map((r) => (
              <Link
                key={r.id}
                href={r.permalink}
                className="state-layer group rounded-md border border-border bg-surface-raised p-4 shadow-elev-1"
              >
                <div className="flex items-center gap-2">
                  <span className="label-caps">{r.difficulty}</span>
                  <span className="ml-auto text-small text-text-faint">
                    {t('lesson.minutes', { n: r.estMinutes })}
                  </span>
                </div>
                <h3 className="mt-1 text-title-lg font-semibold group-hover:text-primary">{r.title}</h3>
                <p className="mt-1.5 text-body text-text-muted">{r.summary}</p>
                <p className="mt-3 flex flex-wrap gap-1.5">
                  {r.harnesses.map((h) => (
                    <span key={h} className="rounded-full border border-border px-2 py-0.5 text-label text-text-faint">
                      {h}
                    </span>
                  ))}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
