/**
 * Pure helpers that turn the measured snapshot (src/content/generated/stats.json)
 * into chart rows. Nothing here invents a number: every value is read from the
 * JSON or from the stack lists in src/content/projects.ts.
 */

export type LangKey = "ts" | "tsx" | "js" | "py" | "rs" | "swift" | "sql" | "css" | "html" | "sh";

export interface LangCount {
  files: number;
  lines: number;
}

export interface TestsByKind {
  js: number;
  rust: number;
  python: number;
  pgtap: number;
}

export interface ProjectStats {
  slug: string;
  languages: Partial<Record<string, LangCount>>;
  docsLines: number;
  tests: number;
  testsByKind?: TestsByKind;
  dependencies: number | null;
  commitsByWeek: Record<string, number>;
  firstDate: string | null;
  lastDate: string | null;
  dateSource: "git" | "files";
}

export interface StatsFile {
  generatedAt: string;
  projects: ProjectStats[];
  totals: {
    projects: number;
    files: number;
    lines: number;
    docsLines: number;
    tests: number;
    dependencies: number;
    commits: number;
    languages: Partial<Record<string, LangCount>>;
  };
}

/* ------------------------------------------------------------ fills */

/** Monochrome fills: ink density and hatching instead of hue. */
export type FillId = "solid" | "tone" | "hatch45" | "hatch135" | "cross" | "dots" | "light";

/** Language families, in fixed legend order. Each owns one fill, always. */
export const FAMILIES = [
  { id: "typescript", langs: ["ts", "tsx"], fill: "solid" },
  { id: "javascript", langs: ["js"], fill: "tone" },
  { id: "python", langs: ["py"], fill: "hatch45" },
  { id: "rust", langs: ["rs"], fill: "hatch135" },
  { id: "sql", langs: ["sql"], fill: "cross" },
  { id: "web", langs: ["html", "css"], fill: "dots" },
  { id: "other", langs: ["sh", "swift"], fill: "light" },
] as const satisfies readonly { id: string; langs: readonly LangKey[]; fill: FillId }[];

export type FamilyId = (typeof FAMILIES)[number]["id"];

/** Test kinds share the fill of the language they are written in. */
export const TEST_KINDS = [
  { id: "js", fill: "solid" },
  { id: "rust", fill: "hatch135" },
  { id: "python", fill: "hatch45" },
  { id: "pgtap", fill: "cross" },
] as const satisfies readonly { id: keyof TestsByKind; fill: FillId }[];

export type TestKindId = (typeof TEST_KINDS)[number]["id"];

/* ------------------------------------------------------------ lines */

export interface FamilySlice {
  family: FamilyId;
  fill: FillId;
  lines: number;
  files: number;
  /** The raw language keys inside this slice, largest first. */
  parts: { lang: string; lines: number; files: number }[];
}

/** Code lines per language family, in legend order, empty families left out. */
export function familySlices(p: Pick<ProjectStats, "languages">): FamilySlice[] {
  const out: FamilySlice[] = [];
  for (const fam of FAMILIES) {
    const parts = fam.langs
      .map((lang) => ({ lang, lines: p.languages[lang]?.lines ?? 0, files: p.languages[lang]?.files ?? 0 }))
      .filter((part) => part.lines > 0)
      .sort((a, b) => b.lines - a.lines);
    if (parts.length === 0) continue;
    out.push({
      family: fam.id,
      fill: fam.fill,
      lines: parts.reduce((s, x) => s + x.lines, 0),
      files: parts.reduce((s, x) => s + x.files, 0),
      parts,
    });
  }
  return out;
}

export function codeLines(p: Pick<ProjectStats, "languages">): number {
  let n = 0;
  for (const v of Object.values(p.languages)) n += v?.lines ?? 0;
  return n;
}

export function codeFiles(p: Pick<ProjectStats, "languages">): number {
  let n = 0;
  for (const v of Object.values(p.languages)) n += v?.files ?? 0;
  return n;
}

/** Families that occur anywhere in the snapshot, with their total lines. */
export function familyTotals(projects: Pick<ProjectStats, "languages">[]): { family: FamilyId; fill: FillId; lines: number }[] {
  const sums = new Map<FamilyId, number>();
  for (const p of projects) for (const s of familySlices(p)) sums.set(s.family, (sums.get(s.family) ?? 0) + s.lines);
  return FAMILIES.filter((f) => (sums.get(f.id) ?? 0) > 0).map((f) => ({ family: f.id, fill: f.fill, lines: sums.get(f.id) ?? 0 }));
}

