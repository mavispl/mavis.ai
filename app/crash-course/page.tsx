import type { Metadata } from 'next';
import Link from 'next/link';
import { crashCoursePath } from '@/lib/content';
import mapJson from '@/spec/curriculum/map.json';
import { PathStepper } from '@/components/course/PathStepper';
import { PersonaSwitch } from '@/components/course/PersonaSwitch';

export const metadata: Metadata = {
  title: 'Crash course',
  description:
    'The smallest set of ideas that changes how you work with AI — one sitting, sequenced, nothing optional.',
};

export default function CrashCoursePage() {
  const path = crashCoursePath();
  const minutes = path.reduce((n, l) => n + l.estMinutes, 0);
  const planned = (mapJson as { crashCourse: string[] }).crashCourse.length;
  // Say the real number rather than the intended one. A page that claims twelve
  // lessons and lists four is the first thing a reader stops trusting.
  const duration =
    minutes < 90
      ? `${minutes} min`
      : `about ${(Math.round((minutes / 60) * 2) / 2).toString().replace('.5', '\u00bd')} hours`;

  return (
    <div className="mx-auto px-4 py-10 sm:px-6" style={{ maxWidth: 'var(--content-max)' }}>
      <header className="border-b border-border pb-8">
        <p className="label-caps">Start here</p>
        <h1 className="mt-2 text-display-md font-semibold">Crash course</h1>
        <p className="measure mt-3 text-body-lg text-text-muted">
          The smallest set of ideas that actually changes how you work with AI —{' '}
          {planned} lessons drawn from across the course and put in the order that makes
          each one land. It is built to be finished, not browsed: every page assumes the
          ones before it.
        </p>
        {path.length > 0 && (
          <p className="mt-3 text-small text-text-faint">
            {path.length === planned
              ? `All ${planned} lessons published`
              : `${path.length} of ${planned} lessons published so far`}{' '}
            · {duration} of reading · progress is kept in this browser
          </p>
        )}
      </header>

      {path.length === 0 ? (
        <div className="mt-8 rounded-md border border-border bg-surface p-6">
          <p className="text-title font-semibold">The path is defined; the pages are being generated.</p>
          <p className="measure mt-2 text-body text-text-muted">
            The twelve steps are fixed in <code>spec/curriculum/map.json</code> — they are
            marked in the agenda, not chosen afterwards, so the crash course cannot drift
            from the deep dive. Until they are authored and audited, start from the{' '}
            <Link href="/deep-dive" className="text-primary underline underline-offset-2">deep dive</Link>{' '}
            or look a term up in the{' '}
            <Link href="/wiki" className="text-primary underline underline-offset-2">wiki</Link>.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_var(--rail-width)]">
          <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
            <PathStepper
              steps={path.map((l) => ({
                id: l.id, title: l.title, permalink: l.permalink, estMinutes: l.estMinutes,
              }))}
            />
          </div>
          <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
            <PersonaSwitch />
            <p className="mt-4 text-small text-text-faint">
              Set this before you start. It changes which explanation opens first on every
              page — it never hides anything.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
