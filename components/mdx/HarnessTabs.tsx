'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { Children, isValidElement, useMemo } from 'react';

/**
 * Side-by-side instructions for two or more harnesses.
 *
 * Vendor neutrality (the course policy) is only real if it is structural. A
 * recipe that shows one tool and mentions others in prose drifts to that tool.
 * These tabs force the author to actually write the alternatives, and the schema
 * requires at least two.
 */
export function HarnessTabs({ children }: { children: React.ReactNode }) {
  const items = useMemo(
    () =>
      Children.toArray(children).filter(
        (c): c is React.ReactElement<HarnessProps> =>
          isValidElement(c) && typeof (c.props as HarnessProps)?.name === 'string',
      ),
    [children],
  );

  if (items.length === 0) return null;

  // Radix derives element ids from the tab value, so a value containing a space
  // ("Claude Code") produces an invalid IDREF in aria-controls. Slugify the value
  // and keep the readable name for the label.
  const valueOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const first = valueOf(items[0].props.name);

  return (
    <Tabs.Root defaultValue={first} className="my-5 rounded-md border border-border bg-surface">
      <Tabs.List
        className="flex flex-wrap gap-1 border-b border-border p-1"
        aria-label="Choose your harness"
      >
        {items.map((item) => (
          <Tabs.Trigger
            key={item.props.name}
            value={valueOf(item.props.name)}
            className="state-layer rounded-sm px-3 py-1.5 text-small font-medium text-text-muted data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container"
          >
            {item.props.name}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {items.map((item) => (
        <Tabs.Content
          key={item.props.name}
          value={valueOf(item.props.name)}
          className="px-4 py-3 focus-visible:outline-none"
        >
          {item.props.children}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

interface HarnessProps {
  name: string;
  children: React.ReactNode;
}

/** A marker component; HarnessTabs reads its props and renders the body itself. */
export function Harness(_: HarnessProps) {
  return null;
}
