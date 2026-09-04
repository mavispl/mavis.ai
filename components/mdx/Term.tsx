import Link from 'next/link';

/**
 * Marks a piece of jargon and links it to its canonical wiki definition.
 *
 * This is the mechanism behind "juniors are never stranded": the pedagogy audit
 * flags any lesson that uses a wiki term without wrapping its first occurrence,
 * so unexplained jargon is a build finding rather than a reader's problem.
 */
export function Term({ children, slug }: { children: React.ReactNode; slug: string }) {
  return (
    <Link
      href={`/wiki/${slug}`}
      className="term-link"
      data-term={slug}
      title="Definition in the wiki"
    >
      {children}
    </Link>
  );
}
