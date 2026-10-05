/**
 * Pure helpers for plate 01: date geometry for the compass timeline, lane
 * packing, and parsing of the measured values from projects.ts. No React, so
 * everything here is unit tested in tests/unit/about.test.ts.
 */

import type { Locale } from "@/i18n/config";

const DAY = 86_400_000;

/** Days since the Unix epoch for an ISO date (YYYY-MM-DD), in UTC. */
export function isoToDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY);
}

export interface Axis {
  /** First day on the axis (inclusive). */
  start: number;
  /** Day after the last day on the axis (exclusive). */
  end: number;
}

/** Axis from the first of `fromMonth` to the end of `toMonth` (both "YYYY-MM"). */
export function monthAxis(fromMonth: string, toMonth: string): Axis {
  const [ty, tm] = toMonth.split("-").map(Number);
  const next = tm === 12 ? `${ty + 1}-01-01` : `${ty}-${String(tm + 1).padStart(2, "0")}-01`;
  return { start: isoToDay(`${fromMonth}-01`), end: isoToDay(next) };
}

/** Fraction 0..1 along the axis for a day number (clamped). */
export function axisT(axis: Axis, day: number): number {
  const t = (day - axis.start) / (axis.end - axis.start);
  return Math.min(1, Math.max(0, t));
}

/** Angle in degrees on an upper semicircle: t=0 sits at 180 (left), t=1 at 0 (right). */
export function tToDeg(t: number): number {
  return 180 * (1 - t);
}

export interface Point {
  x: number;
  y: number;
}

/** Point on a circle for a math angle in degrees (counter-clockwise, SVG y points down). */
export function polar(cx: number, cy: number, r: number, deg: number): Point {
  const a = (deg * Math.PI) / 180;
  return { x: round(cx + r * Math.cos(a)), y: round(cy - r * Math.sin(a)) };
}

/** SVG path for an arc on the upper semicircle from degA down to degB (degA > degB). */
export function arcPath(cx: number, cy: number, r: number, degA: number, degB: number): string {
  const a = polar(cx, cy, r, degA);
  const b = polar(cx, cy, r, degB);
  const large = Math.abs(degA - degB) > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface Span {
  slug: string;
  /** First day (inclusive). */
  from: number;
  /** Day after the last day (exclusive), so a single day spans one unit. */
  to: number;
}

export function spanOf(slug: string, period: { from: string; to: string }): Span {
  return { slug, from: isoToDay(period.from), to: isoToDay(period.to) + 1 };
}

/**
 * Greedy lane packing: every span goes into the first lane where it starts at
 * least `gapDays` after the previous span in that lane ended. Returns a lane
 * index per slug. Keeps markers that share a week from sitting on each other.
 */
export function packLanes(spans: Span[], gapDays: number): Record<string, number> {
  const sorted = [...spans].sort((a, b) => a.from - b.from || a.to - b.to);
  const laneEnds: number[] = [];
  const lanes: Record<string, number> = {};
  for (const span of sorted) {
    let lane = laneEnds.findIndex((end) => span.from - end >= gapDays);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(span.to);
    } else {
      laneEnds[lane] = span.to;
    }
    lanes[span.slug] = lane;
  }
  return lanes;
}

/** Inclusive number of calendar days in a period. */
export function periodDays(period: { from: string; to: string }): number {
  return isoToDay(period.to) - isoToDay(period.from) + 1;
}

/** Month index 0..11 and year of an ISO date. */
export function monthOf(iso: string): { month: number; year: number; day: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

/**
 * Human period: "22 augustus 2026", "7 tot 12 september 2026" or
 * "22 maart tot 28 juli 2026". Month names come from the caller (copy.ts)
 * so server and browser always agree.
 */
export function formatPeriod(period: { from: string; to: string }, months: string[], until: string): string {
  const a = monthOf(period.from);
  const b = monthOf(period.to);
  if (period.from === period.to) return `${a.day} ${months[a.month]} ${a.year}`;
  if (a.year === b.year && a.month === b.month) return `${a.day} ${until} ${b.day} ${months[b.month]} ${b.year}`;
  if (a.year === b.year) return `${a.day} ${months[a.month]} ${until} ${b.day} ${months[b.month]} ${b.year}`;
  return `${a.day} ${months[a.month]} ${a.year} ${until} ${b.day} ${months[b.month]} ${b.year}`;
}

const numberWords: Record<Locale, string[]> = {
  nl: ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien", "elf", "twaalf"],
  en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"],
};

/** Small counts as words in running text ("acht projecten"), larger ones as digits. */
export function countWord(n: number, lang: Locale): string {
  return numberWords[lang][n] ?? String(n);
}

export interface Measured {
  prefix: string;
  value: number;
  decimals: number;
  suffix: string;
  /** The original string, exactly as written in projects.ts. */
  raw: string;
}

/**
 * Splits a metric value like "$3,85", "9.6%", "6 dagen" or "110" into a
 * number that can count up and the text around it. Uses the decimal mark of
 * the locale (comma in Dutch, point in English). Returns null when the value
 * has no single leading number to count.
 */
export function parseMeasured(raw: string, lang: Locale): Measured | null {
  const decimal = lang === "nl" ? "," : ".";
  const escaped = decimal === "." ? "\\." : ",";
  const match = raw.match(new RegExp(`^([^\\d]*?)(\\d+(?:${escaped}\\d+)?)(.*)$`));
  if (!match) return null;
  const [, prefix, num, suffix] = match;
  // A thousands separator (e.g. "3.097" in Dutch) would read as a second number.
  if (/^[.,]\d/.test(suffix)) return null;
  const [int, frac = ""] = num.split(decimal);
  return { prefix, value: Number(`${int}.${frac || 0}`), decimals: frac.length, suffix, raw };
}

/** Formats a counting value back into the shape of the original string. */
export function formatMeasured(m: Measured, value: number, lang: Locale): string {
  const fixed = value.toFixed(m.decimals);
  const local = lang === "nl" ? fixed.replace(".", ",") : fixed;
  return `${m.prefix}${local}${m.suffix}`;
}

/** Exponential ease-out, matching --ease-out-expo closely enough for counting. */
export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}
