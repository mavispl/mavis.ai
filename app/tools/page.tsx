import type { Metadata } from 'next';
import Link from 'next/link';
import { allTools, gotchasByCategory, allGotchas } from '@/lib/content';
import { GotchaCard } from '@/components/course/GotchaCard';
import { FreshnessBadge } from '@/components/course/FreshnessBadge';

export const metadata: Metadata = {
  title: 'Tools & setup',
  description:
    'Getting a working environment, and the pitfalls that cost everyone else an afternoon first.',
};

const CATEGORY_LABEL: Record<string, string> = {
  harness: 'Harnesses',
  runtime: 'Runtimes',
  protocol: 'Protocols',
  observability: 'Observability',
  setup: 'Setup',
};

export default function ToolsPage() {
  const tools = allTools();
  const gotchaGroups = gotchasByCategory();
  const gotchaCount = allGotchas().length;

  const byCategory = tools.reduce<Record<string, typeof tools>>((acc, tool) => {
    (acc[tool.category] ??= []).push(tool);
    return acc;
  }, {});

  return (
    <div className="mx-auto px-4 py-10 sm:px-6" style={{ maxWidth: 'var(--content-max)' }}>
      <header className="border-b border-border pb-8">
        <p className="label-caps">Reference</p>
        <h1 className="mt-2 text-display-md font-semibold">Tools &amp; setup</h1>
        <p className="measure mt-3 text-body-lg text-text-muted">
          What to install, how to configure it, and the specific ways it goes wrong. This
          is the fastest-moving part of the site: every page here carries a verification
          date and is rechecked monthly, because setup instructions rot faster than
          anything else in the course.
        </p>
      </header>

      {tools.length === 0 ? (
        <p className="measure mt-8 rounded-md border border-border bg-surface p-5 text-body text-text-muted">
          Tool pages are generated last in each run, so their verification dates are as
          recent as possible. They are marked <code>volatility: high</code>, which means
          the schema requires sources and the audit requeues them every 30 days.
        </p>
      ) : (
        Object.entries(byCategory).map(([category, items]) => (
          <section key={category} className="mt-8">
            <h2 className="text-headline font-semibold">
              {CATEGORY_LABEL[category] ?? category}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {items.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.permalink}
                  className="state-layer group rounded-md border border-border bg-surface-raised p-4 shadow-elev-1"
                >
                  <h3 className="text-title-lg font-semibold group-hover:text-primary">
                    {tool.title}
                  </h3>
                  <p className="mt-1.5 text-body text-text-muted">{tool.summary}</p>
                  <p className="mt-3">
                    <FreshnessBadge
                      verifiedOn={tool.verifiedOn}
                      volatility={tool.volatility}
                      compact
                    />
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      <section id="gotchas" className="mt-12 scroll-mt-20 border-t border-border pt-8">
        <h2 className="text-display-sm font-semibold">Gotchas</h2>
        <p className="measure mt-2 text-body-lg text-text-muted">
          Every pitfall and anti-pattern from across the course, grouped by topic. Each one
          says what goes wrong, why it happens, how to notice, and what to do instead —
          because &ldquo;be careful&rdquo; is not a mitigation.
        </p>
        {gotchaCount > 0 && (
          <p className="mt-2 text-small text-text-faint">{gotchaCount} entries</p>
        )}

        {gotchaGroups.length === 0 ? (
          <p className="measure mt-5 rounded-md border border-border bg-surface p-5 text-body text-text-muted">
            Gotchas are not written as a separate exercise — each one is filed by the
            lesson that warns about it, so the catalogue and the course cannot disagree.
          </p>
        ) : (
          gotchaGroups.map((group) => (
            <div key={group.category} className="mt-8">
              <h3 className="label-caps mb-3 text-accent">{group.category}</h3>
              <div className="grid gap-3">
                {group.items.map((g) => (
                  <GotchaCard key={g.id} gotcha={g} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
