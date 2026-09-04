/**
 * OKLCH → sRGB → WCAG relative luminance.
 *
 * The palette is authored in OKLCH, so contrast can be checked arithmetically
 * rather than sampled from screenshots. This is what makes the accessibility
 * floor a build-time assertion instead of a hope.
 */

export interface Oklch { l: number; c: number; h: number }

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Returns linear-light sRGB in [0,1], which is also what WCAG luminance wants. */
export function oklchToLinearSrgb({ l: L, c, h }: Oklch): [number, number, number] {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ ** 3, m3 = m_ ** 3, s3 = s_ ** 3;

  return [
    clamp01(+4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3),
    clamp01(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3),
    clamp01(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3),
  ];
}

export function luminance(color: Oklch): number {
  const [r, g, b] = oklchToLinearSrgb(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: Oklch, b: Oklch): number {
  const la = luminance(a), lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function toHex(color: Oklch): string {
  const gamma = (u: number) =>
    u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055;
  return (
    '#' +
    oklchToLinearSrgb(color)
      .map((u) => Math.round(clamp01(gamma(u)) * 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

/** Parses `oklch(45% 0.13 275)` — the only colour syntax tokens.css uses. */
export function parseOklch(value: string): Oklch | null {
  const m = value.match(
    /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+\s*)?\)/i,
  );
  if (!m) return null;
  const raw = Number(m[1]);
  return {
    l: value.includes('%') ? raw / 100 : raw,
    c: Number(m[2]),
    h: Number(m[3]),
  };
}
