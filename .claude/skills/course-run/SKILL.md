---
name: course-run
description: Orchestrate a pipeline run for one module or week of the course — research, author, audit, build. Use when generating new course content, re-verifying existing content, or when asked to run Stage 3 through 6 for a module.
---

# Running the pipeline

One invocation covers one module (5–6 lessons). Larger units are not more
efficient — they are just harder to audit and harder to abandon when something
goes wrong.

## Preconditions

Refuse to start and say why if any of these is false:

- `spec/curriculum/map.json` exists and contains the requested module.
- The design system is accepted. Check `spec/design/design-system.md` — if its
  status line still says "awaiting acceptance", stop. Authoring against an
  unaccepted design means re-reviewing every page when a token moves.
- `pnpm content` currently succeeds.

## Stage 3 — Research

For each lesson node in the module, spawn the `researcher` subagent with the
node's title, `covers` list, and volatility. It returns candidate sources.

Write `research/<week>-<module>/sources.json`:

```json
{
  "module": "w1.m01",
  "gatheredAt": "2026-09-04T00:00:00Z",
  "lessons": {
    "w1.m01.b02": [
      { "url": "...", "title": "...", "publisher": "...",
        "accessedOn": "2026-09-04", "claim": "what this source supports",
        "confidence": "primary|secondary|contested" }
    ]
  }
}
```

Low-volatility conceptual lessons legitimately return few or no sources. Do not
manufacture citations to fill the file — a fabricated source is worse than none,
because it survives review by looking like diligence.

Log one record per lesson to `log/research.jsonl`.

## Stage 4 — Author

For each lesson, follow `.claude/skills/lesson-author/SKILL.md` exactly, using
that lesson's entry from `sources.json`. Author in map order so prerequisites
exist before the pages that cite them.

Alongside each lesson, produce what it implies:
- wiki entries for every term in `defines`
- gotcha entries for every `<Callout tone="danger">`
- lab files for every id in `labs`
- recipe files where the module is applied rather than conceptual

Run `pnpm content` after each lesson, not at the end of the module. A schema
error found immediately costs one page of rework; found at the end it costs six.

Log one record per artefact to `log/author.jsonl`.

## Stage 5 — Audit

Run all five passes and write one combined report:

```bash
pnpm tsx scripts/audit-schema.ts
pnpm tsx scripts/audit-graph.ts
pnpm tsx scripts/audit-a11y.ts
```

Then spawn `fact-auditor` and `pedagogy-auditor` over the module's lessons.
Merge every finding into `audit/<run-id>/findings.json` and `report.md` using
`scripts/lib/findings.ts` — one shape for all five passes, so severity sorts
across them.

**Every `high` finding must be fixed or waived.** A waiver goes in
`audit/<run-id>/waivers.md` with the finding code, the subject, and a reason a
reader would accept. "Fixed later" is not a reason.

## Stage 6 — Build

```bash
pnpm build          # velite + next build + pagefind
pnpm tsx scripts/audit-a11y.ts   # now includes the axe pass over out/
```

Then check the real pages in a browser: one lesson at 375px and 1440px, in light
and dark, with the persona switch exercised. The audits cannot see a layout that
is technically accessible and visually broken.

Log the build record to `log/build.jsonl`.

## Finishing

- Append the module to `spec/curriculum/BACKLOG.md` as done, with its run id.
- Write an ADR if anything non-obvious was decided — a source that turned out to
  be wrong, an agenda item folded into a neighbour, a schema field that had to
  change.
- Report: lessons authored, findings by severity, what was waived and why.

## What not to do

Do not batch all four weeks. Do not skip the audit because the content "looks
fine" — the passes exist because reading your own generated output is exactly the
situation where looking fine is uninformative. Do not update `verifiedOn` on a
page you did not actually re-verify; that date is the site's core promise.
