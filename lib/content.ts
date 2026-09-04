/**
 * The read layer over Velite's generated data.
 *
 * Everything downstream — pages, audits, the crash-course path, the wiki index —
 * goes through here, so there is exactly one place that knows how content is
 * shaped and one place to change when it moves.
 */

import { lessons, wiki, gotchas, tools, recipes, labs } from '#content';

export type Lesson = (typeof lessons)[number];
export type WikiEntry = (typeof wiki)[number];
export type Gotcha = (typeof gotchas)[number];
export type ToolPage = (typeof tools)[number];
export type Recipe = (typeof recipes)[number];
export type Lab = (typeof labs)[number];

export const WEEK_TITLES: Record<number, { title: string; goal: string }> = {
  1: {
    title: 'Core',
    goal: 'Understand generative AI deeply enough to reason beyond current tools.',
  },
  2: {
    title: 'Agents',
    goal: 'Shape and build agentic systems that deliver value with bounded supervision.',
  },
  3: {
    title: 'Product',
    goal: 'Direct AI toward meaningful system changes and verify what ships.',
  },
  4: {
    title: 'Takeoff',
    goal: 'Build autonomous systems that operate, recover, and improve over time.',
  },
};

const published = <T extends { draft?: boolean }>(xs: readonly T[]) =>
  xs.filter((x) => !x.draft);

export const allLessons = (): Lesson[] =>
  published(lessons).sort(
    (a, b) => a.week - b.week || a.module - b.module || a.bullet - b.bullet,
  );

export const lessonById = (id: string): Lesson | undefined =>
  allLessons().find((l) => l.id === id);

export const lessonsOfWeek = (week: number): Lesson[] =>
  allLessons().filter((l) => l.week === week);

export interface ModuleGroup {
  week: number;
  module: number;
  moduleTitle: string;
  lessons: Lesson[];
}

export function modulesOfWeek(week: number): ModuleGroup[] {
  const byModule = new Map<number, ModuleGroup>();
  for (const lesson of lessonsOfWeek(week)) {
    let group = byModule.get(lesson.module);
    if (!group) {
      group = {
        week,
        module: lesson.module,
        moduleTitle: lesson.moduleTitle,
        lessons: [],
      };
      byModule.set(lesson.module, group);
    }
    group.lessons.push(lesson);
  }
  return [...byModule.values()].sort((a, b) => a.module - b.module);
}

export const weeksPresent = (): number[] =>
  [...new Set(allLessons().map((l) => l.week))].sort((a, b) => a - b);

/** The curated crash-course path, in the order authors assigned. */
export const crashCoursePath = (): Lesson[] =>
  allLessons()
    .filter((l) => typeof l.crashCourse === 'number')
    .sort((a, b) => (a.crashCourse ?? 0) - (b.crashCourse ?? 0));

/** Reading order across the whole deep dive — drives prev/next. */
export function neighbours(id: string): { prev?: Lesson; next?: Lesson } {
  const all = allLessons();
  const i = all.findIndex((l) => l.id === id);
  if (i === -1) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}

export const allWiki = (): WikiEntry[] =>
  [...wiki].sort((a, b) => a.term.localeCompare(b.term, 'en'));

export function wikiByLetter(): { letter: string; entries: WikiEntry[] }[] {
  const map = new Map<string, WikiEntry[]>();
  for (const entry of allWiki()) {
    const letter = /[A-Z]/.test(entry.letter) ? entry.letter : '#';
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push(entry);
  }
  return [...map.entries()]
    .map(([letter, entries]) => ({ letter, entries }))
    .sort((a, b) => a.letter.localeCompare(b.letter, 'en'));
}

export const wikiBySlug = (slug: string): WikiEntry | undefined =>
  allWiki().find((w) => w.slug === slug);

/** Term lookup including aliases — used to auto-link jargon in lessons. */
export function wikiLookup(term: string): WikiEntry | undefined {
  const needle = term.trim().toLowerCase();
  return allWiki().find(
    (w) =>
      w.term.toLowerCase() === needle ||
      w.aliases.some((a) => a.toLowerCase() === needle),
  );
}

export const allGotchas = (): Gotcha[] =>
  [...gotchas].sort(
    (a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id),
  );

export function gotchasByCategory(): { category: string; items: Gotcha[] }[] {
  const map = new Map<string, Gotcha[]>();
  for (const g of allGotchas()) {
    if (!map.has(g.category)) map.set(g.category, []);
    map.get(g.category)!.push(g);
  }
  return [...map.entries()].map(([category, items]) => ({ category, items }));
}

export const allTools = (): ToolPage[] =>
  [...tools].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export const toolBySlug = (slug: string) => allTools().find((t) => t.slug === slug);

export const allRecipes = (): Recipe[] =>
  [...recipes].sort((a, b) => a.id.localeCompare(b.id));

export const recipeBySlug = (slug: string) =>
  allRecipes().find((r) => r.slug === slug);

export const allLabs = (): Lab[] => [...labs].sort((a, b) => a.id.localeCompare(b.id));
export const labById = (id: string) => allLabs().find((l) => l.id === id);

/** Headline numbers for the landing page. Generated, never hand-maintained. */
export function courseStats() {
  const ls = allLessons();
  const dates = [
    ...ls.map((l) => l.verifiedOn),
    ...allTools().map((t) => t.verifiedOn),
  ].sort();
  return {
    lessons: ls.length,
    weeks: weeksPresent().length,
    modules: new Set(ls.map((l) => `${l.week}.${l.module}`)).size,
    wikiTerms: allWiki().length,
    gotchas: allGotchas().length,
    recipes: allRecipes().length,
    labs: allLabs().length,
    sources: new Set(ls.flatMap((l) => l.sources.map((s) => s.url))).size,
    readingMinutes: ls.reduce((sum, l) => sum + l.estMinutes, 0),
    lastVerified: dates.at(-1) ?? null,
  };
}
