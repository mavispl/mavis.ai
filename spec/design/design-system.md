# Design System — Mavis Course

**Status:** proposed, awaiting acceptance · **Version** 0.1 · **Date** 2026-09-04
**Implementation:** `app/styles/tokens.css` (tokens) · `app/styles/globals.css` (base + prose) · `/design` (live reference)
**Rationale:** [ADR-005](../decisions/ADR-005-design-language.md)

## 1. Position

Between editorial design and Material Design 3 — and specific about which half gives what.

| | Taken from MD3 | Taken from editorial design |
|---|---|---|
| Colour | Tonal ramps, container/on-container pairs, state layers | Paper-toned surfaces, low-chroma warm neutrals |
| Type | A fixed scale with named roles | Serif display voice, 68ch measure, `text-wrap: pretty` |
| Space | 4pt grid | Asymmetric grid, generous vertical rhythm |
| Depth | A defined elevation ladder | Warm-tinted shadow, used sparingly |
| Motion | Standard/emphasized easing curves | Short durations; nothing announces itself |

**Rejected from MD3:** ripple, FAB, filled tonal buttons, Roboto, Material icons, high-chroma defaults.

The reason this matters for a *generated* site: MD3's systematics are what let 110 machine-authored pages look like one publication without a human reviewing each. The editorial half is what makes 2000 words of them readable.

## 2. Colour

Defined in **OKLCH**. Ramps are perceptually even, so contrast is predictable from lightness alone and the a11y audit can reason about pairs arithmetically.

**Primary — ink indigo (hue 275).** The voice: considered, not corporate.
**Accent — clay (hue 60).** Warmth and emphasis; the human hand on the page.
**Neutral — warm grey (hue 70, chroma 0.004–0.010).** Never chroma 0: paper, not screen.
**Status — ok / warn / err / info.** Status only. Never decoration.

Tone stops follow MD3: `0 6 10 17 20 24 30 40 45 50 55 60 70 80 87 90 92 94 96 98 100`.

Stops 45 and 55 exist because the contrast audit demanded them: `--text-faint` at N50 measured 4.21:1 on paper (floor 4.5) and `--border-strong` at N70 measured 2.09:1 (floor 3.0). Rather than accept the failure or abandon the ramp, the ramp gained two stops. This is the intended relationship between the palette and the audit — the audit is not advisory.

### Semantic assignment

| Token | Light | Dark |
|---|---|---|
| `--bg` | N96 (paper) | N6 |
| `--surface` | N98 | N10 |
| `--surface-raised` | N100 | N17 |
| `--text` | N17 | N92 |
| `--text-muted` | N40 | N70 |
| `--text-faint` | N45 | N60 |
| `--border` | N87 | N24 |
| `--border-strong` | N55 | N45 |
| `--primary` | P40 | P80 |
| `--primary-container` | P90 | P30 |
| `--accent` | A40 | A80 |

Dark mode is a **token swap, not a filter**: primary lightens to P80 and the container darkens to P30, preserving the container/on-container contrast relationship in both themes.

**Rule:** no component may contain a colour literal. Every colour resolves through a token. `audit:a11y` greps `components/` and `app/` for hex, `rgb(` and `hsl(` and reports every hit outside `tokens.css`.

**Verification:** `scripts/lib/color.ts` converts OKLCH to linear sRGB and computes WCAG relative luminance, so `audit:a11y` checks all 22 promised token pairs in both themes arithmetically on every run — no screenshots, no sampling.

## 3. Type

| Role | Size | Line height | Family |
|---|---|---|---|
| display-lg | 3.25rem | 1.06 | Fraunces |
| display-md | 2.5rem | 1.10 | Fraunces |
| display-sm | 2rem | 1.15 | Fraunces |
| headline | 1.625rem | 1.22 | Fraunces |
| title-lg | 1.3125rem | 1.30 | Fraunces |
| title | 1.0625rem | 1.40 | Inter |
| body-lg | 1.0625rem | 1.70 | Inter — **lesson prose** |
| body | 0.9375rem | 1.60 | Inter — UI |
| small | 0.8125rem | 1.50 | Inter |
| label | 0.75rem | 1.35 | Inter, uppercase, 0.06em |

