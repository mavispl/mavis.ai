/**
 * Audit pass 4 — Graph.
 *
 * The site is a graph, not a pile of pages: lessons cite prerequisites, wrap
 * jargon in wiki links, and gotchas point back at the lessons that prevent them.
 * Every one of those edges is a promise to the reader. This pass checks that no
 * edge dangles and that no node is unreachable.
 *
 *   pnpm tsx scripts/audit-graph.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { type Finding } from './lib/findings.ts';

const read = <T>(rel: string, fallback: T): T => {
  const p = join(process.cwd(), rel);
  return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as T) : fallback;
};

export function auditGraph(): Finding[] {
  const findings: Finding[] = [];

  // A reference to a lesson that is planned but not yet authored is not a dead
  // link — it is a pending one, and during a staged rollout most cross-references
  // are pending by construction. Conflating the two makes the audit unusable
  // exactly when it is most needed, so the map is loaded to tell them apart.
  const map = read<{ nodes: { id: string }[] }>('spec/curriculum/map.json', { nodes: [] });
  const plannedIds = new Set(map.nodes.map((n) => n.id));

  const lessons = read<any[]>('.velite/lessons.json', []);
  const wiki = read<any[]>('.velite/wiki.json', []);
  const gotchas = read<any[]>('.velite/gotchas.json', []);
  const tools = read<any[]>('.velite/tools.json', []);
  const recipes = read<any[]>('.velite/recipes.json', []);
  const labs = read<any[]>('.velite/labs.json', []);

  const lessonIds = new Set(lessons.map((l) => l.id));
  const wikiSlugs = new Set(wiki.map((w) => w.slug));
  const wikiTerms = new Map<string, any>();
  for (const entry of wiki) {
    wikiTerms.set(entry.term.toLowerCase(), entry);
    for (const alias of entry.aliases ?? []) wikiTerms.set(alias.toLowerCase(), entry);
  }
  const labIds = new Set(labs.map((l) => l.id));

  const edge = (
    from: string, file: string | undefined, field: string,
    targets: string[], known: Set<string>, kind: string,
  ) => {
    for (const target of targets) {
      if (known.has(target)) continue;
      const planned = kind === 'lesson' && plannedIds.has(target);
      findings.push({
        pass: 'graph',
        severity: planned ? 'info' : 'high',
        code: planned ? 'pending-reference' : 'dead-reference',
        subject: from,
        file,
        message: planned
          ? `${field} points at ${target}, which is in the curriculum map but not yet authored.`
          : `${field} points at ${kind} "${target}", which does not exist.`,
        remedy: planned
          ? 'Nothing to fix now; the link resolves when that module is generated. It renders as plain text until then.'
          : `Fix the reference or author the missing ${kind}.`,
      });
    }
  };

  for (const l of lessons) {
    edge(l.id, l.contentPath, 'prerequisites', l.prerequisites ?? [], lessonIds, 'lesson');
    edge(l.id, l.contentPath, 'related', l.related ?? [], lessonIds, 'lesson');
    edge(l.id, l.contentPath, 'labs', l.labs ?? [], labIds, 'lab');

    // A lesson cannot depend on itself, and a prerequisite that comes later in
    // reading order is a sequencing bug the reader will feel as confusion.
    if ((l.prerequisites ?? []).includes(l.id)) {
      findings.push({
        pass: 'graph', severity: 'high', code: 'self-prerequisite', subject: l.id,
        message: 'Lesson lists itself as a prerequisite.', remedy: 'Remove it.',
      });
    }
    for (const pre of l.prerequisites ?? []) {
      const target = lessons.find((x) => x.id === pre);
      if (!target) continue;
      const later =
        target.week > l.week ||
        (target.week === l.week && target.module > l.module) ||
        (target.week === l.week && target.module === l.module && target.bullet > l.bullet);
      if (later) {
        findings.push({
          pass: 'graph', severity: 'medium', code: 'forward-prerequisite', subject: l.id,
          message: `Prerequisite ${pre} comes later in reading order.`,
          remedy: 'Reorder the agenda, or drop the prerequisite and explain inline.',
        });
      }
    }

    // Terms a lesson claims to introduce must exist in the wiki — that link is
    // what stops a junior stranding on a word.
    for (const term of l.defines ?? []) {
      if (!wikiTerms.has(String(term).toLowerCase())) {
        findings.push({
          pass: 'graph', severity: 'medium', code: 'undefined-term', subject: l.id,
          file: l.contentPath,
          message: `Lesson claims to define "${term}" but there is no wiki entry.`,
          remedy: 'Add the wiki entry, or drop it from `defines`.',
        });
      }
    }

    // <Term slug="..."> must resolve.
    for (const match of String(l.raw ?? '').matchAll(/<Term\s+[^>]*slug=["']([^"']+)["']/g)) {
      if (!wikiSlugs.has(match[1])) {
        findings.push({
          pass: 'graph', severity: 'high', code: 'dead-term-link', subject: l.id,
          file: l.contentPath,
          message: `<Term slug="${match[1]}"> has no matching wiki entry.`,
          remedy: 'Create the entry or correct the slug.',
        });
      }
    }

    // Internal markdown links into the site must resolve to a real permalink.
    const permalinks = new Set<string>([
      ...lessons.map((x) => x.permalink),
      ...wiki.map((x) => x.permalink),
      ...tools.map((x) => x.permalink),
      ...recipes.map((x) => x.permalink),
      '/', '/crash-course', '/deep-dive', '/agents', '/wiki', '/tools', '/design',
    ]);
    for (const match of String(l.raw ?? '').matchAll(/\]\((\/[^)#\s]*)/g)) {
      const href = match[1].replace(/\/$/, '') || '/';
      if (!permalinks.has(href) && !href.startsWith('/deep-dive/w')) {
        findings.push({
          pass: 'graph', severity: 'medium', code: 'dead-internal-link', subject: l.id,
          file: l.contentPath,
          message: `Internal link ${href} does not match any page.`,
          remedy: 'Fix the path or author the target.',
        });
      }
    }
  }

  for (const w of wiki) {
    edge(w.term, undefined, 'lessons', w.lessons ?? [], lessonIds, 'lesson');
    for (const rel of w.relatedTerms ?? []) {
      if (!wikiTerms.has(String(rel).toLowerCase())) {
        findings.push({
          pass: 'graph', severity: 'low', code: 'dead-related-term', subject: w.term,
          message: `Related term "${rel}" has no entry.`,
          remedy: 'Add it, or remove the cross-reference.',
        });
      }
    }
    // An entry no lesson teaches is a glossary orphan: defensible for a
    // background term, suspicious in bulk.
    if ((w.lessons ?? []).length === 0) {
      findings.push({
        pass: 'graph', severity: 'low', code: 'orphan-wiki-entry', subject: w.term,
        message: 'No lesson links to this term.',
        remedy: 'Link it from the lesson that introduces it, or accept it as reference-only.',
      });
    }
  }

  for (const g of gotchas) {
    edge(g.id, undefined, 'relatedLessons', g.relatedLessons ?? [], lessonIds, 'lesson');
  }
  for (const r of recipes) {
    edge(r.id, undefined, 'relatedLessons', r.relatedLessons ?? [], lessonIds, 'lesson');
    if ((r.harnesses ?? []).length < 2) {
      findings.push({
        pass: 'graph', severity: 'medium', code: 'single-harness-recipe', subject: r.id,
        message: 'Recipe covers fewer than two harnesses.',
        remedy: 'Vendor neutrality is structural: show at least two, or move it to a tool page.',
      });
    }
  }
  for (const t of tools) {
    edge(t.id, undefined, 'relatedLessons', t.relatedLessons ?? [], lessonIds, 'lesson');
  }

  // Reachability: a lesson nothing links to and that is not on a path is a page
  // only search will ever find.
  const linked = new Set<string>();
  for (const l of lessons) {
    for (const id of [...(l.related ?? []), ...(l.prerequisites ?? [])]) linked.add(id);
  }
  for (const w of wiki) for (const id of w.lessons ?? []) linked.add(id);
  for (const l of lessons) {
    if (!linked.has(l.id) && typeof l.crashCourse !== 'number' && l.bullet !== 1) {
      findings.push({
        pass: 'graph', severity: 'info', code: 'weakly-linked-lesson', subject: l.id,
        message: 'Nothing links to this lesson except its module index.',
        remedy: 'Add a cross-reference from a related lesson or a wiki entry.',
      });
    }
  }

  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const findings = auditGraph();
  const { writeReport, isBlocking, summarise } = await import('./lib/findings.ts');
  const runId = `graph-${new Date().toISOString().slice(0, 10)}`;
  const path = writeReport(runId, findings);
  console.log(JSON.stringify(summarise(findings)), '->', path);
  process.exit(isBlocking(findings) ? 1 : 0);
}
