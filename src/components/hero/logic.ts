/**
 * Pure helpers for the cover plate: the damped spring that drives the shell,
 * phrase cycling and pointer mapping. No DOM, so they are
 * unit tested in tests/unit/hero.test.ts.
 */

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** The rest pose of the hero shell (matches the static SVG silhouette). */
export const REST_FOLD = 0.72;
export const FOLD_RANGE: readonly [number, number] = [0.25, 1];
export const TWIST_RANGE: readonly [number, number] = [-0.35, 0.35];

export interface SpringState {
  x: number;
  v: number;
}

/**
 * Exact step of a critically damped spring (no overshoot, stable for any dt).
 * x(t) = target + (c1 + c2 t) e^(-wt), with c1 = x0 - target, c2 = v0 + w c1.
 */
export function springStep(state: SpringState, target: number, omega: number, dt: number): SpringState {
  if (dt <= 0) return { x: state.x, v: state.v };
  const c1 = state.x - target;
  const c2 = state.v + omega * c1;
  const decay = Math.exp(-omega * dt);
  const x = target + (c1 + c2 * dt) * decay;
  const v = (c2 - omega * (c1 + c2 * dt)) * decay;
  return { x, v };
}

/** True once a spring is close enough to its target to stop animating. */
export function springSettled(state: SpringState, target: number, epsilon = 1e-3): boolean {
  return Math.abs(state.x - target) < epsilon && Math.abs(state.v) < epsilon;
}

/** Next (or previous) phrase index, wrapping around. */
export function nextIndex(index: number, length: number, direction: 1 | -1 = 1): number {
  if (length <= 0) return 0;
  return (((index + direction) % length) + length) % length;
}

/**
 * Maps a pointer position inside the cover (0..1 on both axes) to the shell
 * pose: x sets the fold, y sets the twist of the crease.
 */
export function pointerToPose(nx: number, ny: number): { fold: number; twist: number } {
  const x = clamp(nx, 0, 1);
  const y = clamp(ny, 0, 1);
  return {
    fold: FOLD_RANGE[0] + (FOLD_RANGE[1] - FOLD_RANGE[0]) * x,
    twist: TWIST_RANGE[0] + (TWIST_RANGE[1] - TWIST_RANGE[0]) * y,
  };
}

/** Rebuild the mesh only when a parameter moved more than `epsilon`. */
export function needsRebuild(
  previous: { fold: number; twist: number } | null,
  next: { fold: number; twist: number },
  epsilon = 0.002,
): boolean {
  if (!previous) return true;
  return Math.abs(previous.fold - next.fold) > epsilon || Math.abs(previous.twist - next.twist) > epsilon;
}

/** Relative luminance of an "r g b" 0..1 triple (sRGB, approximate). */
export function luminance([r, g, b]: readonly [number, number, number]): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The crease line must read against the sheet in both themes: by night the
 * sheet is chalk and the ink is chalk too, so the line falls back to graphite.
 */
export function creaseLineColor(
  sheet: readonly [number, number, number],
  ink: readonly [number, number, number],
  paper: readonly [number, number, number],
): [number, number, number] {
  const s = luminance(sheet);
  if (Math.abs(luminance(ink) - s) >= Math.abs(luminance(paper) - s)) return [ink[0], ink[1], ink[2]];
  // Graphite, nudged a little towards the sheet so it reads as a pressed line, not a cut.
  return [paper[0] * 0.8 + sheet[0] * 0.2, paper[1] * 0.8 + sheet[1] * 0.2, paper[2] * 0.8 + sheet[2] * 0.2];
}
