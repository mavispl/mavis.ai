/**
 * Every user-facing string goes through `t()`. Nothing is inlined in JSX.
 * This is what makes ADR-004 (Polish later, without restructuring) cheap:
 * adding a locale means adding a table, not touching components.
 */

export const LOCALES = ['en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

const en = {
  'site.title': 'AI Engineering Course',
  'site.tagline': 'Generative AI and agentic systems, for engineers who ship',

  'nav.home': 'Home',
  'nav.crashCourse': 'Crash course',
  'nav.deepDive': 'Deep dive',
  'nav.agents': 'Agents in project',
  'nav.wiki': 'Wiki',
  'nav.tools': 'Tools & setup',
  'nav.design': 'Design system',
  'nav.search': 'Search',
  'nav.menu': 'Menu',
  'nav.skipToContent': 'Skip to content',

  'persona.label': 'Reading as',
  'persona.description': 'Changes emphasis, never hides content. Everything stays searchable.',
  'persona.junior': 'Junior',
  'persona.mid': 'Mid',
  'persona.senior': 'Senior',
  'persona.lead': 'Lead',
  'persona.cto': 'CTO',
  'persona.junior.hint': 'Plain language first, jargon explained on sight',
  'persona.mid.hint': 'Balanced: the idea, then the mechanism',
  'persona.senior.hint': 'Mechanism first, precision over hand-holding',
  'persona.lead.hint': 'Team, cost, and risk consequences surfaced',
  'persona.cto.hint': 'Strategy, spend, and organisational leverage surfaced',

  'block.plainly': 'In plain terms',
  'block.forEngineers': 'For engineers',
  'block.forLeads': 'For leads and CTOs',
  'block.aside': 'Aside',
  'block.expandAll': 'Expand all sections',
  'block.collapseAll': 'Collapse all',

  'lesson.tldr': 'TL;DR',
  'lesson.minutes': '{n} min read',
  'lesson.prerequisites': 'Before this',
  'lesson.related': 'Related',
  'lesson.sources': 'Sources',
  'lesson.defines': 'Concepts introduced',
  'lesson.markDone': 'Mark as done',
  'lesson.markedDone': 'Done',
  'lesson.next': 'Next',
  'lesson.previous': 'Previous',
  'lesson.onThisPage': 'On this page',

  'check.title': 'Check yourself',
  'check.reveal': 'Show answer',
  'check.hide': 'Hide answer',
  'check.hint': 'Hint',

  'lab.title': 'Lab',
  'lab.goal': 'Goal',
  'lab.success': 'Success looks like',
  'lab.time': '{n} min',
  'lab.copy': 'Copy',
  'lab.copied': 'Copied',

  'freshness.fresh': 'Verified {date}',
  'freshness.ageing': 'Verified {date} — recheck due',
  'freshness.stale': 'Verified {date} — may be out of date',
  'freshness.explain': 'How current this page is. Fast-moving topics are rechecked more often.',

  'progress.complete': '{done} of {total} complete',
  'progress.reset': 'Reset progress',
  'progress.yourProgress': 'Your progress',
  'progress.storedLocally': 'Stored in this browser only.',

  'gotcha.whatGoesWrong': 'What goes wrong',
  'gotcha.whyItHappens': 'Why it happens',
  'gotcha.howToDetect': 'How to detect',
  'gotcha.fix': 'Fix / mitigation',

  'wiki.seeAlso': 'See also',
  'wiki.taughtIn': 'Taught in',
  'wiki.analogy': 'Think of it as',
  'wiki.jumpTo': 'Jump to letter',

  'recipe.problem': 'The problem',
  'recipe.harnesses': 'Shown for',
  'recipe.difficulty': 'Difficulty',

  'theme.toggle': 'Toggle theme',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',

  'search.placeholder': 'Search lessons, wiki, recipes…',
  'search.empty': 'No results',
  'search.hint': 'Press / to search',

  'common.week': 'Week',
  'common.module': 'Module',
  'common.lessons': 'lessons',
  'common.readMore': 'Read',
  'common.backTo': 'Back to {target}',
} as const;

export type StringKey = keyof typeof en;

const tables: Record<Locale, Record<string, string>> = { en };

/** t('lesson.minutes', { n: 8 }) -> "8 min read" */
export function t(
  key: StringKey,
  vars?: Record<string, string | number>,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const raw = tables[locale][key] ?? tables[DEFAULT_LOCALE][key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, name) =>
    name in vars ? String(vars[name]) : m,
  );
}
