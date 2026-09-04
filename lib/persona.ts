/**
 * The persona lens (ADR-002).
 *
 * A persona is a *lens*, not a gate. It changes emphasis and order; it never
 * removes content from the DOM. That is deliberate and load-bearing:
 *   - Ctrl-F and Pagefind must still find de-emphasised text
 *   - a junior must be able to reach the expert explanation when curious
 *   - the pedagogy audit checks pages against every persona at once
 *
 * De-emphasis is expressed as `collapsed by default` on a <details>, never as
 * `display: none` and never by omitting the node.
 */

export const PERSONAS = ['junior', 'mid', 'senior', 'lead', 'cto'] as const;
export type Persona = (typeof PERSONAS)[number];
export const DEFAULT_PERSONA: Persona = 'mid';

export type BlockKind = 'plainly' | 'forEngineers' | 'forLeads' | 'aside';

/** 'open' = expanded by default. 'folded' = present, collapsed, one click away. */
export type BlockState = 'open' | 'folded';

/**
 * How each persona meets each block kind.
 *
 * A junior gets plain language open and the mechanism folded — not hidden, folded.
 * A senior gets the inverse. A lead gets the consequences open and the mechanism
 * within reach. Nobody is ever denied anything.
 */
const MATRIX: Record<Persona, Record<BlockKind, BlockState>> = {
  junior: { plainly: 'open',   forEngineers: 'folded', forLeads: 'folded', aside: 'folded' },
  mid:    { plainly: 'open',   forEngineers: 'open',   forLeads: 'folded', aside: 'folded' },
  senior: { plainly: 'folded', forEngineers: 'open',   forLeads: 'folded', aside: 'open'   },
  lead:   { plainly: 'open',   forEngineers: 'folded', forLeads: 'open',   aside: 'folded' },
  cto:    { plainly: 'open',   forEngineers: 'folded', forLeads: 'open',   aside: 'folded' },
};

export function blockState(persona: Persona, kind: BlockKind): BlockState {
  return MATRIX[persona][kind];
}

export function isPersona(value: unknown): value is Persona {
  return typeof value === 'string' && (PERSONAS as readonly string[]).includes(value);
}

export const PERSONA_STORAGE_KEY = 'mavis.persona';

/**
 * Emitted on <html> as data-persona so CSS can do the open/folded work without a
 * React re-render per block. The switch stays instant on long pages.
 */
export const PERSONA_ATTR = 'data-persona';
