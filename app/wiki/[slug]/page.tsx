import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allWiki, wikiBySlug, wikiLookup, lessonById } from '@/lib/content';
import { MdxContent } from '@/components/mdx/MdxContent';
import { SourceList } from '@/components/course/SourceList';
import { FreshnessBadge } from '@/components/course/FreshnessBadge';
import { t } from '@/lib/i18n';

type Params = { slug: string };

export const generateStaticParams = (): Params[] => allWiki().map((w) => ({ slug: w.slug }));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = wikiBySlug(slug);
  return entry ? { title: entry.term, description: entry.summary } : { title: t('nav.wiki') };
}

export default async function WikiEntryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = wikiBySlug(slug);
  if (!entry) notFound();

  const lessons = entry.lessons.map(lessonById).filter((l) => l != null);
  const related = entry.relatedTerms.map(wikiLookup).filter((w) => w != null);

  return (
    <article className="mx-auto px-4 py-10 sm:px-6" style={{ maxWidth: '58rem' }}>
      <nav aria-label="Breadcrumb" className="mb-5 text-small text-text-muted">
        <Link href="/wiki" className="hover:text-primary">{t('nav.wiki')}</Link>
        <span aria-hidden="true" className="mx-1.5 text-text-faint">/</span>
        <span>{entry.category}</span>
      </nav>

      <header className="border-b border-border pb-5">
        <h1 className="text-display-sm font-semibold">{entry.term}</h1>
        {entry.aliases.length > 0 && (
          <p className="mt-1 text-body text-text-faint">
            Also: {entry.aliases.join(', ')}
          </p>
        )}
        {/* The one-line definition carries most of the value; it leads. */}
        <p className="measure mt-3 text-body-lg">{entry.summary}</p>
        {entry.analogy && (
          <p
            className="measure mt-4 rounded-md border-l-[3px] px-4 py-3 text-body-lg"
            style={{ borderLeftColor: 'var(--accent)', background: 'var(--accent-container)' }}
          >
            <span className="label-caps mr-2" style={{ color: 'var(--on-accent-container)' }}>
              {t('wiki.analogy')}
            </span>
            <span style={{ color: 'var(--on-accent-container)' }}>{entry.analogy}</span>
          </p>
        )}
        <div className="mt-4">
          <FreshnessBadge verifiedOn={entry.verifiedOn} volatility="medium" />
        </div>
      </header>

      <MdxContent code={entry.content} className="mt-6" />

      {lessons.length > 0 && (
        <section className="mt-8 border-t border-border pt-5">
          <h2 className="label-caps mb-3">{t('wiki.taughtIn')}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link
                  href={lesson.permalink}
                  className="state-layer block rounded-md border border-border p-3"
                >
                  <span className="text-title font-medium">{lesson.title}</span>
                  <span className="mt-0.5 block text-small text-text-muted">{lesson.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-6">
          <h2 className="label-caps mb-2">{t('wiki.seeAlso')}</h2>
          <p className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={r.permalink}
                className="state-layer rounded-full border border-border px-3 py-1 text-small text-primary"
              >
                {r.term}
              </Link>
            ))}
          </p>
        </section>
      )}

      <SourceList sources={entry.sources} />
    </article>
  );
}
