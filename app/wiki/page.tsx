import type { Metadata } from 'next';
import Link from 'next/link';
import { wikiByLetter, allWiki } from '@/lib/content';
import { t } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Wiki',
  description: 'Every term in the course, defined once — one line first, then properly.',
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function WikiIndex() {
  const groups = wikiByLetter();
  const present = new Set(groups.map((g) => g.letter));
  const total = allWiki().length;

  return (
    <div className="mx-auto px-4 py-10 sm:px-6" style={{ maxWidth: 'var(--content-max)' }}>
      <header className="border-b border-border pb-8">
        <p className="label-caps">Reference</p>
        <h1 className="mt-2 text-display-md font-semibold">Wiki</h1>
        <p className="measure mt-3 text-body-lg text-text-muted">
          Every term the course uses, defined once. Each entry opens with a single
          sentence you can hold in your head, then explains itself properly and links to
          the lesson that teaches it. If a word in a lesson sends you here, this is where
          it stops being in your way.
        </p>
        {total > 0 && <p className="mt-3 text-small text-text-faint">{total} entries</p>}
      </header>

      {total === 0 ? (
        <p className="measure mt-8 rounded-md border border-border bg-surface p-5 text-body text-text-muted">
          The wiki is generated from the lessons rather than written separately: every term
          a lesson declares in its <code>defines</code> field becomes an entry, and the
          graph audit fails the build if one is missing. Entries appear as lessons are
          published.
        </p>
      ) : (
        <>
          <nav aria-label={t('wiki.jumpTo')} className="mt-6 flex flex-wrap gap-1">
            {ALPHABET.map((letter) =>
              present.has(letter) ? (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="state-layer flex h-8 w-8 items-center justify-center rounded-sm text-small font-medium text-primary"
                >
                  {letter}
                </a>
              ) : (
                <span
                  key={letter}
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center text-small text-text-faint opacity-40"
                >
                  {letter}
                </span>
              ),
            )}
          </nav>

          {groups.map((group) => (
            <section key={group.letter} className="mt-8">
              <h2
                id={`letter-${group.letter}`}
                className="scroll-mt-20 border-b border-border pb-1 font-display text-headline font-semibold text-accent"
              >
                {group.letter}
              </h2>
              <dl className="mt-3 grid gap-3 md:grid-cols-2">
                {group.entries.map((entry) => (
                  <div key={entry.slug} className="rounded-md border border-border bg-surface p-4">
                    <dt>
                      <Link href={entry.permalink} className="text-title font-semibold hover:text-primary">
                        {entry.term}
                      </Link>
                      {entry.aliases.length > 0 && (
                        <span className="ml-2 text-small text-text-faint">
                          {entry.aliases.join(', ')}
                        </span>
                      )}
                    </dt>
                    <dd className="mt-1 text-body text-text-muted">{entry.summary}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
