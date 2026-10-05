/**
 * Letters with mass: pure maths for experiment 05. Each letter has a weight,
 * optical size, skew, sideways stretch and vertical scale that ease toward
 * targets set by cursor proximity, cursor speed and scroll velocity.
 */

export interface LetterState {
  wght: number;
  opsz: number;
  skew: number;
  tx: number;
  sx: number;
  sy: number;
}

export interface LetterInput {
  /** Letter centre minus pointer, in px. */
  dx: number;
  dy: number;
  inside: boolean;
  radius: number;
  /** Pointer velocity in px per ms. */
  vx: number;
  vy: number;
  /** Scroll velocity in px per ms. */
  scrollV: number;
  index: number;
}

export const REST: LetterState = { wght: 400, opsz: 96, skew: 0, tx: 0, sx: 1, sy: 1 };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function letterTargets(input: LetterInput): LetterState {
  const d2 = input.dx * input.dx + input.dy * input.dy;
  const near = input.inside ? Math.exp(-d2 / (input.radius * input.radius)) : 0;
  const speed = clamp(Math.hypot(input.vx, input.vy) / 2.2, 0, 1);
  const dir = Math.sign(input.vx);
  const away = Math.sign(input.dx) || 0;
  const scroll = clamp(Math.abs(input.scrollV) * 0.22, 0, 0.32);
  const wave = 0.65 + 0.35 * Math.sin(input.index * 0.8);
  return {
    wght: 400 + 500 * near,
    opsz: clamp(96 - 70 * near, 6, 96),
    skew: -16 * speed * near * dir,
    tx: 22 * speed * near * away,
    sx: 1 + 0.16 * speed * near,
    sy: 1 + scroll * wave,
  };
}

/**
 * Exponential ease toward the target (frame-rate independent). Returns true
 * while the letter is still visibly moving.
 */
export function settle(s: LetterState, target: LetterState, dt: number): boolean {
  const kSlow = 1 - Math.exp(-dt / 0.16);
  const kFast = 1 - Math.exp(-dt / 0.09);
  s.wght += (target.wght - s.wght) * kSlow;
  s.opsz += (target.opsz - s.opsz) * kSlow;
  s.skew += (target.skew - s.skew) * kFast;
  s.tx += (target.tx - s.tx) * kFast;
  s.sx += (target.sx - s.sx) * kFast;
  s.sy += (target.sy - s.sy) * kFast;
  return (
    Math.abs(target.wght - s.wght) > 0.5 ||
    Math.abs(target.opsz - s.opsz) > 0.2 ||
    Math.abs(target.skew - s.skew) > 0.02 ||
    Math.abs(target.tx - s.tx) > 0.05 ||
    Math.abs(target.sx - s.sx) > 0.001 ||
    Math.abs(target.sy - s.sy) > 0.001
  );
}
