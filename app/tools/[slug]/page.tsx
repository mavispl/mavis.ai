import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allTools, toolBySlug, lessonById } from '@/lib/content';
import { MdxContent } from '@/components/mdx/MdxContent';
import { SourceList } from '@/components/course/SourceList';
import { FreshnessBadge } from '@/components/course/FreshnessBadge';
import { Toc } from '@/components/ui/Toc';
import { PersonaSwitch } from '@/components/course/PersonaSwitch';
import { t } from '@/lib/i18n';

type Params = { slug: string };

export const generateStaticParams = (): Params[] => allTools().map((tool) => ({ slug: tool.slug }));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  return tool ? { title: tool.title, description: tool.summary } : { title: t('nav.tools') };
}

export default async function ToolPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) notFound();

  const lessons = tool.relatedLessons.map(lessonById).filter((l) => l != null);

  return (
    <article className="mx-auto px-4 py-10 sm:px-6" style={{ maxWidth: 'var(--content-max)' }}>
      <nav aria-label="Breadcrumb" className="mb-5 text-small text-text-muted">
        <Link href="/tools" className="hover:text-primary">{t('nav.tools')}</Link>
        <span aria-hidden="true" className="mx-1.5 text-text-faint">/</span>
        <span>{tool.category}</span>
      </nav>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_var(--rail-width)] xl:gap-12">
        <div className="min-w-0">
          <header className="border-b border-border pb-5">
            <h1 className="text-display-sm font-semibold">{tool.title}</h1>
            <p className="measure mt-3 text-body-lg text-text-muted">{tool.summary}</p>
            <div className="mt-4">
              <FreshnessBadge verifiedOn={tool.verifiedOn} volatility={tool.volatility} />
            </div>
          </header>

          <MdxContent code={tool.content} className="mt-6" />

          {lessons.length > 0 && (
            <section className="mt-8 border-t border-border pt-5">
              <h2 className="label-caps mb-3">{t('lesson.related')}</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link href={lesson.permalink} className="state-layer block rounded-md border border-border p-3">
                      <span className="text-title font-medium">{lesson.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <SourceList sources={tool.sources} />
        </div>

        <aside className="order-first flex flex-col gap-6 xl:order-none xl:sticky xl:top-[calc(var(--header-height)+1.5rem)] xl:self-start">
          <PersonaSwitch />
          <div className="hidden xl:block"><Toc items={tool.toc} /></div>
        </aside>
      </div>
    </article>
  );
}
