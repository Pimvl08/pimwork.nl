import type { Locale } from "@/i18n/config";

/**
 * Pure helpers for the work plate and the project pages. No React, no DOM,
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
 * plate leads back to the first. Null when the slug is unknown or alone.
 */
export function neighbours<T extends { slug: string }>(slug: string, list: readonly T[]): { prev: T; next: T } | null {
  const index = list.findIndex((item) => item.slug === slug);
  if (index < 0 || list.length < 2) return null;
  return {
    prev: list[(index - 1 + list.length) % list.length],
    next: list[(index + 1) % list.length],
  };
}

const MONTHS: Record<Locale, string[]> = {
  nl: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

const UNTIL: Record<Locale, string> = { nl: "tot", en: "to" };

function parseIsoDate(iso: string): { y: number; m: number; d: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new RangeError(`Expected an ISO date (YYYY-MM-DD), got "${iso}"`);
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

/**
 * A period written the way a person would say it, without Intl so server and
 * browser always agree: "22 aug 2026", "7 tot 12 sep 2026",
 * "22 mrt tot 28 jul 2026", "mrt 2025 tot jul 2026".
 */
export function formatPeriod(period: { from: string; to: string }, lang: Locale): string {
  const a = parseIsoDate(period.from);
  const b = parseIsoDate(period.to);
  const months = MONTHS[lang];
  const until = UNTIL[lang];
  if (a.y !== b.y) return `${months[a.m - 1]} ${a.y} ${until} ${months[b.m - 1]} ${b.y}`;
  if (a.m !== b.m) return `${a.d} ${months[a.m - 1]} ${until} ${b.d} ${months[b.m - 1]} ${b.y}`;
  if (a.d !== b.d) return `${a.d} ${until} ${b.d} ${months[b.m - 1]} ${b.y}`;
  return `${a.d} ${months[a.m - 1]} ${a.y}`;
}

/** "2026", or "2025 tot 2026" when a project crosses a year. */
export function periodYear(period: { from: string; to: string }, lang: Locale): string {
  const from = period.from.slice(0, 4);
  const to = period.to.slice(0, 4);
  return from === to ? from : `${from} ${UNTIL[lang]} ${to}`;
}

/** Writes a decimal the local way: 2.5 -> "2,5" in Dutch. */
export function decimal(value: number, lang: Locale): string {
  const text = String(value);
  return lang === "nl" ? text.replace(".", ",") : text;
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
