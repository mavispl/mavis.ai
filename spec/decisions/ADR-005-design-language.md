# ADR-005: A design language between editorial and Material Design 3

- **Status:** accepted
- **Date:** 2026-09-04
- **Stage:** 1 — Design

## Context
The brief: "something between human design and MD3." That is a real position, not a
compromise — MD3 brings systematic rigour that a 110-page generated site badly needs
(consistency without a human reviewing every page), while editorial design brings the
warmth and reading comfort a 2000-word lesson needs.

## Decision
Take MD3's **systems** and editorial design's **voice**.

Adopted from MD3: tonal ramps at fixed tone stops; container / on-container colour
pairs; state-layer opacities (8% hover, 10% focus, 12% pressed); a shape scale; a
defined elevation ladder; 4pt spacing.

Adopted from editorial design: a characterful serif for display against a humanist
sans for body; paper-toned surfaces (light mode sits on N96, not `#fff`; dark on N6,
not `#000`); a 68ch measure; an asymmetric grid with a margin rail for asides,
sources and progress; restrained motion.

Explicitly rejected from MD3: ripple, FAB, filled tonal buttons, Roboto, Material
iconography, and MD3's high-chroma default palette.

Colour is defined in OKLCH so tonal ramps are perceptually even and contrast is
predictable from the lightness value alone.

## Consequences
- Every colour is a token. A hard-coded hex in `components/` is an audit finding.
- Contrast is checkable arithmetically from the ramp, so the a11y audit can assert
  pairs rather than sample them.
- Two font families plus a mono face; the display serif is a real payload cost,
  mitigated by `next/font` subsetting and self-hosting.
