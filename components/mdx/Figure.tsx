/**
 * Small shared SVG helpers so hand-authored diagrams stay consistent without
 * each one re-deriving its own type sizes and colours.
 */
export const svgText = {
  title: { fontSize: 13, fontWeight: 600, fill: 'var(--text)' },
  label: { fontSize: 11.5, fill: 'var(--text)' },
  muted: { fontSize: 11, fill: 'var(--text-muted)' },
  mono: { fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--text)' },
} as const;

export const svgStroke = {
  base: { stroke: 'var(--border-strong)', strokeWidth: 1.25, fill: 'none' },
  accent: { stroke: 'var(--primary)', strokeWidth: 1.5, fill: 'none' },
  faint: { stroke: 'var(--border)', strokeWidth: 1, fill: 'none' },
} as const;

export function ArrowDefs() {
  return (
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 1L9 5L0 9z" fill="var(--border-strong)" />
      </marker>
      <marker id="arrow-accent" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 1L9 5L0 9z" fill="var(--primary)" />
      </marker>
    </defs>
  );
}
