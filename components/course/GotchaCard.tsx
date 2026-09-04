import { t } from '@/lib/i18n';

const SEVERITY: Record<string, { color: string; label: string }> = {
  low: { color: 'var(--text-faint)', label: 'Low' },
  medium: { color: 'var(--warn)', label: 'Medium' },
  high: { color: 'var(--err)', label: 'High' },
  critical: { color: 'var(--err)', label: 'Critical' },
};

export interface GotchaData {
  id: string;
  title: string;
  severity: string;
  whatGoesWrong: string;
  whyItHappens: string;
  howToDetect: string;
  fix: string;
}

/** The reference site's four-part shape, kept because it is genuinely good. */
export function GotchaCard({ gotcha }: { gotcha: GotchaData }) {
  const sev = SEVERITY[gotcha.severity] ?? SEVERITY.medium;
  const rows = [
    { key: 'gotcha.whatGoesWrong', value: gotcha.whatGoesWrong },
    { key: 'gotcha.whyItHappens', value: gotcha.whyItHappens },
    { key: 'gotcha.howToDetect', value: gotcha.howToDetect },
    { key: 'gotcha.fix', value: gotcha.fix },
  ] as const;

  return (
    <article id={gotcha.id} className="scroll-mt-24 rounded-md border border-border bg-surface-raised p-4 shadow-elev-1">
      <header className="mb-3 flex items-start gap-3">
        <h3 className="text-title-lg font-semibold">{gotcha.title}</h3>
        <span
          className="ml-auto shrink-0 rounded-full border px-2 py-0.5 text-label font-semibold"
          style={{ color: sev.color, borderColor: sev.color }}
        >
          {sev.label}
        </span>
      </header>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.key}>
            <dt className="label-caps mb-1">{t(row.key)}</dt>
            <dd className="text-body">{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
