import type { Metadata } from 'next';
import { Callout } from '@/components/mdx/Callout';
import { SelfCheck } from '@/components/mdx/SelfCheck';
import { Lab } from '@/components/mdx/Lab';
import { Diagram } from '@/components/mdx/Diagram';
import { HarnessTabs, Harness } from '@/components/mdx/HarnessTabs';
import { Plainly, ForEngineers, ForLeads, Aside } from '@/components/mdx/PersonaBlock';
import { PersonaSwitch } from '@/components/course/PersonaSwitch';
import { FreshnessBadge } from '@/components/course/FreshnessBadge';
import { SourceList } from '@/components/course/SourceList';
import { LessonCard } from '@/components/course/LessonCard';
import { GotchaCard } from '@/components/course/GotchaCard';
import { PathStepper } from '@/components/course/PathStepper';
import { LessonProgress } from '@/components/course/LessonProgress';
import { ArrowDefs, svgStroke, svgText } from '@/components/mdx/Figure';

export const metadata: Metadata = {
  title: 'Design system',
  description: 'Living reference for the course design language: tokens, type, components.',
};

function Section({ n, title, note, children }: {
  n: string; title: string; note?: string; children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-10">
      <div className="mb-6">
        <p className="label-caps">{n}</p>
        <h2 className="mt-1 text-display-sm font-semibold">{title}</h2>
        {note && <p className="mt-2 max-w-2xl text-body-lg text-text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

const RAMPS = [
  { name: 'Primary — ink indigo', prefix: 'p', stops: [10, 20, 30, 40, 50, 60, 70, 80, 90, 95] },
  { name: 'Accent — clay', prefix: 'a', stops: [10, 20, 30, 40, 50, 60, 70, 80, 90, 95] },
  { name: 'Neutral — warm grey', prefix: 'n', stops: [6, 10, 17, 24, 30, 40, 50, 60, 70, 80, 87, 92, 96, 100] },
];

const SEMANTIC = [
  ['--bg', 'Page ground'], ['--surface', 'Card, panel'], ['--surface-raised', 'Lifted card'],
  ['--surface-sunken', 'Wells, code'], ['--text', 'Body copy'], ['--text-muted', 'Secondary'],
  ['--text-faint', 'Tertiary, labels'], ['--border', 'Default rule'], ['--border-strong', 'Emphasis rule'],
  ['--primary', 'Primary action'], ['--primary-container', 'Primary surface'],
  ['--accent', 'Accent'], ['--accent-container', 'Accent surface'],
  ['--ok', 'Success'], ['--warn', 'Caution'], ['--err', 'Error'], ['--info', 'Information'],
];

const TYPE = [
  ['display-lg', '3.25rem', 'Fraunces', 'Landing hero only'],
  ['display-md', '2.5rem', 'Fraunces', 'Section openers'],
  ['display-sm', '2rem', 'Fraunces', 'Page titles'],
  ['headline', '1.625rem', 'Fraunces', 'Lesson h2'],
  ['title-lg', '1.3125rem', 'Fraunces', 'Card titles, h3'],
  ['title', '1.0625rem', 'Inter', 'UI headings'],
  ['body-lg', '1.0625rem', 'Inter', 'Lesson prose'],
  ['body', '0.9375rem', 'Inter', 'UI text'],
  ['small', '0.8125rem', 'Inter', 'Meta, captions'],
  ['label', '0.75rem', 'Inter', 'Uppercase labels'],
];

const DEMO_SOURCES = [
  { url: 'https://example.org/spec', title: 'A specification everyone cites', publisher: 'Example Standards Body', accessedOn: '2026-09-01' },
  { url: 'https://example.com/pricing', title: 'Provider pricing page', publisher: 'Example Provider', accessedOn: '2026-09-03' },
];

const DEMO_LESSON = {
  id: 'demo.1', title: 'Tokenization, and why your bill is not measured in words',
  summary: 'Models read tokens, not characters or words. The mapping is lossy, language-dependent, and it is what you actually pay for.',
  permalink: '/design', estMinutes: 9, verifiedOn: '2026-09-01', volatility: 'medium' as const,
  moduleTitle: 'Mechanics Behind Generative AI',
};

export default function DesignPage() {
  return (
    <div className="mx-auto px-4 py-10 sm:px-6" style={{ maxWidth: 'var(--content-max)' }}>
      <header className="pb-6">
        <p className="label-caps">Specification · v0.1 · awaiting acceptance</p>
        <h1 className="mt-2 text-display-md font-semibold">Design system</h1>
        <p className="mt-3 max-w-2xl text-body-lg text-text-muted">
          Between editorial design and Material Design 3. MD3 contributes the systems —
          tonal ramps, container pairs, state layers, a shape scale, an elevation ladder.
          Editorial design contributes the voice — a serif display face, paper-toned
          surfaces, a 68ch measure, and motion that does not announce itself.
        </p>
        <p className="mt-3 max-w-2xl text-body text-text-faint">
          This page is the live half of the deliverable; the written half is{' '}
          <code>spec/design/design-system.md</code>. Toggle the theme in the header —
          every element below is built from tokens and must hold up in both.
        </p>
      </header>

      <Section n="01" title="Colour"
        note="Defined in OKLCH so the ramps are perceptually even and contrast is predictable from lightness alone. Neutrals carry a trace of warmth: paper, not screen.">
        <div className="space-y-6">
          {RAMPS.map((ramp) => (
            <div key={ramp.prefix}>
              <p className="label-caps mb-2">{ramp.name}</p>
              <div className="flex overflow-hidden rounded-sm border border-border">
                {ramp.stops.map((stop) => (
                  <div key={stop} className="flex-1" style={{ background: `var(--${ramp.prefix}-${stop})` }}>
                    <div className="flex h-14 items-end justify-center pb-1">
                      <span className="text-label tabular-nums"
                        style={{ color: stop > 55 ? 'var(--n-20)' : 'var(--n-96)' }}>
                        {stop}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <p className="label-caps mb-3">Semantic tokens — these are what components use</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SEMANTIC.map(([token, use]) => (
              <div key={token} className="flex items-center gap-3 rounded-sm border border-border bg-surface p-2">
                <span className="h-8 w-8 shrink-0 rounded-xs border border-border"
                  style={{ background: `var(${token})` }} />
                <span className="min-w-0">
                  <code className="block truncate text-small">{token}</code>
                  <span className="text-label text-text-faint">{use}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section n="02" title="Type"
        note="A characterful serif for display against a humanist sans for reading. Prose sets at body-lg on a 68ch measure — the one number that most affects whether 2000 words get read.">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-body">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 text-left font-semibold">Role</th>
                <th className="py-2 pr-4 text-left font-semibold">Size</th>
                <th className="py-2 pr-4 text-left font-semibold">Family</th>
                <th className="py-2 pr-4 text-left font-semibold">Used for</th>
                <th className="py-2 text-left font-semibold">Specimen</th>
              </tr>
            </thead>
            <tbody>
              {TYPE.map(([role, size, family, use]) => (
                <tr key={role} className="border-b border-border-faint">
                  <td className="py-3 pr-4"><code className="text-small">{role}</code></td>
                  <td className="py-3 pr-4 text-small text-text-muted">{size}</td>
                  <td className="py-3 pr-4 text-small text-text-muted">{family}</td>
                  <td className="py-3 pr-4 text-small text-text-muted">{use}</td>
                  <td className="py-3">
                    <span style={{
                      fontSize: `var(--text-${role})`,
                      lineHeight: `var(--lh-${role})`,
                      fontFamily: family === 'Fraunces' ? 'var(--font-display)' : 'var(--font-body)',
                      letterSpacing: role.startsWith('display') ? 'var(--tracking-display)' : undefined,
                      textTransform: role === 'label' ? 'uppercase' : undefined,
                      fontWeight: role === 'label' ? 600 : undefined,
                    }}>
                      Attention is a lookup
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="03" title="Shape, elevation, motion"
        note="Five elevation rungs, warm-tinted and two-layered. Nothing floats without a reason.">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="label-caps mb-3">Shape scale</p>
            <div className="flex flex-wrap items-end gap-3">
              {['xs', 'sm', 'md', 'lg', 'xl', 'full'].map((r) => (
                <div key={r} className="text-center">
                  <div className="h-16 w-16 border border-border-strong bg-primary-container"
                    style={{ borderRadius: `var(--radius-${r})` }} />
                  <code className="mt-1 block text-label">{r}</code>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="label-caps mb-3">Elevation ladder</p>
            <div className="flex flex-wrap items-end gap-4">
              {[1, 2, 3, 4].map((e) => (
                <div key={e} className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-surface-raised"
                    style={{ boxShadow: `var(--elev-${e})` }}>
                    <span className="text-small tabular-nums text-text-muted">{e}</span>
                  </div>
                  <code className="mt-1 block text-label">elev-{e}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section n="04" title="The persona lens"
        note="A lens, never a gate. Switching persona changes what is expanded, never what exists — folded content stays in the DOM, findable by Ctrl-F, indexed by search, reachable by screen reader. Try it: change the persona and watch the blocks below re-fold.">
        <div className="mb-5 max-w-md"><PersonaSwitch /></div>
        <div className="prose-course">
          <Plainly>
            A model does not read your words. It reads numbers that stand for chunks of
            text, and those chunks rarely line up with words you would recognise.
          </Plainly>
          <ForEngineers>
            Byte-pair encoding merges frequent byte sequences into single vocabulary entries.
            The merge table is learned once, over the training corpus, so the segmentation is
            frozen at training time and is not adapted to your input.
          </ForEngineers>
          <ForLeads>
            Non-English text often costs two to three times more per unit of meaning, because
            the vocabulary was fitted to a corpus that was mostly English. That is a budget
            line, not a curiosity.
          </ForLeads>
          <Aside>
            Whitespace usually attaches to the following token, which is why a leading space
            changes results in ways that look superstitious until you have seen the token ids.
          </Aside>
        </div>
      </Section>

      <Section n="05" title="Content components"
        note="Every one of these is available inside a lesson's MDX. Nothing here contains a colour literal.">
        <div className="prose-course">
          <Callout tone="key" >
            The one idea worth carrying out of a page. Used at most once per lesson.
          </Callout>
          <Callout tone="note">A clarification the reader might otherwise go looking for.</Callout>
          <Callout tone="tip">What people actually do, as opposed to what the docs say.</Callout>
          <Callout tone="warn">A place readers reliably lose an afternoon.</Callout>
          <Callout tone="danger">Something that looks reasonable and is not. Paired with a gotcha entry.</Callout>

          <SelfCheck
            question="Why can the same sentence cost different amounts in two languages?"
            hint="Think about what the vocabulary was fitted to."
            answer="The merge table is learned from a training corpus that is mostly English, so English text compresses into fewer tokens. Other scripts fall back to shorter, more numerous tokens — more tokens for the same meaning, and tokens are the billing unit."
          />

          <Lab
            title="Count your own tokens"
            goal="Build intuition for the gap between characters, words, and tokens by measuring text you actually send."
            minutes={10}
            successLooksLike="You can state your text's token-per-word ratio, and it differs measurably between English and one other language."
            copyable={'echo "Count the tokens in this sentence." | your-tokenizer --count'}
          >
            <ol>
              <li>Take a paragraph you have actually sent to a model this week.</li>
              <li>Count characters, words, and tokens.</li>
              <li>Repeat with the same paragraph translated into another language.</li>
            </ol>
          </Lab>

          <HarnessTabs>
            <Harness name="Claude Code">
              <p>Configuration lives in <code>.claude/</code> alongside the repo.</p>
            </Harness>
            <Harness name="Cursor">
              <p>Rules live in project settings and are applied per workspace.</p>
            </Harness>
            <Harness name="Codex CLI">
              <p>Configuration is a single file in the project root.</p>
            </Harness>
          </HarnessTabs>

          <Diagram
            caption="A tool call is a structured request the model emits and your code fulfils."
            alt="Three boxes left to right: Model, Harness, Tool. An arrow from Model to Harness is labelled 'tool call, structured'. An arrow from Harness to Tool is labelled 'your code runs'. A return arrow from Tool back to Model is labelled 'result, appended to context'."
          >
            <svg viewBox="0 0 560 150" width="100%" height="150" role="img" aria-hidden="true">
              <ArrowDefs />
              {[['Model', 20], ['Harness', 210], ['Tool', 400]].map(([label, x]) => (
                <g key={label as string}>
                  <rect x={x as number} y="40" width="140" height="52" rx="10"
                    {...svgStroke.base} fill="var(--surface-sunken)" />
                  <text x={(x as number) + 70} y="71" textAnchor="middle" {...svgText.title}>{label}</text>
                </g>
              ))}
              <line x1="162" y1="66" x2="205" y2="66" {...svgStroke.accent} markerEnd="url(#arrow-accent)" />
              <line x1="352" y1="66" x2="395" y2="66" {...svgStroke.accent} markerEnd="url(#arrow-accent)" />
              <path d="M470 96 L470 125 L90 125 L90 96" {...svgStroke.base} markerEnd="url(#arrow)" />
              <text x="183" y="34" textAnchor="middle" {...svgText.muted}>tool call</text>
              <text x="373" y="34" textAnchor="middle" {...svgText.muted}>your code</text>
              <text x="280" y="141" textAnchor="middle" {...svgText.muted}>result appended to context</text>
            </svg>
          </Diagram>
        </div>
      </Section>

      <Section n="06" title="Provenance and progress"
        note="The fact policy made visible. Freshness pairs colour with shape so it survives greyscale; sources always show who published and when we last looked.">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="label-caps">Freshness states</p>
            <div className="flex flex-col gap-2">
              <FreshnessBadge verifiedOn="2026-09-01" volatility="high" />
              <FreshnessBadge verifiedOn="2026-07-15" volatility="high" />
              <FreshnessBadge verifiedOn="2026-01-10" volatility="high" />
            </div>
            <div className="pt-3"><LessonProgress id="demo.design" /></div>
          </div>
          <div><SourceList sources={DEMO_SOURCES} /></div>
        </div>
      </Section>

      <Section n="07" title="Navigation components">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="label-caps mb-3">Lesson card</p>
            <LessonCard lesson={DEMO_LESSON} index={1} showModule />
          </div>
          <div>
            <p className="label-caps mb-3">Path stepper</p>
            <div className="rounded-md border border-border bg-surface p-4">
              <PathStepper steps={[
                { id: 'demo.1', title: 'What a model actually does', permalink: '/design', estMinutes: 8 },
                { id: 'demo.2', title: 'Context is the whole interface', permalink: '/design', estMinutes: 11 },
                { id: 'demo.3', title: 'Where confabulation comes from', permalink: '/design', estMinutes: 9 },
              ]} />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <p className="label-caps mb-3">Gotcha card</p>
          <GotchaCard gotcha={{
            id: 'g001',
            title: 'Don’t treat model output as trusted input to anything that executes',
            severity: 'critical',
            whatGoesWrong: 'Generated text reaches a shell, an eval, a SQL string, or a template renderer, and instructions embedded in retrieved content run with your process’s authority.',
            whyItHappens: 'The model cannot distinguish data from instruction; anything that arrives in context is a candidate instruction, including a web page it fetched two steps ago.',
            howToDetect: 'Trace every path from model output to an interpreter. If any path lacks a schema or an allowlist between them, it is exposed.',
            fix: 'Parse into a typed structure before use, allowlist the operations a tool can perform, and run anything untrusted in a sandbox with no ambient credentials.',
          }} />
        </div>
      </Section>

      <Section n="08" title="Accessibility floor"
        note="Not a checklist bolted on afterwards; these are the conditions the components are built under.">
        <ul className="grid gap-2 text-body-lg sm:grid-cols-2">
          {[
            'Body text ≥ 4.5:1 on its surface; UI edges and large text ≥ 3:1.',
            'One focus treatment site-wide — 2px primary outline, 2px offset, never removed.',
            'Colour is never the only signal: severity, freshness and status all pair it with text or shape.',
            'The persona lens folds content, never removes it — search and Ctrl-F still reach it.',
            'Every diagram carries a description of the mechanism, not a caption restated.',
            'Motion collapses to zero under prefers-reduced-motion, through the duration tokens.',
          ].map((line) => (
            <li key={line} className="flex gap-2.5 rounded-sm border border-border bg-surface p-3">
              <svg viewBox="0 0 16 16" className="mt-1 h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
                <path d="M3 8.5l3.2 3.2L13 5" stroke="var(--ok)" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
