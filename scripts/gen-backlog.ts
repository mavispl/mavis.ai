/**
 * Generates spec/curriculum/BACKLOG.md from the map plus what is actually
 * authored, so the queue cannot drift from reality the way a hand-kept list does.
 *
 *   pnpm tsx scripts/gen-backlog.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const map = JSON.parse(readFileSync(join(root, 'spec/curriculum/map.json'), 'utf8'));
const lessonsPath = join(root, '.velite/lessons.json');
const authored = new Set<string>(
  existsSync(lessonsPath)
    ? JSON.parse(readFileSync(lessonsPath, 'utf8')).map((l: { id: string }) => l.id)
    : [],
);

/** Recheck cadence is derived from volatility, not chosen per module. */
const CADENCE: Record<string, string> = {
  high: '30 days',
  medium: '90 days',
  low: '365 days',
};

const lines: string[] = [
  '# Curriculum backlog',
  '',
  `Generated from \`spec/curriculum/map.json\` on ${new Date().toISOString().slice(0, 10)}.`,
  'Do not edit by hand — run `pnpm tsx scripts/gen-backlog.ts`.',
  '',
  `**${authored.size} of ${map.nodes.length} lessons authored.**`,
  '',
  'Each module is generated and audited as one unit by `.claude/skills/course-run`.',
  'Recheck cadence follows the module\'s volatility: a page about pricing rots in weeks,',
  'a page about attention does not.',
  '',
  '| Week | Module | Lessons | Done | Volatility | Recheck | Status |',
  '|---|---|---:|---:|---|---|---|',
];

for (const week of map.weeks) {
  for (const mod of week.modules) {
    const done = mod.lessons.filter((id: string) => authored.has(id)).length;
    const status =
      done === 0 ? 'queued' : done === mod.lessonCount ? '**complete**' : `in progress`;
    lines.push(
      `| ${week.week} ${week.title} | ${String(mod.module).padStart(2, '0')} ${mod.title} | ` +
        `${mod.lessonCount} | ${done} | ${mod.volatility} | ${CADENCE[mod.volatility]} | ${status} |`,
    );
  }
}

const pending = map.nodes.filter((n: { id: string }) => !authored.has(n.id));
const nextModule = pending[0]
  ? `w${pending[0].week}.m${String(pending[0].module).padStart(2, '0')} — ${pending[0].moduleTitle}`
  : null;

lines.push(
  '',
  '## Next up',
  '',
  nextModule
    ? `\`${nextModule}\`. Run the pipeline for one module at a time:\n\n` +
      '```bash\n' +
      'pnpm tsx scripts/build-map.ts && pnpm content && pnpm tsx scripts/audit-all.ts\n' +
      '```\n\n' +
      'Stage 3 (research) and Stage 4 (authoring) are driven by `.claude/skills/course-run`,\n' +
      'which gates on the design system being accepted before it writes any content.'
    : 'All planned lessons are authored. The remaining work is re-verification on cadence.',
  '',
  '## Standing work',
  '',
  '- **Fact re-audit.** High-volatility pages fall due every 30 days; `audit:schema` raises',
  '  a `recheck-due` finding at the window and `stale-verification` past it.',
  '- **Crash-course path.** Fixed in the agenda, so it fills in as its source lessons are',
  '  authored. The sequencing check only enforces contiguity once every step exists.',
  '- **Polish translation.** Content ids are locale-independent and UI strings go through',
  '  `t()`, so a `translate` stage slots between Author and Audit without restructuring',
  '  (ADR-004).',
  '',
);

writeFileSync(join(root, 'spec/curriculum/BACKLOG.md'), lines.join('\n'));
console.log(`backlog: ${authored.size}/${map.nodes.length} authored`);
