'use client';

import { useEffect, useId, useState } from 'react';
import { blockState, type BlockKind } from '@/lib/persona';
import { usePersona } from '@/components/course/PersonaProvider';
import { t, type StringKey } from '@/lib/i18n';

const LABEL: Record<BlockKind, StringKey> = {
  plainly: 'block.plainly',
  forEngineers: 'block.forEngineers',
  forLeads: 'block.forLeads',
  aside: 'block.aside',
};

const ACCENT: Record<BlockKind, string> = {
  plainly: 'var(--info)',
  forEngineers: 'var(--primary)',
  forLeads: 'var(--accent)',
  aside: 'var(--text-faint)',
};

/**
 * A persona-scoped section of a lesson (ADR-002).
 *
 * The persona decides whether this starts expanded or folded. The reader can
 * always override with a click; changing persona resets the override.
 *
 * The content is ALWAYS in the DOM. Folded means one click away, never absent:
 * Ctrl-F finds it, Pagefind indexes it, screen readers reach it. The lens never
 * becomes a gate.
 */
export function PersonaBlock({
  kind,
  title,
  children,
}: {
  kind: BlockKind;
  title?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const { persona, epoch } = usePersona();
  const desired = blockState(persona, kind) === 'open';
  const [open, setOpen] = useState(desired);

  // Follow the persona unless the reader has said otherwise since it last changed.
  useEffect(() => setOpen(desired), [epoch, desired]);

  return (
    <details
      className="persona-block group my-5 rounded-md border border-border bg-surface"
      data-block={kind}
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      style={{ ['--block-accent' as string]: ACCENT[kind] }}
    >
      <summary
        className="state-layer flex cursor-pointer list-none items-center gap-2.5 rounded-md px-4 py-2.5 select-none"
        aria-controls={id}
      >
        <span
          aria-hidden="true"
          className="inline-block h-3.5 w-[3px] shrink-0 rounded-full"
          style={{ background: 'var(--block-accent)' }}
        />
        <span className="label-caps" style={{ color: 'var(--block-accent)' }}>
          {title ?? t(LABEL[kind])}
        </span>
        <svg
          className="ml-auto h-4 w-4 shrink-0 text-text-faint transition-transform group-open:rotate-90"
          viewBox="0 0 16 16" fill="none" aria-hidden="true"
        >
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div id={id} className="persona-block-body border-t border-border-faint px-4 py-4">
        {children}
      </div>
    </details>
  );
}

type BlockProps = { children: React.ReactNode; title?: string };

export const Plainly = (p: BlockProps) => <PersonaBlock kind="plainly" {...p} />;
export const ForEngineers = (p: BlockProps) => <PersonaBlock kind="forEngineers" {...p} />;
export const ForLeads = (p: BlockProps) => <PersonaBlock kind="forLeads" {...p} />;
export const Aside = (p: BlockProps) => <PersonaBlock kind="aside" {...p} />;
