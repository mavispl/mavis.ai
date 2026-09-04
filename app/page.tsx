import Link from 'next/link';
import { courseStats, WEEK_TITLES, weeksPresent, crashCoursePath } from '@/lib/content';
import { formatDate } from '@/lib/freshness';
import { PersonaSwitch } from '@/components/course/PersonaSwitch';

const SECTIONS = [
  {
    href: '/crash-course',
    eyebrow: 'Start here',
    title: 'Crash course',
    blurb:
      'The smallest set of ideas that changes how you work with AI. One sitting, sequenced, nothing optional.',
  },
  {
    href: '/deep-dive',
    eyebrow: 'The course',
    title: 'Deep dive',
    blurb:
      'Four weeks: mechanics, agents, product, autonomy. One page per idea, layered so it reads at your level.',
  },
  {
    href: '/agents',
    eyebrow: 'Applied',
    title: 'Agents in project',
    blurb:
      'How agentic systems actually land in a codebase — the deep dive, plus recipes you can run today.',
  },
  {
    href: '/wiki',
    eyebrow: 'Reference',
    title: 'Wiki',
    blurb:
      'Every term, defined once, in one sentence you can hold in your head. Then the long version.',
  },
  {
    href: '/tools',
    eyebrow: 'Reference',
    title: 'Tools & setup',
    blurb:
      'Getting a working environment, and the pitfalls that cost everyone else an afternoon first.',
  },
];

const ROUTES = [
  {
    label: 'I have one evening',
    body: 'Take the crash course end to end. It is built to be finished, not browsed.',
    href: '/crash-course',
    cta: 'Start the crash course',
  },
  {
    label: 'I want the whole thing',
    body: 'Week 1 builds the mental model everything else stands on. Start at the mechanics.',
    href: '/deep-dive',
    cta: 'Open the deep dive',
  },
  {
    label: 'I am shipping agents now',
    body: 'Go straight to the applied section: patterns, recipes, and the ways they fail.',
    href: '/agents',
    cta: 'Agents in project',
  },
  {
    label: 'I hit a word I do not know',
    body: 'The wiki defines every term in one line before it explains it properly.',
    href: '/wiki',
    cta: 'Look it up',
  },
];

export default function HomePage() {
  const stats = courseStats();
  const weeks = weeksPresent();
  const crash = crashCoursePath();

  const figures = [
    { value: stats.lessons, label: 'lessons' },
    { value: stats.wikiTerms, label: 'wiki terms' },
    { value: stats.recipes, label: 'recipes' },
    { value: stats.gotchas, label: 'gotchas' },
    { value: stats.sources, label: 'cited sources' },
  ].filter((f) => f.value > 0);

  return (
    <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--content-max)' }}>
      {/* Hero */}
      <section className="grid gap-10 py-14 lg:grid-cols-[1.35fr_1fr] lg:py-20">
        <div>
          <p className="label-caps">Four weeks · Core, Agents, Product, Takeoff</p>
          <h1 className="mt-3 text-display-md font-semibold sm:text-display-lg">
            Generative AI and agentic systems, for engineers who ship
          </h1>
          <p className="mt-5 max-w-2xl text-body-lg text-text-muted">
            A course about the mechanics underneath the tools — how models read, why they
            confabulate, what an agent actually is, and how to put one to work without
            losing control of the system it changes. Written so a junior can follow it and
            a staff engineer still learns something.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/crash-course"
              className="state-layer rounded-full bg-primary px-5 py-2.5 text-body font-semibold text-on-primary"
            >
              Start the crash course
            </Link>
            <Link
              href="/deep-dive"
              className="state-layer rounded-full border border-border-strong px-5 py-2.5 text-body font-semibold"
            >
              Browse the deep dive
            </Link>
          </div>

          {figures.length > 0 && (
            <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
              {figures.map((f) => (
                <div key={f.label}>
                  <dt className="label-caps">{f.label}</dt>
                  <dd className="font-display text-display-sm font-semibold tabular-nums">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <aside className="self-start rounded-lg border border-border bg-surface p-5 shadow-elev-1">
          <p className="label-caps mb-1">Read it at your level</p>
          <p className="mb-4 text-body text-text-muted">
            Every lesson carries a plain-language framing, an engineer’s deep dive, and the
            consequences for a team. Pick a starting point — it changes emphasis, never
            hides anything.
          </p>
          <PersonaSwitch compact />
          <p className="mt-4 border-t border-border-faint pt-3 text-small text-text-faint">
            Stored in this browser. Change it any time from a lesson page.
          </p>
        </aside>
      </section>

      {/* Where to start */}
      <section className="border-t border-border py-12">
        <h2 className="text-display-sm font-semibold">Where to start</h2>
        <p className="mt-2 max-w-2xl text-body-lg text-text-muted">
          Four honest routes in. Pick the one that matches the time you actually have.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ROUTES.map((r) => (
            <Link
              key={r.href + r.label}
              href={r.href}
              className="state-layer group rounded-md border border-border bg-surface-raised p-5 shadow-elev-1 transition-shadow hover:shadow-elev-2"
            >
              <p className="text-title font-semibold group-hover:text-primary">{r.label}</p>
              <p className="mt-1.5 text-body text-text-muted">{r.body}</p>
              <p className="mt-3 text-small font-medium text-primary">{r.cta} →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* The four weeks */}
      {weeks.length > 0 && (
        <section className="border-t border-border py-12">
          <h2 className="text-display-sm font-semibold">The four weeks</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {weeks.map((w) => (
              <Link
                key={w}
                href={`/deep-dive/w${w}`}
                className="state-layer rounded-md border border-border bg-surface p-5"
              >
                <p className="label-caps text-primary">Week {w}</p>
                <p className="mt-1 font-display text-headline font-semibold">
                  {WEEK_TITLES[w]?.title}
                </p>
                <p className="mt-2 text-body text-text-muted">{WEEK_TITLES[w]?.goal}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* What is here */}
      <section className="border-t border-border py-12">
        <h2 className="text-display-sm font-semibold">What is here</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="state-layer group flex flex-col rounded-md border border-border bg-surface p-5"
            >
              <p className="label-caps">{s.eyebrow}</p>
              <p className="mt-1 font-display text-title-lg font-semibold group-hover:text-primary">
                {s.title}
              </p>
              <p className="mt-2 text-body text-text-muted">{s.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How this is made */}
      <section className="border-t border-border py-12">
        <h2 className="text-display-sm font-semibold">How this is made</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            {
              t: 'Every claim carries its source',
              d: 'Anything that can go out of date — model names, limits, pricing, tool behaviour — cites where it came from and when we last checked. The build fails without it.',
            },
            {
              t: 'Pages tell you how stale they are',
              d: 'Each page shows a verification date and is rechecked on a schedule set by how fast its subject moves. Fast-moving pages are rechecked monthly.',
            },
            {
              t: 'Generated, then audited',
              d: 'Content is produced by a staged pipeline and passes schema, fact, pedagogy, graph and accessibility audits before it ships. The findings live in the repo.',
            },
          ].map((item) => (
            <div key={item.t} className="rounded-md border border-border bg-surface p-5">
              <p className="text-title font-semibold">{item.t}</p>
              <p className="mt-2 text-body text-text-muted">{item.d}</p>
            </div>
          ))}
        </div>
        {stats.lastVerified && (
          <p className="mt-5 text-small text-text-faint">
            Most recent verification across the site: {formatDate(stats.lastVerified)}.
            {crash.length > 0 && ` Crash course: ${crash.length} lessons.`}
          </p>
        )}
      </section>
    </div>
  );
}
