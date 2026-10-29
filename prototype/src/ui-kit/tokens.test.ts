import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(__dirname, "tokens.css"), "utf8");

/** The `--name: oklch(L C H);` declarations of the :root block. */
function tokens(): Record<string, [number, number, number]> {
  const out: Record<string, [number, number, number]> = {};
  const re = /--([a-z-]+):\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  for (const m of css.matchAll(re)) out[m[1]!] = [Number(m[2]), Number(m[3]), Number(m[4])];
  return out;
}

/** OKLCH to linear sRGB, clipped to the gamut. */
function linear([L, C, H]: [number, number, number]): [number, number, number] {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb: [number, number, number] = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return rgb.map((v) => Math.min(1, Math.max(0, v))) as [number, number, number];
}

function luminance(c: [number, number, number]): number {
  const [r, g, b] = linear(c);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg: string, bg: string): number {
  const t = tokens();
  const [hi, lo] = [luminance(t[fg]!), luminance(t[bg]!)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe("text tokens (ADEQUATE-CONTRAST, LARGE-TEXT-CONTRAST)", () => {
  const TEXT_PAIRS: [string, string][] = [
    ["foreground", "background"],
    ["card-foreground", "card"],
    ["popover-foreground", "popover"],
    ["primary-foreground", "primary"],
    ["secondary-foreground", "secondary"],
    ["muted-foreground", "muted"],
    ["muted-foreground", "background"],
    ["accent-foreground", "accent"],
    ["destructive-foreground", "destructive"],
    ["destructive", "background"],
    ["warning-foreground", "warning"],
    ["success-foreground", "success"],
  ];

  it("declares every token of the pairs", () => {
    const t = tokens();
    for (const pair of TEXT_PAIRS) for (const n of pair) expect(t[n], n).toBeDefined();
  });

  it.each(TEXT_PAIRS)("%s on %s is at least 4.5:1", (fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("non-text tokens (NON-TEXT-CONTRAST, FOCUS-VISIBLE)", () => {
  const NON_TEXT_PAIRS: [string, string][] = [
    ["border", "background"],
    ["border", "card"],
    ["input", "background"],
    ["ring", "background"],
    ["ring", "card"],
    ["primary", "background"],
  ];

  it.each(NON_TEXT_PAIRS)("%s against %s is at least 3:1", (fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);
  });
});

describe("sizes (READABLE-TEXT)", () => {
  it("states the focus ring width of 2 px and sizes in rem", () => {
    expect(css).toMatch(/--ring-width:\s*2px/);
    expect(css).toMatch(/--radius:\s*[\d.]+rem/);
  });
});
