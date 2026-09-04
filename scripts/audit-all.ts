/**
 * Stage 5 — the combined audit run.
 *
 * Runs every automated pass and writes ONE report, so severity sorts across
 * passes and a run can be diffed against the previous one. The two subagent
 * passes (fact, pedagogy) are not automatable here; the report names them as
 * outstanding rather than silently omitting them, because a report that looks
 * complete while missing a pass is worse than one that says what it skipped.
 *
 *   pnpm tsx scripts/audit-all.ts
 */

import { auditSchema } from './audit-schema.ts';
import { auditGraph } from './audit-graph.ts';
import { auditA11y } from './audit-a11y.ts';
import { writeReport, summarise, isBlocking, type Finding } from './lib/findings.ts';
import { logRecord, newRunId } from './lib/log.ts';

const runId = newRunId('audit');
const started = Date.now();

const findings: Finding[] = [
  ...auditSchema(),
  ...auditGraph(),
  ...(await auditA11y()),
];

// Name what did not run. Silence would read as a pass.
findings.push(
  {
    pass: 'fact', severity: 'info', code: 'pass-requires-agent', subject: 'fact-audit',
    message: 'The fact pass runs as a subagent and was not executed in this run.',
    remedy: 'Spawn .claude/agents/fact-auditor.md over the module before publishing.',
  },
  {
    pass: 'pedagogy', severity: 'info', code: 'pass-requires-agent', subject: 'pedagogy-audit',
    message: 'The pedagogy pass runs as a subagent and was not executed in this run.',
    remedy: 'Spawn .claude/agents/pedagogy-auditor.md over the module before publishing.',
  },
);

const summary = summarise(findings);
const path = writeReport(runId, findings);

logRecord({
  runId, stage: 'audit', subject: 'full-site', status: isBlocking(findings) ? 'fail' : 'ok',
  durationMs: Date.now() - started,
  outputs: { report: path, ...summary },
});

console.log(`audit ${runId}`);
console.log(`  ${summary.total} findings — ` +
  `${summary.bySeverity.high} high, ${summary.bySeverity.medium} medium, ` +
  `${summary.bySeverity.low} low, ${summary.bySeverity.info} info`);
console.log(`  by pass: ${JSON.stringify(summary.byPass)}`);
console.log(`  report: ${path}`);

process.exit(isBlocking(findings) ? 1 : 0);
