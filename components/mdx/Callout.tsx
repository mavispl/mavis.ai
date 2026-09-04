import type { ReactNode } from 'react';

export type CalloutTone = 'note' | 'key' | 'warn' | 'danger' | 'tip';

const TONE: Record<CalloutTone, { label: string; fg: string; bg: string; icon: ReactNode }> = {
  note: {
    label: 'Note', fg: 'var(--info)', bg: 'var(--info-container)',
    icon: <path d="M8 7v5M8 4.5h.01" strokeWidth="1.6" strokeLinecap="round" />,
  },
  key: {
    label: 'Key idea', fg: 'var(--primary)', bg: 'var(--primary-container)',
    icon: <path d="M8 2.5l1.7 3.6 3.8.5-2.8 2.7.7 3.9L8 11.4l-3.4 1.8.7-3.9L2.5 6.6l3.8-.5z" strokeWidth="1.3" strokeLinejoin="round" />,
  },
  warn: {
    label: 'Watch out', fg: 'var(--warn)', bg: 'var(--warn-container)',
    icon: <path d="M8 3l5.5 10h-11z M8 7v3M8 11.6h.01" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />,
  },
  danger: {
    label: 'Don’t', fg: 'var(--err)', bg: 'var(--err-container)',
    icon: <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeWidth="1.7" strokeLinecap="round" />,
  },
  tip: {
    label: 'In practice', fg: 'var(--ok)', bg: 'var(--ok-container)',
    icon: <path d="M3.5 8.5l3 3 6-6.5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  },
};

/**
 * Tone is carried by a label and an icon as well as by colour — the a11y floor
 * forbids colour as the only signal.
 */
export function Callout({
  tone = 'note',
  title,
  children,
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}) {
  const spec = TONE[tone];
  return (
    <div
      className="my-5 rounded-md border-l-[3px] px-4 py-3"
      style={{ borderLeftColor: spec.fg, background: spec.bg }}
      role={tone === 'danger' || tone === 'warn' ? 'note' : undefined}
    >
      <p className="mb-1.5 flex items-center gap-2 text-small font-semibold" style={{ color: spec.fg }}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
          {spec.icon}
        </svg>
        {title ?? spec.label}
      </p>
      <div className="callout-body text-body-lg" style={{ color: 'var(--text)' }}>{children}</div>
    </div>
  );
}
