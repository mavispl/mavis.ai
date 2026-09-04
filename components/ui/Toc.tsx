'use client';

import { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';

export interface TocItem {
  title: string;
  url: string;
  items?: TocItem[];
}

function flatten(items: readonly TocItem[], depth = 0): { title: string; url: string; depth: number }[] {
  return items.flatMap((i) => [
    { title: i.title, url: i.url, depth },
    ...(i.items ? flatten(i.items, depth + 1) : []),
  ]);
}

export function Toc({ items }: { items: readonly TocItem[] }) {
  const flat = flatten(items).filter((i) => i.depth < 2);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (flat.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );
    for (const item of flat) {
      const el = document.getElementById(item.url.slice(1));
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat.length]);

  if (flat.length < 2) return null;

  return (
    <nav aria-label={t('lesson.onThisPage')}>
      <p className="label-caps mb-2">{t('lesson.onThisPage')}</p>
      <ul className="space-y-1 border-l border-border">
        {flat.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              aria-current={active === item.url ? 'location' : undefined}
              className={`-ml-px block border-l py-0.5 text-small transition-colors ${
                active === item.url
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
              style={{ paddingLeft: `${0.75 + item.depth * 0.75}rem` }}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