Display tracking −0.02em. Prose gets `text-wrap: pretty`; headings get `text-wrap: balance`.

## 4. Shape, space, elevation, motion

**Shape** — 0 / 4 / 8 / 12 / 16 / 28 / full px. Cards `md`, dialogs `lg`, pills `full`, code blocks `md`.
**Space** — 4pt grid, steps 1–9 (0.25rem → 6rem).
**Elevation** — 5 rungs. Rung 1 cards at rest, 2 hover, 3 popovers, 4 dialogs. Warm-tinted, two-layer, never pure black.
**State layers** — 8% hover, 10% focus, 12% pressed, applied as `color-mix` over the base surface.
**Motion** — 90 / 160 / 240 / 400ms with standard and emphasized curves; all durations collapse to 0 under `prefers-reduced-motion`.

## 5. Layout

The lesson grid is deliberately asymmetric:

```
+----------+--------------------------+-------------+
| sidebar  |  prose column (68ch)     | margin rail |
| 16.5rem  |  the argument            | 17rem       |
| nav tree |                          | asides,     |
|          |                          | sources,    |
|          |                          | progress,   |
|          |                          | TOC         |
+----------+--------------------------+-------------+
```

Below 1280px the rail collapses into the flow (asides become inline callouts, sources move to the page end). Below 900px the sidebar becomes a drawer. The prose column never exceeds 68ch at any breakpoint.

## 6. Component inventory

| # | Component | Purpose | Notes |
|---|---|---|---|
| 1 | `LessonCard` | Entry point to a lesson | Title, TL;DR, minutes, freshness dot, progress state |
| 2 | `PersonaSwitch` | The audience lens | Lens not gate; persists to localStorage; never removes DOM |
| 3 | `ProgressRail` | Where you are, what's left | Per-lesson done state, module completion |
| 4 | `Callout` | Note / warning / key idea | 5 tones, all token-driven, icon + label |
| 5 | `Lab` | A hands-on exercise | Goal, steps, copy buttons, "success looks like" |
| 6 | `SelfCheck` | Check for understanding | Question, revealed answer, optional hint |
| 7 | `SourceList` | Provenance | Numbered, with publisher and access date |
| 8 | `FreshnessBadge` | How much to trust this today | Verified date + volatility -> fresh / ageing / stale |
| 9 | `Diagram` | Mechanism made visible | Build-time SVG, theme-aware, always captioned |
| 10 | `CodeBlock` | Code and config | Shiki, dual-theme, copy button, optional filename |
| 11 | `WikiEntry` | One concept, canonically | Term, TL;DR, analogy, definition, links to lessons |
| 12 | `GotchaCard` | A way this goes wrong | What / why / detect / fix, severity-coded |
| 13 | `PathStepper` | A sequenced route | Crash course and module paths |
| 14 | `SearchDialog` | Find anything | Pagefind, Cmd-K, grouped by section |

Persona blocks (`Plainly`, `ForEngineers`, `ForLeads`, `Aside`) are MDX primitives rather than inventory components; they are documented in the `lesson-author` skill.

## 7. Accessibility floor

Non-negotiable, enforced by `audit:a11y`:

- Body text >= 4.5:1 against its surface; large text and UI borders >= 3:1.
- One focus treatment site-wide: 2px primary outline, 2px offset. Never removed.
- The persona switch and progress state are keyboard-operable and announced.
- Colour is never the only carrier of meaning — severity, freshness and status all pair colour with text or shape.
- Every diagram has a text description; every code block is selectable text, never an image.
- Reduced motion is honoured globally through the duration tokens.

## 8. Acceptance

This document plus the live `/design` page constitute the deliverable. **No lesson content is generated against an unaccepted design system** — Stage 4 is gated on sign-off, because a token change after 110 pages exist is a 110-page re-review.
