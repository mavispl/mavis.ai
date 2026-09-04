/**
 * The shared finding type every audit pass emits.
 *
 * One shape for all five passes means `audit/<run>/findings.json` can be read by
 * one reporter, sorted by severity across passes, and diffed run over run to see
 * whether the content is getting better or worse.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type Severity = 'info' | 'low' | 'medium' | 'high';
export type Pass = 'schema' | 'fact' | 'pedagogy' | 'graph' | 'design';

export interface Finding {
  pass: Pass;
  severity: Severity;
  /** Stable machine key, e.g. 'missing-source' — groups findings across runs. */
  code: string;
  /** The lesson id, term, or file the finding is about. */
  subject: string;
  file?: string;
  message: string;
  /** What to actually do about it. Findings without a remedy are noise. */
  remedy?: string;
}

const ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2, info: 3 };

export const sortFindings = (findings: Finding[]) =>
  [...findings].sort(
    (a, b) => ORDER[a.severity] - ORDER[b.severity] || a.code.localeCompare(b.code),
  );

export function summarise(findings: Finding[]) {
  const bySeverity = { high: 0, medium: 0, low: 0, info: 0 };
  const byPass: Record<string, number> = {};
  for (const f of findings) {
    bySeverity[f.severity] += 1;
    byPass[f.pass] = (byPass[f.pass] ?? 0) + 1;
  }
  return { total: findings.length, bySeverity, byPass };
}

export function writeReport(runId: string, findings: Finding[]): string {
  const dir = join(process.cwd(), 'audit', runId);
  mkdirSync(dir, { recursive: true });
  const sorted = sortFindings(findings);
  const summary = summarise(sorted);

  writeFileSync(
    join(dir, 'findings.json'),
    JSON.stringify({ runId, generatedAt: new Date().toISOString(), summary, findings: sorted }, null, 2),
  );

  const lines: string[] = [
    `# Audit report — ${runId}`,
    '',
    `Generated ${new Date().toISOString()}`,
    '',
    `**${summary.total} findings** — ` +
      `${summary.bySeverity.high} high · ${summary.bySeverity.medium} medium · ` +
      `${summary.bySeverity.low} low · ${summary.bySeverity.info} info`,
    '',
  ];

  if (sorted.length === 0) {
    lines.push('No findings. Every pass is clean.', '');
  } else {
    for (const pass of ['schema', 'fact', 'pedagogy', 'graph', 'design'] as Pass[]) {
      const group = sorted.filter((f) => f.pass === pass);
      if (group.length === 0) continue;
      lines.push(`## ${pass} (${group.length})`, '');
      lines.push('| Severity | Code | Subject | Finding | Remedy |');
      lines.push('|---|---|---|---|---|');
      for (const f of group) {
        const cell = (s = '') => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        lines.push(
          `| ${f.severity} | \`${f.code}\` | \`${cell(f.subject)}\` | ${cell(f.message)} | ${cell(f.remedy)} |`,
        );
      }
      lines.push('');
    }
  }

  const reportPath = join(dir, 'report.md');
  writeFileSync(reportPath, lines.join('\n'));
  return reportPath;
}

/** A run fails if anything is `high`. Everything else is a backlog item. */
export const isBlocking = (findings: Finding[]) => findings.some((f) => f.severity === 'high');
