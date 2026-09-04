# ADR-001: Next.js App Router + Velite as the course platform

- **Status:** accepted
- **Date:** 2026-09-04
- **Stage:** 1 — Foundation

## Context
The course needs six sections, ~110 generated lesson pages, a wiki, persona-layered
content, client-side interactivity (progress, persona switch, self-checks), and a
bespoke design system that sits between editorial design and Material Design 3.

The reference site (calm-condition.surge.sh) is Docusaurus. It carries the content
model well but its Infima theme resists a bespoke design system without extensive
swizzling, and its component model makes the persona lens awkward.

The controlling requirement is not authoring convenience — it is that **generated
content must be machine-verifiable**. Whatever holds the content must let an audit
script assert that every volatile claim has a source and a freshness date.

## Options considered
| Option | Pros | Cons |
|---|---|---|
| Docusaurus | Continuity with reference; i18n, search, versioning free | Swizzling out of Infima costs more than building UI; frontmatter is untyped |
| Astro + Starlight | Light, fast, easy theming | Starlight's own design opinions; React islands are second-class |
| **Next.js 15 App Router + Velite** | Total control of layout and interaction; Zod-validated frontmatter; static export | Sidebar, search and TOC must be built, not inherited |
| Fumadocs UI | Docs UI for Next.js, batteries included | Its design opinions fight the required design system |
| Contentlayer | The obvious Next.js content layer | Unmaintained |

## Decision
Next.js 15 (App Router, `output: 'export'`) with **Velite** as the content layer,
Tailwind v4 over a CSS-custom-property token layer, Radix primitives for accessible
interaction, Shiki at build time, and Pagefind for search over the static output.

## Consequences
- `velite.config.ts` becomes the contract for all generated content. A lesson that
  is `volatility: medium` with no `sources` **fails the build**. The fact policy is
  enforced by the compiler rather than by reviewer diligence.
- Navigation, search UI, TOC and sidebar are ours to build (~1 day of work) and ours
  to design.
- Static export means no server-side personalization: the persona switch and progress
  tracking are client-side and stored locally. Acceptable — neither needs a server.
- Revisit if the course ever needs authenticated per-user state or server-rendered
  personalization.
