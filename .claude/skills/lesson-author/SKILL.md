---
name: lesson-author
description: Author one course lesson as MDX against the curriculum map and the content schema. Use when writing or revising any file under content/lessons/, when Stage 4 of the pipeline runs, or when a fact/pedagogy audit finding requires a lesson to be rewritten.
---

# Authoring a lesson

You are writing one page of a course read by juniors through CTOs. The page is
generated, but nobody reading it should be able to tell — it must be as specific,
as honest about uncertainty, and as well-sourced as something a staff engineer
wrote after doing the work.

Read `spec/curriculum/map.json` for this lesson's node before writing anything.
The node gives you the id, the title, the agenda sub-topics you must cover, the
volatility, the target personas, and the length budget.

## The shape

Frontmatter first, validated by `velite.config.ts`. The build fails on a violation,
so get these right rather than discovering them later:

```yaml
---
id: w1.m01.b02              # exactly as in the map
title: ...                  # ≤ 90 chars, the map's title unless it is wrong
week: 1
weekTitle: Core
module: 1
moduleTitle: Mechanics Behind Generative AI
bullet: 2
summary: >                  # 20–240 chars. ONE sentence. The TL;DR.
  ...
personas: [junior, mid, senior, lead, cto]
prerequisites: [w1.m01.b01]
related: [w1.m02.b02]
tags: [tokenization, context]
defines: [Token, Byte-pair encoding]     # every one needs a wiki entry
sources:
  - url: https://...
    title: ...
    publisher: ...
    accessedOn: 2026-09-04  # the day you actually opened it
verifiedOn: 2026-09-04
volatility: low|medium|high # from the map
estMinutes: 16
crashCourse: 2              # only if the map says so
checks:
  - q: ...
    a: ...
    hint: ...
---
```

Then the body, in this order:

1. **The opening claim.** Two or three sentences that state what this page
   establishes. No throat-clearing, no "in today's fast-moving world".
2. **`<Plainly>`** — the idea with no jargon. A junior who reads only this block
   should come away with something true, not something simplified into falsehood.
3. **The main argument** — ordinary prose and `##` headings. This is most of the
   page. Write it at the level of a competent engineer who has not met this
   specific thing.
4. **`<ForEngineers>`** — mechanism, precision, the part an expert came for.
   Numbers, edge cases, what actually happens at the boundary.
5. **`<ForLeads>`** — cost, risk, team consequences. Not a summary of the above
   in business language: genuinely different information.
6. **A diagram**, where a mechanism is spatial or sequential. `<Diagram>` with a
   real `alt` describing the mechanism, not the picture.
7. **`<Lab>`** — one hands-on exercise with a falsifiable `successLooksLike`.
8. **`<Callout tone="danger">`** for anything that belongs in the gotchas
   catalogue, and file the matching entry in `content/gotchas/`.
9. **`<SelfCheck>`** — at least one, drawn from the `checks` frontmatter.

## The rules that matter

**Cite anything that can rot.** Model names, pricing, context limits, tool
behaviour, API shapes, product features. Every one gets a source with the date you
opened it. Conceptual material — how attention works, what a trust boundary is —
needs no citation and should not pretend to have one. Volatility `medium` or
`high` with an empty `sources` array fails the build.

**Say when you do not know.** "As of September 2026, providers publish this
differently and there is no common unit" is a better sentence than a confident
number you cannot source. The freshness badge already tells readers this page has
a shelf life; do not spend that credibility.

**Vendor-neutral concepts, plural recipes.** Teach the mechanism without a brand
attached. When you show how to do something concretely, use `<HarnessTabs>` with
at least two harnesses. A page that teaches one tool's vocabulary as if it were
the domain's vocabulary has failed the course's central promise.

**MDX has no module scope.** Only the components in `components/mdx/MdxContent.tsx` are
injected — a lesson cannot reference an imported helper value. Write SVG with explicit
attributes (`stroke="var(--border-strong)" strokeWidth="1.25"`), never a spread of some
shared style object. A `{...someObject}` in a lesson body is a runtime error that the
schema will not catch.

**Wrap jargon on first use.** `<Term slug="context-window">context window</Term>`.
Every term in `defines` needs a `content/wiki/` entry in the same change. The
graph audit fails on a dangling term, and a junior who hits an unexplained word
stops reading.

**The persona blocks are a lens, not a filing system.** Do not move essential
content into `<ForEngineers>` so the main text reads easier — a folded block is
skipped by most readers. If it is load-bearing, it goes in the main argument.

**Write for someone who will act on this.** Prefer the concrete: what breaks, what
it costs, what to type, what to look at. Cut every sentence that only restates the
heading.

## Length and tone

1200–2000 words, `estMinutes` from the map. Plain, direct, unhedged where you are
confident and explicitly hedged where you are not. No hype, no "unlock", no
"revolutionise", no rhetorical questions as headings, no bulleted lists where a
sentence would do.

## Before you finish

- Every agenda sub-topic in the node's `covers` appears in the text. The schema
  audit checks this by substring, and it is a real check, not a formality.
- `pnpm content` compiles it.
- `pnpm tsx scripts/audit-schema.ts` and `audit-graph.ts` are clean for this id.
- Every source URL was actually opened during this session.
