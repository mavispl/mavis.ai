'use client';

import * as runtime from 'react/jsx-runtime';
import { useMemo } from 'react';
import Link from 'next/link';
import { Plainly, ForEngineers, ForLeads, Aside, PersonaBlock } from './PersonaBlock';
import { Callout } from './Callout';
import { SelfCheck } from './SelfCheck';
import { Lab } from './Lab';
import { Diagram } from './Diagram';
import { CopyButton } from './CopyButton';
import { Term } from './Term';
import { ArrowDefs } from './Figure';
import { HarnessTabs, Harness } from './HarnessTabs';

/**
 * Velite compiles each MDX body to a function body string. We evaluate it in the
 * browser (and during prerender) against React's jsx-runtime.
 *
 * This is a client component on purpose: every interactive primitive a lesson can
 * use — persona blocks, self-checks, harness tabs — needs client state, and one
 * boundary at the MDX root is simpler to reason about than a boundary per element.
 */
function useMdx(code: string) {
  return useMemo(() => {
    const fn = new Function(code);
    return fn({ ...runtime }).default as React.ComponentType<{ components?: object }>;
  }, [code]);
}

/** Internal links go through next/link; external ones get the usual safety rel. */
function Anchor({ href = '', ...rest }: React.ComponentProps<'a'>) {
  const isInternal = href.startsWith('/') || href.startsWith('#');
  if (isInternal) return <Link href={href} {...rest} />;
  return <a href={href} target="_blank" rel="noopener noreferrer" {...rest} />;
}

const components = {
  a: Anchor,
  Plainly, ForEngineers, ForLeads, Aside, PersonaBlock,
  Callout, SelfCheck, Lab, Diagram, CopyButton, Term,
  HarnessTabs, Harness, ArrowDefs,
};

export function MdxContent({ code, className = '' }: { code: string; className?: string }) {
  const Component = useMdx(code);
  return (
    <div className={`prose-course ${className}`}>
      <Component components={components} />
    </div>
  );
}
