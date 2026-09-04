/**
 * Audit pass 5 — Design and accessibility.
 *
 * Three checks, cheapest first:
 *   1. Token discipline — no colour literals outside the token file.
 *   2. Contrast — computed from the OKLCH ramps, for both themes.
 *   3. axe-core over the built output, if `out/` exists.
 *
 * The first two need no browser and run on every commit; the third runs after a
 * build. Together they are why the accessibility floor is a property of the
 * system rather than a periodic review.
 *
 *   pnpm tsx scripts/audit-a11y.ts
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { contrast, parseOklch, toHex, type Oklch } from './lib/color.ts';
import { type Finding } from './lib/findings.ts';

const ROOT = process.cwd();

/* ---------- 1. token discipline ---------------------------------------- */

const LITERAL = /(#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\()/;
const ALLOWED_FILES = new Set(['app/styles/tokens.css']);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|css)$/.test(name)) out.push(full);
  }
  return out;
}

function auditTokenDiscipline(): Finding[] {
  const findings: Finding[] = [];
  const files = [
    ...(existsSync(join(ROOT, 'app')) ? walk(join(ROOT, 'app')) : []),
    ...(existsSync(join(ROOT, 'components')) ? walk(join(ROOT, 'components')) : []),
  ];

  for (const file of files) {
    const rel = relative(ROOT, file);
    if (ALLOWED_FILES.has(rel)) continue;
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (LITERAL.test(line) && !line.trimStart().startsWith('*') && !line.includes('//')) {
        findings.push({
          pass: 'design', severity: 'medium', code: 'colour-literal', subject: rel,
          file: `${rel}:${i + 1}`,
          message: `Colour literal outside the token layer: ${line.trim().slice(0, 80)}`,
          remedy: 'Use a semantic token (var(--…)) so the value follows the theme.',
        });
      }
    });
  }
  return findings;
}

/* ---------- 2. contrast ------------------------------------------------- */

/** Pairs the design system promises. Each is [foreground, background, minimum]. */
const PAIRS: [string, string, number, string][] = [
  ['--text', '--bg', 4.5, 'body text on the page ground'],
  ['--text', '--surface', 4.5, 'body text on a panel'],
  ['--text', '--surface-raised', 4.5, 'body text on a lifted card'],
  ['--text', '--surface-sunken', 4.5, 'body text in a well'],
  ['--text-muted', '--bg', 4.5, 'secondary text on the ground'],
  ['--text-muted', '--surface', 4.5, 'secondary text on a panel'],
  ['--text-faint', '--bg', 4.5, 'labels and captions on the ground'],
  ['--text-faint', '--surface', 4.5, 'labels on a panel'],
  ['--primary', '--bg', 4.5, 'links on the ground'],
  ['--primary', '--surface', 4.5, 'links on a panel'],
  ['--on-primary', '--primary', 4.5, 'text on a primary button'],
  ['--on-primary-container', '--primary-container', 4.5, 'text on a primary surface'],
  ['--on-accent-container', '--accent-container', 4.5, 'text on an accent surface'],
  ['--ok', '--ok-container', 4.5, 'success text on its container'],
  ['--warn', '--warn-container', 4.5, 'warning text on its container'],
  ['--err', '--err-container', 4.5, 'error text on its container'],
  ['--info', '--info-container', 4.5, 'info text on its container'],
  ['--ok', '--bg', 4.5, 'success text on the ground'],
  ['--err', '--bg', 4.5, 'error text on the ground'],
  ['--warn', '--surface', 4.5, 'warning text on a panel'],
  ['--border-strong', '--bg', 3, 'emphasis rules and control edges'],
  ['--primary', '--surface-raised', 3, 'focus ring against a card'],
];

type Theme = 'light' | 'dark';

/**
 * Resolves the token graph in tokens.css for one theme: reference ramps first,
 * then the semantic layer, following var() indirection to a concrete OKLCH.
 */
function resolveTokens(css: string, theme: Theme): Map<string, string> {
  const blocks: string[] = [];

  // The reference ramps and the light semantic layer both live in bare :root.
  for (const m of css.matchAll(/:root\s*\{([\s\S]*?)\n\}/g)) blocks.push(m[1]);

  if (theme === 'dark') {
    const dark = css.match(/:root\[data-theme='dark'\]\s*\{([\s\S]*?)\n\}/);
    if (dark) blocks.push(dark[1]);
  }

  const raw = new Map<string, string>();
  for (const block of blocks) {
    for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      raw.set(m[1], m[2].trim());
    }
  }

  const resolved = new Map<string, string>();
  const resolve = (name: string, depth = 0): string | undefined => {
    if (depth > 10) return undefined;
    const value = raw.get(name);
    if (!value) return undefined;
    const ref = value.match(/^var\((--[\w-]+)\)$/);
    return ref ? resolve(ref[1], depth + 1) : value;
  };
  for (const name of raw.keys()) {
    const value = resolve(name);
    if (value?.startsWith('oklch')) resolved.set(name, value);
  }
  return resolved;
}

