/**
 * Stage 2 — Curriculum map.
 *
 * Derives the course graph from `scripts/lib/agenda.ts`: one node per agenda
 * bullet, with ids, permalinks, prerequisite edges, volatility and the crash
 * course path. Everything downstream — authoring, audits, navigation — reads
 * this file rather than re-deriving structure from the outline.
 *
 *   pnpm tsx scripts/build-map.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AGENDA, lessonIdOf, permalinkOf, type Persona, type Volatility } from './lib/agenda.ts';
import { logRecord, newRunId } from './lib/log.ts';

interface MapNode {
  id: string;
  week: number;
  weekTitle: string;
  module: number;
  moduleTitle: string;
  bullet: number;
  label: string;
  title: string;
  covers: string[];
  permalink: string;
  contentPath: string;
  volatility: Volatility;
  personas: Persona[];
  estMinutes: number;
  crashCourse?: number;
  prerequisites: string[];
}

const DEFAULT_PERSONAS: Persona[] = ['junior', 'mid', 'senior', 'lead', 'cto'];

interface WeekSummary {
  week: number;
  title: string;
  goal: string;
  modules: { module: number; title: string; volatility: Volatility; lessonCount: number; lessons: string[] }[];
}

function build(): { nodes: MapNode[]; weeks: WeekSummary[] } {
  const nodes: MapNode[] = [];

  for (const week of AGENDA) {
    for (const mod of week.modules) {
      mod.bullets.forEach((bullet, index) => {
        const b = index + 1;
        const id = lessonIdOf(week.week, mod.module, b);

        // Prerequisite policy, deliberately shallow: the previous bullet in the
        // same module, plus the module's opening bullet once you are past it.
        // A deep dependency graph looks rigorous and reads as a maze; readers
        // arrive from search as often as from the previous page.
        const prerequisites: string[] = [];
        if (b > 1) prerequisites.push(lessonIdOf(week.week, mod.module, b - 1));
        if (b > 2) prerequisites.push(lessonIdOf(week.week, mod.module, 1));
        // Every week after the first assumes the mechanics module of week 1.
        if (week.week > 1 && mod.module === 1 && b === 1) {
          prerequisites.push(lessonIdOf(1, 1, 2));
        }

        nodes.push({
          id,
          week: week.week,
          weekTitle: week.title,
          module: mod.module,
          moduleTitle: mod.title,
          bullet: b,
          label: bullet.label,
          title: bullet.title,
          covers: bullet.covers,
          permalink: permalinkOf(week.week, mod.module, b),
          contentPath: `content/lessons/w${week.week}/m${String(mod.module).padStart(2, '0')}/b${String(b).padStart(2, '0')}.mdx`,
          volatility: bullet.volatility ?? mod.volatility,
          personas: bullet.personas ?? DEFAULT_PERSONAS,
          estMinutes: bullet.estMinutes ?? 12,
          ...(bullet.crashCourse ? { crashCourse: bullet.crashCourse } : {}),
          prerequisites: [...new Set(prerequisites)],
        });
      });
    }
  }

  const weeks: WeekSummary[] = AGENDA.map((w) => ({
    week: w.week,
    title: w.title,
    goal: w.goal,
    modules: w.modules.map((m) => ({
      module: m.module,
      title: m.title,
      volatility: m.volatility,
      lessonCount: m.bullets.length,
      lessons: m.bullets.map((_, i) => lessonIdOf(w.week, m.module, i + 1)),
    })),
  }));

  return { nodes, weeks };
}

const runId = newRunId('map');
const { nodes, weeks } = build();

const byVolatility = nodes.reduce<Record<string, number>>((acc, n) => {
  acc[n.volatility] = (acc[n.volatility] ?? 0) + 1;
  return acc;
}, {});

const crashCourse = nodes
  .filter((n) => n.crashCourse)
  .sort((a, b) => (a.crashCourse ?? 0) - (b.crashCourse ?? 0))
  .map((n) => n.id);

const map = {
  generatedAt: new Date().toISOString(),
  runId,
  source: 'scripts/lib/agenda.ts',
  totals: {
    weeks: weeks.length,
    modules: weeks.reduce((n, w) => n + w.modules.length, 0),
    lessons: nodes.length,
    readingMinutes: nodes.reduce((n, x) => n + x.estMinutes, 0),
    byVolatility,
  },
  crashCourse,
  weeks,
  nodes,
};

const dir = join(process.cwd(), 'spec', 'curriculum');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'map.json'), JSON.stringify(map, null, 2));

logRecord({
  runId, stage: 'map', subject: 'full-agenda', status: 'ok',
  outputs: { file: 'spec/curriculum/map.json', ...map.totals, crashCourse: crashCourse.length },
});

console.log(
  `map: ${map.totals.lessons} lessons across ${map.totals.modules} modules ` +
  `(${map.totals.readingMinutes} min), volatility ${JSON.stringify(byVolatility)}, ` +
  `crash course ${crashCourse.length}`,
);
