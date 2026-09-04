import type { ReactNode } from 'react';

/**
 * A figure wrapper for hand-authored inline SVG.
 *
 * Diagrams are inline SVG rather than images so they inherit the theme through
 * currentColor and CSS variables, stay crisp at any zoom, and remain selectable
 * text for anyone using find-in-page.
 *
 * `alt` is required and is not decorative filler: it must describe the mechanism
 * the diagram shows, because it is the only version a screen-reader user gets.
 */
export function Diagram({
  caption,
  alt,
  children,
  wide = false,
}: {
  caption: string;
  alt: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <figure
      className={`my-6 ${wide ? 'lg:-mx-8' : ''}`}
      role="group"
      aria-label={alt}
    >
      <div className="overflow-x-auto rounded-md border border-border bg-surface p-4">
        <div className="min-w-[34rem]">{children}</div>
      </div>
      <figcaption className="mt-2 text-small text-text-muted">{caption}</figcaption>
      <p className="sr-only">{alt}</p>
    </figure>
  );
}