function auditContrast(): Finding[] {
  const findings: Finding[] = [];
  const cssPath = join(ROOT, 'app/styles/tokens.css');
  if (!existsSync(cssPath)) {
    return [{
      pass: 'design', severity: 'high', code: 'tokens-missing', subject: 'app/styles/tokens.css',
      message: 'Token file not found.', remedy: 'The design system must exist before content.',
    }];
  }
  const css = readFileSync(cssPath, 'utf8');

  for (const theme of ['light', 'dark'] as Theme[]) {
    const tokens = resolveTokens(css, theme);
    for (const [fgName, bgName, min, use] of PAIRS) {
      const fgRaw = tokens.get(fgName);
      const bgRaw = tokens.get(bgName);
      if (!fgRaw || !bgRaw) {
        findings.push({
          pass: 'design', severity: 'medium', code: 'token-unresolved', subject: `${theme}:${fgName}/${bgName}`,
          message: `Could not resolve ${!fgRaw ? fgName : bgName} in ${theme} theme.`,
          remedy: 'Every semantic token must resolve to an OKLCH value in both themes.',
        });
        continue;
      }
      const fg = parseOklch(fgRaw) as Oklch;
      const bg = parseOklch(bgRaw) as Oklch;
      if (!fg || !bg) continue;

      const ratio = contrast(fg, bg);
      if (ratio < min) {
        findings.push({
          pass: 'design',
          severity: ratio < min - 1 ? 'high' : 'medium',
          code: 'contrast-below-floor',
          subject: `${theme}: ${fgName} on ${bgName}`,
          message: `${ratio.toFixed(2)}:1, floor is ${min}:1 — ${use}. ` +
            `(${toHex(fg)} on ${toHex(bg)})`,
          remedy: `Move ${fgName} along its ramp until the pair clears ${min}:1 in ${theme}.`,
        });
      }
    }
  }
  return findings;
}

/* ---------- 3. axe over the built output -------------------------------- */

async function auditAxe(): Promise<Finding[]> {
  const outDir = join(ROOT, 'out');
  if (!existsSync(outDir)) {
    return [{
      pass: 'design', severity: 'info', code: 'axe-skipped', subject: 'out/',
      message: 'No build output; axe pass skipped.',
      remedy: 'Run `pnpm build` first to include the runtime accessibility pass.',
    }];
  }

  let chromium: typeof import('playwright').chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    return [{
      pass: 'design', severity: 'info', code: 'axe-unavailable', subject: 'playwright',
      message: 'Playwright is not installed; axe pass skipped.',
      remedy: 'Run `pnpm exec playwright install chromium`.',
    }];
  }

  const pages = ['index.html', 'design/index.html', 'wiki/index.html', 'tools/index.html']
    .map((p) => join(outDir, p))
    .filter(existsSync);
  if (pages.length === 0) return [];

  const findings: Finding[] = [];
  const axeSource = readFileSync(
    join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8',
  );

  let browser;
  try {
    browser = await chromium.launch();
  } catch {
    return [{
      pass: 'design', severity: 'info', code: 'axe-unavailable', subject: 'chromium',
      message: 'Chromium binary not installed; axe pass skipped.',
      remedy: 'Run `pnpm exec playwright install chromium`.',
    }];
  }

  const page = await browser.newPage();
  for (const file of pages) {
    await page.goto(`file://${file}`);
    await page.addScriptTag({ content: axeSource });
    const results: any = await page.evaluate(
      () => (window as any).axe.run({ runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] }),
    );
    for (const violation of results.violations ?? []) {
      // Include the offending selector and markup: a violation you cannot locate
      // is not a finding, it is a rumour.
      const where = (violation.nodes ?? [])
        .slice(0, 3)
        .map((n: any) => `${(n.target ?? []).join(' ')} — ${String(n.html ?? '').slice(0, 160)}`)
        .join(' | ');
      findings.push({
        pass: 'design',
        severity: violation.impact === 'critical' || violation.impact === 'serious' ? 'high' : 'medium',
        code: `axe-${violation.id}`,
        subject: relative(outDir, file),
        message: `${violation.help} (${violation.nodes.length} node${violation.nodes.length === 1 ? '' : 's'}) :: ${where}`,
        remedy: violation.helpUrl,
      });
    }
  }
  await browser.close();
  return findings;
}

export async function auditA11y(): Promise<Finding[]> {
  return [...auditTokenDiscipline(), ...auditContrast(), ...(await auditAxe())];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const findings = await auditA11y();
  const { writeReport, isBlocking, summarise } = await import('./lib/findings.ts');
  const runId = `a11y-${new Date().toISOString().slice(0, 10)}`;
  const path = writeReport(runId, findings);
  console.log(JSON.stringify(summarise(findings)), '->', path);
  process.exit(isBlocking(findings) ? 1 : 0);
}
