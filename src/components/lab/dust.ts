/**
 * Graphite dust: pure particle logic for experiment 01. No DOM here, so the
 * sampling, sanitising and the spring step are unit-testable.
 */

export const MAX_WORD = 8;

/** Keeps letters and digits only (any script), at most 8 characters. */
export function sanitizeWord(raw: string): string {
  const cleaned = raw.normalize("NFC").replace(/[^\p{L}\p{N}]/gu, "");
  return Array.from(cleaned).slice(0, MAX_WORD).join("");
}

/** Fewer particles on small screens, touch devices and low DPR. */
export function particleCount(width: number, height: number, dpr: number, coarse: boolean): number {
  const area = width * height;
  let n = Math.round(area / 90);
  if (coarse || width < 640) n = Math.min(n, 5000);
  if (dpr < 1.5) n = Math.min(n, 7000);
  return Math.max(5000, Math.min(9000, n));
}

/**
 * Picks `count` target points from an RGBA bitmap where the text is drawn
 * (alpha above 128). Returns interleaved x,y in bitmap pixels, with a little
 * jitter so repeated picks do not stack exactly.
 */
export function sampleTargets(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  count: number,
  rng: () => number,
  step = 2,
): Float32Array {
  const candidates: number[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (rgba[(y * width + x) * 4 + 3] > 128) candidates.push(x, y);
    }
  }
  const out = new Float32Array(count * 2);
  const pairs = candidates.length / 2;
  if (pairs === 0) {
    for (let i = 0; i < count; i++) {
      out[i * 2] = width / 2 + (rng() - 0.5) * 4;
      out[i * 2 + 1] = height / 2 + (rng() - 0.5) * 4;
    }
    return out;
  }
  for (let i = 0; i < count; i++) {
    const k = Math.floor(rng() * pairs) * 2;
    out[i * 2] = candidates[k] + (rng() - 0.5) * step;
    out[i * 2 + 1] = candidates[k + 1] + (rng() - 0.5) * step;
  }
  return out;
}

export interface DustState {
  n: number;
  px: Float32Array;
  py: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  tx: Float32Array;
  ty: Float32Array;
}

export function createDust(n: number, width: number, height: number, rng: () => number): DustState {
  const s: DustState = {
    n,
    px: new Float32Array(n),
    py: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    tx: new Float32Array(n),
    ty: new Float32Array(n),
  };
  for (let i = 0; i < n; i++) {
    s.px[i] = rng() * width;
    s.py[i] = rng() * height;
  }
  return s;
}

/** Copies interleaved targets in, optionally snapping positions there too. */
export function setTargets(s: DustState, targets: Float32Array, snap: boolean): void {
  for (let i = 0; i < s.n; i++) {
    s.tx[i] = targets[i * 2];
    s.ty[i] = targets[i * 2 + 1];
    if (snap) {
      s.px[i] = s.tx[i];
      s.py[i] = s.ty[i];
      s.vx[i] = 0;
      s.vy[i] = 0;
    }
  }
}

export interface Pointer {
  x: number;
  y: number;
  inside: boolean;
  /** Pressed long enough to gather the dust. */
  holding: boolean;
}

export interface Wave {
  x: number;
  y: number;
  /** Seconds since the click. */
  age: number;
}

export const DUST = {
  stiffness: 38,
  damping: 7.5,
  repelRadius: 90,
  repelForce: 5200,
  gatherForce: 46,
  waveSpeed: 900,
  waveWidth: 60,
  waveForce: 2600,
  waveLife: 1.1,
};

/**
 * One semi-implicit Euler step. Particles spring to their letter targets with
 * damping; the pointer repels in a soft radius, holding gathers them, and
 * each live wave kicks particles near its ring outward.
 */
export function stepDust(s: DustState, pointer: Pointer, waves: Wave[], dt: number, scale = 1): void {
  const k = DUST.stiffness;
  const c = DUST.damping;
  const rr = DUST.repelRadius * scale;
  const rr2 = rr * rr;
  for (let i = 0; i < s.n; i++) {
    let ax = (s.tx[i] - s.px[i]) * k;
    let ay = (s.ty[i] - s.py[i]) * k;
    if (pointer.inside) {
      const dx = s.px[i] - pointer.x;
      const dy = s.py[i] - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (pointer.holding) {
        ax = -dx * DUST.gatherForce * 0.9 + (s.tx[i] - s.px[i]) * k * 0.08;
        ay = -dy * DUST.gatherForce * 0.9 + (s.ty[i] - s.py[i]) * k * 0.08;
      } else if (d2 < rr2 && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const f = (1 - d / rr) ** 2 * DUST.repelForce;
        ax += (dx / d) * f;
        ay += (dy / d) * f;
      }
    }
    for (let w = 0; w < waves.length; w++) {
      const wave = waves[w];
      const dx = s.px[i] - wave.x;
      const dy = s.py[i] - wave.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const ring = wave.age * DUST.waveSpeed * scale;
      const off = Math.abs(d - ring);
      const width = DUST.waveWidth * scale;
      if (off < width) {
        const f = (1 - off / width) * (1 - wave.age / DUST.waveLife) * DUST.waveForce;
        ax += (dx / d) * f;
        ay += (dy / d) * f;
      }
    }
    s.vx[i] = (s.vx[i] + ax * dt) * Math.exp(-c * dt);
    s.vy[i] = (s.vy[i] + ay * dt) * Math.exp(-c * dt);
    s.px[i] += s.vx[i] * dt;
    s.py[i] += s.vy[i] * dt;
  }
}

/** Ages waves and drops the spent ones. */
export function ageWaves(waves: Wave[], dt: number): Wave[] {
  return waves.map((w) => ({ ...w, age: w.age + dt })).filter((w) => w.age < DUST.waveLife);
}