/** A round number just above the maximum, for the scale rings (5k steps). */
export function niceMax(max: number, step = 5000): number {
  if (max <= 0) return step;
  return Math.ceil(max / step) * step;
}

/* ------------------------------------------------------------ weeks */

const DAY = 86_400_000;

function utc(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function isoDayOf(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** ISO 8601 week key ("2026-W12") of a calendar date. Same rule as the collector. */
export function isoWeekKey(iso: string): string {
  const date = new Date(utc(iso));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const year = date.getUTCFullYear();
  const week = Math.ceil(((date.getTime() - Date.UTC(year, 0, 1)) / DAY + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Monday of the ISO week that holds this date. */
export function mondayOf(iso: string): string {
  const t = utc(iso);
  const day = new Date(t).getUTCDay() || 7;
  return isoDayOf(t - (day - 1) * DAY);
}

export interface Week {
  key: string;
  /** Monday, ISO date. */
  start: string;
  index: number;
}

/** All ISO weeks that touch the range [from, to], in order. */
export function weeksBetween(from: string, to: string): Week[] {
  const out: Week[] = [];
  let t = utc(mondayOf(from));
  const end = utc(to);
  while (t <= end) {
    const start = isoDayOf(t);
    out.push({ key: isoWeekKey(start), start, index: out.length });
    t += 7 * DAY;
  }
  return out;
}

/** Position of a date on the week axis, in weeks from the first Monday (fractional). */
export function weekPosition(iso: string, weeks: Week[]): number {
  if (weeks.length === 0) return 0;
  return (utc(iso) - utc(weeks[0].start)) / (7 * DAY);
}

/** Months that start inside the week range, with their position on the week axis. */
export function monthTicks(weeks: Week[]): { month: number; year: number; pos: number }[] {
  if (weeks.length === 0) return [];
  const first = utc(weeks[0].start);
  const last = utc(weeks[weeks.length - 1].start) + 7 * DAY;
  const out: { month: number; year: number; pos: number }[] = [];
  const d = new Date(first);
  let y = d.getUTCFullYear();
  let m = d.getUTCMonth();
  if (d.getUTCDate() !== 1) m += 1;
  for (;;) {
    if (m > 11) {
      m = 0;
      y += 1;
    }
    const t = Date.UTC(y, m, 1);
    if (t >= last) break;
    out.push({ month: m, year: y, pos: (t - first) / (7 * DAY) });
    m += 1;
  }
  return out;
}

export interface TimelineRow {
  slug: string;
  dateSource: "git" | "files";
  /** Commit weeks inside the range (git projects). */
  commits: { key: string; index: number; n: number }[];
  /** Commits outside the shown range, so nothing silently disappears. */
  commitsOutside: number;
  totalCommits: number;
  /** File-dated span in weeks from the first Monday (files projects). */
  band: { from: number; to: number } | null;
  firstDate: string | null;
  lastDate: string | null;
}

/** One track per project, earliest first. Ties keep the input order. */
export function timelineRows(projects: ProjectStats[], weeks: Week[]): TimelineRow[] {
  const byKey = new Map(weeks.map((w) => [w.key, w.index]));
  const rows = projects.map((p, order) => {
    const commits: TimelineRow["commits"] = [];
    let outside = 0;
    let total = 0;
    for (const [key, n] of Object.entries(p.commitsByWeek)) {
      total += n;
      const index = byKey.get(key);
      if (index === undefined) outside += n;
      else commits.push({ key, index, n });
    }
    commits.sort((a, b) => a.index - b.index);
    let band: TimelineRow["band"] = null;
    if (p.dateSource === "files" && p.firstDate && p.lastDate) {
      // A file-dated span covers whole days: the last day counts to its end.
      band = { from: weekPosition(p.firstDate, weeks), to: weekPosition(p.lastDate, weeks) + 1 / 7 };
    }
    return {
      row: {
        slug: p.slug,
        dateSource: p.dateSource,
        commits,
        commitsOutside: outside,
        totalCommits: total,
        band,
        firstDate: p.firstDate,
        lastDate: p.lastDate,
      } satisfies TimelineRow,
      order,
    };
  });
  rows.sort((a, b) => {
    const da = a.row.firstDate ?? "9999";
    const db = b.row.firstDate ?? "9999";
    return da === db ? a.order - b.order : da.localeCompare(db);
  });
  return rows.map((r) => r.row);
}

export function maxWeekCommits(rows: TimelineRow[]): number {
  let max = 0;
  for (const r of rows) for (const c of r.commits) max = Math.max(max, c.n);
  return max;
}

/** Dot radius by area (sqrt), so a week with 4x the commits has 4x the ink. */
export function dotRadius(n: number, max: number, rMin: number, rMax: number): number {
  if (n <= 0 || max <= 0) return 0;
  return rMin + Math.sqrt(n / max) * (rMax - rMin);
}

/* ------------------------------------------------------------ tests */

export interface TestRow {
  slug: string;
  total: number;
  parts: { kind: TestKindId; fill: FillId; n: number }[];
}

export function testRows(projects: ProjectStats[]): TestRow[] {
  return projects.map((p) => {
    const by = p.testsByKind;
    const parts = by
      ? TEST_KINDS.map((k) => ({ kind: k.id, fill: k.fill, n: by[k.id] ?? 0 })).filter((x) => x.n > 0)
      : p.tests > 0
        ? [{ kind: "js" as const, fill: "solid" as const, n: p.tests }]
        : [];
    return { slug: p.slug, total: p.tests, parts };
  });
}

/* ------------------------------------------------------------ stack */

const TECH_ALIASES: Record<string, string> = {
  "supabase auth": "Supabase",
  "swift + coreaudio": "Swift",
  "typescript strict": "TypeScript",
  "vanilla js + svg": "JavaScript",
};

/** "React 19" and "React 18" are one building block; so are "Vite 8" and "Vite". */
export function normaliseTech(raw: string): string {
  const trimmed = raw.trim();
  const alias = TECH_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;
  return trimmed
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+v?\d+(?:\.\d+)*\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface TechRow {
  tech: string;
  slugs: string[];
}

/** Technologies used by at least `minShared` projects, most shared first. */
export function sharedTech(projects: { slug: string; stack: string[] }[], minShared = 2): TechRow[] {
  const map = new Map<string, Set<string>>();
  const firstSeen = new Map<string, number>();
  let i = 0;
  for (const p of projects) {
    for (const raw of p.stack) {
      const tech = normaliseTech(raw);
      if (!tech) continue;
      if (!map.has(tech)) {
        map.set(tech, new Set());
        firstSeen.set(tech, i++);
      }
      map.get(tech)!.add(p.slug);
    }
  }
  const order = projects.map((p) => p.slug);
  return [...map.entries()]
    .filter(([, s]) => s.size >= minShared)
    .sort(([a, sa], [b, sb]) => sb.size - sa.size || (firstSeen.get(a)! - firstSeen.get(b)!))
    .map(([tech, s]) => ({ tech, slugs: order.filter((slug) => s.has(slug)) }));
}

/* ------------------------------------------------------------ format */

export function formatInt(n: number, lang: "nl" | "en"): string {
  return new Intl.NumberFormat(lang === "nl" ? "nl-NL" : "en-GB", { maximumFractionDigits: 0 }).format(n);
}

export function formatDay(iso: string, lang: "nl" | "en", withYear = true): string {
  const t = utc(iso);
  return new Intl.DateTimeFormat(lang === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(t));
}

/* ------------------------------------------------------------ geometry */

/**
 * Round an SVG coordinate to two decimals. Math.sin/cos may differ in the last
 * bits between the server (Node) and the browser engine, so every coordinate
 * that is rendered on both sides goes through this to keep hydration exact.
 */
export const round2 = (n: number) => Math.round(n * 100) / 100;
const f = round2;

/** Point on a circle; degrees counter-clockwise from 3 o'clock, y down (SVG). Rounded to 2 decimals. */
export function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [f(cx + r * Math.cos(a)), f(cy - r * Math.sin(a))];
}

/** Arc from angle a0 to a1 (degrees, either direction) on radius r. */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  // Decreasing angle = clockwise on screen = sweep flag 1.
  const sweep = a1 < a0 ? 1 : 0;
  return `M${f(x0)} ${f(y0)} A${f(r)} ${f(r)} 0 ${large} ${sweep} ${f(x1)} ${f(y1)}`;
}

/** Closed annular sector between radii r0..r1 and angles a0..a1. */
export function sectorPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const [ax, ay] = polar(cx, cy, r1, a0);
  const [bx, by] = polar(cx, cy, r1, a1);
  const [c1, c2] = polar(cx, cy, r0, a1);
  const [dx, dy] = polar(cx, cy, r0, a0);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 < a0 ? 1 : 0;
  return `M${f(ax)} ${f(ay)} A${f(r1)} ${f(r1)} 0 ${large} ${sweep} ${f(bx)} ${f(by)} L${f(c1)} ${f(c2)} A${f(r0)} ${f(r0)} 0 ${large} ${1 - sweep} ${f(dx)} ${f(dy)} Z`;
}

/** A straight bar of constant thickness along a ray, from radius r0 to r1. */
export function rayBar(cx: number, cy: number, deg: number, r0: number, r1: number, thickness: number): string {
  const a = (deg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = -Math.sin(a);
  // Normal to the ray, in screen space.
  const nx = -uy * (thickness / 2);
  const ny = ux * (thickness / 2);
  const p = [
    [cx + ux * r0 + nx, cy + uy * r0 + ny],
    [cx + ux * r1 + nx, cy + uy * r1 + ny],
    [cx + ux * r1 - nx, cy + uy * r1 - ny],
    [cx + ux * r0 - nx, cy + uy * r0 - ny],
  ];
  return `M${p.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} Z`;
}

/**
 * Splits [start, start + length] into consecutive segments with a fixed gap
 * between them (the surface gap). Segments too short to survive the gap keep
 * a hairline minimum so no measured slice disappears.
 */
export function segmentRuns(values: number[], start: number, length: number, gap: number, min = 1.5): { from: number; to: number }[] {
  const total = values.reduce((s, v) => s + v, 0);
  if (total <= 0 || values.length === 0) return [];
  const out: { from: number; to: number }[] = [];
  let acc = 0;
  for (let i = 0; i < values.length; i++) {
    const a = start + (acc / total) * length;
    acc += values[i];
    const b = start + (acc / total) * length;
    const from = i === 0 ? a : a + gap / 2;
    const to = i === values.length - 1 ? b : b - gap / 2;
    out.push({ from, to: Math.max(to, from + min) });
  }
  return out;
}

/* ------------------------------------------------------------ input */

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);
const day = (v: unknown): string | null => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

/**
 * Reads the snapshot defensively: unknown fields are dropped, bad numbers
 * become 0 and bad dates null, so a damaged file shows as "nothing measured"
 * instead of as invented values.
 */
export function parseStats(raw: unknown): StatsFile {
  const r = (raw ?? {}) as Record<string, unknown>;
  const list = Array.isArray(r.projects) ? r.projects : [];
  const projects: ProjectStats[] = list.map((item) => {
    const p = (item ?? {}) as Record<string, unknown>;
    const languages: ProjectStats["languages"] = {};
    for (const [k, v] of Object.entries((p.languages ?? {}) as Record<string, unknown>)) {
      const lv = (v ?? {}) as Record<string, unknown>;
      languages[k] = { files: num(lv.files), lines: num(lv.lines) };
    }
    const commitsByWeek: Record<string, number> = {};
    for (const [k, v] of Object.entries((p.commitsByWeek ?? {}) as Record<string, unknown>)) {
      if (/^\d{4}-W\d{2}$/.test(k) && num(v) > 0) commitsByWeek[k] = num(v);
    }
    const tk = p.testsByKind as Record<string, unknown> | undefined;
    return {
      slug: String(p.slug ?? ""),
      languages,
      docsLines: num(p.docsLines),
      tests: num(p.tests),
      testsByKind: tk ? { js: num(tk.js), rust: num(tk.rust), python: num(tk.python), pgtap: num(tk.pgtap) } : undefined,
      dependencies: p.dependencies === null || p.dependencies === undefined ? null : num(p.dependencies),
      commitsByWeek,
      firstDate: day(p.firstDate),
      lastDate: day(p.lastDate),
      dateSource: p.dateSource === "git" ? "git" : "files",
    };
  });
  const t = (r.totals ?? {}) as Record<string, unknown>;
  return {
    generatedAt: typeof r.generatedAt === "string" ? r.generatedAt : "",
    projects,
    totals: {
      projects: num(t.projects),
      files: num(t.files),
      lines: num(t.lines),
      docsLines: num(t.docsLines),
      tests: num(t.tests),
      dependencies: num(t.dependencies),
      commits: num(t.commits),
      languages: (t.languages ?? {}) as StatsFile["totals"]["languages"],
    },
  };
}
