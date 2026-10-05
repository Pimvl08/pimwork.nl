/**
 * Pure helpers for the Lab plate: tab navigation, deep links, the arc the
 * tabs sit on and a small seeded random generator shared by the experiments.
 */

export const EXPERIMENT_COUNT = 5;

/** "#lab-03" -> 2. Anything else -> null. */
export function hashToIndex(hash: string): number | null {
  const match = /^#lab-0([1-5])$/.exec(hash.trim());
  return match ? Number(match[1]) - 1 : null;
}

/** 2 -> "lab-03" (the tab id and the deep-link hash without "#"). */
export function indexToAnchor(index: number): string {
  return `lab-0${index + 1}`;
}

/** WAI-ARIA tabs keyboard model with wrap-around. Returns null for other keys. */
export function nextTabIndex(current: number, key: string, count = EXPERIMENT_COUNT): number | null {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (current + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

/**
 * Where tab `index` sits on the arc: a vertical drop (px) and a tilt (deg).
 * The middle tab is the crown of the arc; the outer tabs hang lower.
 */
export function arcPlacement(index: number, count = EXPERIMENT_COUNT, drop = 28, tilt = 5): { y: number; rotate: number } {
  if (count <= 1) return { y: 0, rotate: 0 };
  const u = (2 * index) / (count - 1) - 1; // -1 .. 1
  const y = drop * (1 - Math.sqrt(Math.max(0, 1 - u * u * 0.84)));
  return { y: Math.round(y * 100) / 100, rotate: Math.round(tilt * u * 100) / 100 };
}

/** mulberry32: tiny, fast, deterministic PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Reads a theme colour token at runtime (canvas 2D). */
export function cssVar(name: string, fallback = "#000"): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
