/**
 * Turns the stack lists of Pim's projects into weighted technologies for the
 * "Stapel" experiment. Pure, so it is unit tested against the real content.
 */

export interface StackSource {
  slug: string;
  name: string;
  stack: readonly string[];
}

export interface Technology {
  name: string;
  /** In how many projects it appears. */
  count: number;
  /** Names of those projects, in content order. */
  projects: string[];
}

/** Names that mean the same product once versions and notes are removed. */
const ALIASES: Record<string, string> = {
  "Supabase Auth": "Supabase",
};

/**
 * "React 19" and "React 18" become "React", "Tailwind CSS 4" becomes
 * "Tailwind CSS", "Node.js 24 (ESM)" becomes "Node.js", "TypeScript strict"
 * becomes "TypeScript".
 */
export function normaliseTech(raw: string): string {
  let name = raw.replace(/\s*\([^)]*\)/g, "").trim();
  name = name.replace(/\s+strict$/i, "");
  name = name.replace(/\s+v?\d+(\.\d+)*$/i, "");
  name = name.replace(/\s+/g, " ").trim();
  return ALIASES[name] ?? name;
}

/** Counts in how many projects each technology appears, most used first. */
export function countTechnologies(projects: readonly StackSource[]): Technology[] {
  const map = new Map<string, Technology>();
  for (const project of projects) {
    const seen = new Set<string>();
    for (const raw of project.stack) {
      const name = normaliseTech(raw);
      if (!name || seen.has(name)) continue;
      seen.add(name);
      const entry = map.get(name) ?? { name, count: 0, projects: [] };
      entry.count += 1;
      entry.projects.push(project.name);
      map.set(name, entry);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Disc radius in world units for a technology used in `count` projects. */
export function radiusFor(count: number): number {
  return 0.5 + 0.14 * (count - 1);
}

/**
 * Pixels per world unit so the discs fill about `fill` of the container
 * area, which keeps the jar equally full on a phone and on a wide screen.
 */
export function scaleFor(cssWidth: number, cssHeight: number, radii: readonly number[], fill = 0.36): number {
  const discArea = radii.reduce((sum, r) => sum + Math.PI * r * r, 0) || 1;
  return Math.sqrt((fill * cssWidth * cssHeight) / discArea);
}

/** Label layout inside a disc: lines and font size as a share of the radius. */
export interface LabelFit {
  lines: string[];
  size: number;
}

/**
 * Splits a label into one to three lines at spaces, hyphens, dots and plus
 * signs, picking the split that allows the largest type inside a disc of
 * radius 1 (with room for the small count line below). `measure` returns
 * the width of a string at font size 1.
 */
export function fitLabel(name: string, measure: (text: string) => number): LabelFit {
  const parts = name.match(/[^\s\-.+]+[\s\-.+]*/g) ?? [name];
  const sizeFor = (lines: string[]) => {
    const widest = Math.max(...lines.map((l) => measure(l.trim()))) || 1;
    return Math.min(1.56 / widest, 1.2 / (lines.length * 1.08 + 0.7), 0.46);
  };
  let best: LabelFit = { lines: [name], size: sizeFor([name]) };
  const consider = (lines: string[]) => {
    const size = sizeFor(lines);
    if (size > best.size * 1.04) best = { lines: lines.map((l) => l.trim()), size };
  };
  for (let i = 1; i < parts.length; i++) {
    consider([parts.slice(0, i).join(""), parts.slice(i).join("")]);
  }
  for (let i = 1; i < parts.length - 1; i++) {
    for (let k = i + 1; k < parts.length; k++) {
      consider([parts.slice(0, i).join(""), parts.slice(i, k).join(""), parts.slice(k).join("")]);
    }
  }
  return best;
}
