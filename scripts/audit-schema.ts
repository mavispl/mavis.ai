/**
 * Audit pass 1 — Schema.
 *
 * Velite already refuses to build content that breaks the frontmatter contract.
 * This pass checks the things a per-file schema cannot see: agreement between the
 * curriculum map and what was actually authored, freshness decay, and metadata
 * that is individually valid but collectively wrong.
 *
 *   pnpm tsx scripts/audit-schema.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { freshnessOf, daysSince } from '../lib/freshness.ts';
import { type Finding } from './lib/findings.ts';

/**
 * Agenda coverage is checked by substring, so it must not fail on ordinary
 * English variation. "specialization" vs "specialisation" and "context window"
 * vs "context windows" are the same topic; reporting them as gaps trains authors
 * to ignore the check, which is worse than not having it.
 */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2019'']/g, "'")
    .replace(/isation\b/g, 'ization')
    .replace(/ise\b/g, 'ize')
    .replace(/ising\b/g, 'izing')
    .replace(/ised\b/g, 'ized')
    .replace(/([a-z]{3,})(?:es|s)\b/g, '$1')
    .replace(/\s+/g, ' ');
}

interface MapNode {
  id: string; contentPath: string; volatility: 'low' | 'medium' | 'high';
  personas: string[]; estMinutes: number; covers: string[]; title: string;
  crashCourse?: number;
}

