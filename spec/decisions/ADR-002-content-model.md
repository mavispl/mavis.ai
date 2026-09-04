# ADR-002: One page per agenda bullet, layered by persona in-body

- **Status:** accepted
- **Date:** 2026-09-04
- **Stage:** 2 — Curriculum map

## Context
The course must serve juniors through CTOs from the same material. Three shapes were
possible: parallel pages per persona, a single flat page, or one page with layered
blocks.

Parallel pages multiply the generation and audit surface by five and guarantee drift
between versions of the same idea. A single flat page either patronises seniors or
loses juniors.

## Decision
**One MDX page per agenda bullet** (~110 pages at full scale, ~1200–2000 words each),
with persona layering expressed as components inside the body:

- `<Plainly>` — the idea with no jargon, for anyone
- `<ForEngineers>` — mechanism and precision, the part an IT expert came for
- `<ForLeads>` — cost, risk, team and org consequences
- `<Aside>` — optional tangent, never load-bearing

The global persona switch is a **lens, not a gate**: it reorders and de-emphasises,
and every page must still read coherently with all blocks visible. This is why
"expand all" is always reachable and why the switch never removes content from the
DOM — it must stay findable by search and by Ctrl-F.

## Consequences
- One canonical text per idea; no cross-persona drift.
- The pedagogy audit can assert coverage mechanically: a page tagged for `junior`
  that has no `<Plainly>` block is a finding.
- Authors must write for several audiences in one pass, which is harder than writing
  one flat page. The `lesson-author` skill carries that burden explicitly.
- Pages are longer than a single-persona page would be; the persona switch and the
  margin rail exist to manage that weight.
