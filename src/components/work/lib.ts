/**
 * Pure helpers for the work page and the project pages. No React, no DOM,
 * so they are unit tested in tests/unit/work.test.ts.
 */

const ROMAN: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/** 1 -> "I", 8 -> "VIII". Plate numerals, so only 1 to 3999. */
export function toRoman(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 3999) {
    throw new RangeError(`toRoman expects an integer from 1 to 3999, got ${value}`);
  }
  let rest = value;
  let out = "";
  for (const [amount, glyph] of ROMAN) {
    while (rest >= amount) {
      out += glyph;
      rest -= amount;
    }
  }
  return out;
}

/** Roman numeral of a slug's position in the list (1-based), or "" when unknown. */
export function numeralFor(slug: string, list: readonly { slug: string }[]): string {
  const index = list.findIndex((item) => item.slug === slug);
  return index < 0 ? "" : toRoman(index + 1);
}

/**
 * Previous and next item around `slug`, wrapping at both ends so the last
 * project leads back to the first. Null when the slug is unknown or alone.
 */
export function neighbours<T extends { slug: string }>(slug: string, list: readonly T[]): { prev: T; next: T } | null {
  const index = list.findIndex((item) => item.slug === slug);
  if (index < 0 || list.length < 2) return null;
  return {
    prev: list[(index - 1 + list.length) % list.length],
    next: list[(index + 1) % list.length],
  };
}

/** Featured items first, each group keeping its original order. */
export function featuredFirst<T extends { featured: boolean }>(list: readonly T[]): T[] {
  return [...list.filter((item) => item.featured), ...list.filter((item) => !item.featured)];
}

/** Rounded SVG number, so server and browser print identical attributes. */
export function r2(value: number): number {
  return Math.round(value * 100) / 100 || 0;
}

/** Point on a circle, angle in degrees clockwise from twelve o'clock. */
export function polar(cx: number, cy: number, radius: number, degrees: number): [number, number] {
  const rad = (degrees * Math.PI) / 180;
  return [r2(cx + radius * Math.sin(rad)), r2(cy - radius * Math.cos(rad))];
}

/**
 * Clamp the floating preview inside the list box: keeps a figure of size
 * w x h fully inside [0, maxW] x [minY, maxY].
 */
export function clampPreview(x: number, y: number, w: number, h: number, maxW: number, minY: number, maxY: number): [number, number] {
  const cx = Math.min(Math.max(x, 0), Math.max(0, maxW - w));
  const cy = Math.min(Math.max(y, minY), Math.max(minY, maxY - h));
  return [cx, cy];
}