export function auditSchema(): Finding[] {
  const findings: Finding[] = [];
  const mapPath = join(process.cwd(), 'spec/curriculum/map.json');

  if (!existsSync(mapPath)) {
    return [{
      pass: 'schema', severity: 'high', code: 'map-missing', subject: 'spec/curriculum/map.json',
      message: 'The curriculum map has not been generated.',
      remedy: 'Run `pnpm tsx scripts/build-map.ts`.',
    }];
  }

  const map = JSON.parse(readFileSync(mapPath, 'utf8')) as {
    nodes: MapNode[];
    crashCourse: string[];
  };
  const nodeById = new Map(map.nodes.map((n) => [n.id, n]));

  const velitePath = join(process.cwd(), '.velite/lessons.json');
  const lessons: any[] = existsSync(velitePath)
    ? JSON.parse(readFileSync(velitePath, 'utf8'))
    : [];
  const lessonById = new Map(lessons.map((l) => [l.id, l]));

  // 1. Authored lessons must correspond to a planned node. An orphan means the
  //    agenda and the content have diverged, and no audit downstream can tell
  //    which one is right.
  for (const lesson of lessons) {
    if (!nodeById.has(lesson.id)) {
      findings.push({
        pass: 'schema', severity: 'high', code: 'orphan-lesson', subject: lesson.id,
        file: lesson.contentPath,
        message: `Lesson ${lesson.id} is not in the curriculum map.`,
        remedy: 'Add the bullet to scripts/lib/agenda.ts and rebuild the map, or remove the file.',
      });
    }
  }

  // 2. Planned but not yet authored — expected during a staged rollout, so
  //    informational rather than blocking.
  for (const node of map.nodes) {
    if (!lessonById.has(node.id)) {
      findings.push({
        pass: 'schema', severity: 'info', code: 'not-authored', subject: node.id,
        file: node.contentPath,
        message: `Planned lesson "${node.title}" has no content file yet.`,
        remedy: 'Author it in Stage 4, or leave queued in spec/curriculum/BACKLOG.md.',
      });
    }
  }

  for (const lesson of lessons) {
    const node = nodeById.get(lesson.id);

    // 3. Freshness decay. The same function that draws the reader-facing badge
    //    builds this queue, so the page and the pipeline can never disagree.
    const state = freshnessOf(lesson.verifiedOn, lesson.volatility);
    if (state === 'stale') {
      findings.push({
        pass: 'schema', severity: 'high', code: 'stale-verification', subject: lesson.id,
        file: lesson.contentPath,
        message: `Verified ${daysSince(lesson.verifiedOn)} days ago at volatility "${lesson.volatility}" — past the stale window.`,
        remedy: 'Re-run the fact audit for this page and update verifiedOn.',
      });
    } else if (state === 'ageing') {
      findings.push({
        pass: 'schema', severity: 'low', code: 'recheck-due', subject: lesson.id,
        file: lesson.contentPath,
        message: `Verified ${daysSince(lesson.verifiedOn)} days ago — recheck window reached.`,
        remedy: 'Queue for the next fact-audit run.',
      });
    }

    if (new Date(lesson.verifiedOn).getTime() > Date.now()) {
      findings.push({
        pass: 'schema', severity: 'high', code: 'future-verification', subject: lesson.id,
        message: `verifiedOn is in the future (${lesson.verifiedOn}).`,
        remedy: 'A verification date must record when someone actually checked.',
      });
    }

    if (!node) continue;

    // 4. Drift between plan and page.
    if (lesson.volatility !== node.volatility) {
      findings.push({
        pass: 'schema', severity: 'medium', code: 'volatility-drift', subject: lesson.id,
        message: `Page says volatility "${lesson.volatility}", map says "${node.volatility}".`,
        remedy: 'Decide which is right; if the page is, update scripts/lib/agenda.ts.',
      });
    }

    const missingPersonas = node.personas.filter((p) => !lesson.personas.includes(p));
    if (missingPersonas.length) {
      findings.push({
        pass: 'schema', severity: 'medium', code: 'persona-drift', subject: lesson.id,
        message: `Map targets ${missingPersonas.join(', ')} but the page does not claim them.`,
        remedy: 'Either serve those readers on the page, or narrow the map entry.',
      });
    }

    // 5. Agenda coverage. The bullet's sub-topics are the contract with the
    //    syllabus; a page that silently drops one leaves a hole nobody notices.
    const haystack = normalise(`${lesson.raw ?? ''} ${lesson.title} ${lesson.summary}`);
    const uncovered = node.covers.filter((topic) => !haystack.includes(normalise(topic)));
    if (uncovered.length) {
      findings.push({
        pass: 'schema', severity: uncovered.length > node.covers.length / 2 ? 'high' : 'medium',
        code: 'agenda-topic-uncovered', subject: lesson.id, file: lesson.contentPath,
        message: `Agenda sub-topics not mentioned: ${uncovered.join(', ')}.`,
        remedy: 'Cover them, or record in the ADR why the agenda item was folded elsewhere.',
      });
    }

    if (!lesson.draft && lesson.checks.length < 1) {
      findings.push({
        pass: 'schema', severity: 'medium', code: 'no-checks', subject: lesson.id,
        message: 'Published lesson has no check for understanding.',
        remedy: 'Add at least one self-check.',
      });
    }
  }

  // 6. The crash course must be a contiguous, unambiguous sequence — but only
  //    once every step is authored. Mid-rollout, gaps are the steps still queued.
  const orders = lessons
    .filter((l) => typeof l.crashCourse === 'number')
    .map((l) => l.crashCourse)
    .sort((a, b) => a - b);
  const plannedPath = map.crashCourse ?? [];
  const pathComplete =
    plannedPath.length > 0 && plannedPath.every((id) => lessonById.has(id));
  const dupes = orders.filter((n, i) => orders[i - 1] === n);
  if (dupes.length) {
    findings.push({
      pass: 'schema', severity: 'medium', code: 'crash-course-collision', subject: 'crash-course',
      message: `Duplicate crashCourse positions: ${[...new Set(dupes)].join(', ')}.`,
      remedy: 'Positions must be unique — they define the reading order.',
    });
  }
  for (let i = 0; pathComplete && i < orders.length; i += 1) {
    if (orders[i] !== i + 1) {
      findings.push({
        pass: 'schema', severity: 'low', code: 'crash-course-gap', subject: 'crash-course',
        message: `Crash-course sequence has a gap at position ${i + 1} (found ${orders[i]}).`,
        remedy: 'Renumber so the path reads 1..n with no holes.',
      });
      break;
    }
  }

  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const findings = auditSchema();
  const { writeReport, isBlocking, summarise } = await import('./lib/findings.ts');
  const runId = `schema-${new Date().toISOString().slice(0, 10)}`;
  const path = writeReport(runId, findings);
  console.log(JSON.stringify(summarise(findings)), '->', path);
  process.exit(isBlocking(findings) ? 1 : 0);
}
