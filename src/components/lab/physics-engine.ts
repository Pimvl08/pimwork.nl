/**
 * A small 2D physics engine for the "Stapel" lab experiment.
 * Pure TypeScript, no DOM, so it is unit tested.
 *
 * Model: paper discs (circles) with mass from area, semi-implicit Euler on a
 * fixed timestep (1/120 s through an accumulator), sequential impulses for
 * circle-circle and circle-container contacts (restitution, Coulomb friction
 * with spin), positional correction against sinking, and sleeping bodies.
 *
 * Coordinates: y points down (canvas style). The container is the
 * intersection of a vertical strip (two walls), a lid at y = 0 and a large
 * circle whose lower arc is the floor: the world's compass arc as a bowl.
 */

export interface Vec {
  x: number;
  y: number;
}

export interface Body {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Rotation in radians, only used to draw the spin. */
  angle: number;
  /** Angular velocity in rad/s. */
  av: number;
  r: number;
  mass: number;
  invMass: number;
  invInertia: number;
  sleeping: boolean;
  /** Seconds this body has been slow enough to fall asleep. */
  still: number;
}

export interface Bowl {
  /** Centre of the floor circle. */
  cx: number;
  cy: number;
  /** Radius of the floor circle. */
  R: number;
}

export interface World {
  width: number;
  height: number;
  bowl: Bowl;
  gravity: Vec;
  bodies: Body[];
  /** Leftover simulated time between fixed steps. */
  accumulator: number;
  /** Pointer drag through a spring: body id and target point. */
  drag: { id: number; x: number; y: number } | null;
}

export const FIXED_DT = 1 / 120;
export const GRAVITY = 9.8;
const RESTITUTION = 0.22;
/** Below this approach speed contacts do not bounce, which stops jitter. */
const BOUNCE_THRESHOLD = 0.6;
const FRICTION = 0.45;
const ITERATIONS = 6;
const SLOP = 0.002;
const CORRECTION = 0.7;
const LINEAR_DAMPING = 0.08;
const ANGULAR_DAMPING = 0.6;
const SLEEP_SPEED = 0.06;
const SLEEP_TIME = 0.6;
const WAKE_SPEED = 0.4;
const MAX_SPEED = 30;
const MAX_STEPS = 8;
/** Drag spring: angular frequency and damping ratio (critically damped). */
const DRAG_OMEGA = 26;
const DRAG_ZETA = 1;

/** Depth of the bowl arc as a share of the width. */
const BOWL_DEPTH = 0.16;

export function makeBowl(width: number, height: number): Bowl {
  const depth = Math.min(BOWL_DEPTH * width, height * 0.35);
  // The arc passes through both wall feet (0, h - depth), (w, h - depth)
  // and touches the bottom edge in the middle.
  const R = ((width * width) / 4 + depth * depth) / (2 * depth);
  return { cx: width / 2, cy: height - R, R };
}

export function createBody(id: number, x: number, y: number, r: number): Body {
  const mass = Math.PI * r * r;
  const inertia = 0.5 * mass * r * r;
  return { id, x, y, vx: 0, vy: 0, angle: 0, av: 0, r, mass, invMass: 1 / mass, invInertia: 1 / inertia, sleeping: false, still: 0 };
}

export function createWorld(width: number, height: number, bodies: Body[] = []): World {
  return { width, height, bowl: makeBowl(width, height), gravity: { x: 0, y: GRAVITY }, bodies, accumulator: 0, drag: null };
}

/** Changes the container size and pulls every body back inside. */
export function resizeWorld(world: World, width: number, height: number): void {
  world.width = width;
  world.height = height;
  world.bowl = makeBowl(width, height);
  for (const b of world.bodies) {
    clampInside(world, b);
    wake(b);
  }
}

export function wake(body: Body): void {
  body.sleeping = false;
  body.still = 0;
}

export function wakeAll(world: World): void {
  for (const b of world.bodies) wake(b);
}

export function allSleeping(world: World): boolean {
  return world.bodies.every((b) => b.sleeping);
}

/**
 * Places bodies in rows under the lid, in array order, without overlap, so
 * they rain down into the bowl. Deterministic for a given seed.
 */
export function layoutBodies(world: World, seed = 1): void {
  let s = seed >>> 0 || 1;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const gap = 0.02;
  let x = 0;
  let top = 0;
  let row: Body[] = [];
  let rowHeight = 0;
  const flush = () => {
    // Centre the row horizontally and hang it from `top`.
    const used = x;
    const offset = Math.max(0, (world.width - used) / 2) * rand();
    for (const b of row) {
      b.x += offset;
      b.y = top + rowHeight / 2;
    }
    top += rowHeight;
    row = [];
    rowHeight = 0;
    x = 0;
  };
  for (const b of world.bodies) {
    const d = b.r * 2 + gap;
    if (x + d > world.width && row.length > 0) flush();
    b.x = x + b.r + gap / 2;
    b.vx = (rand() - 0.5) * 0.6;
    b.vy = 0;
    b.angle = rand() * Math.PI * 2;
    b.av = 0;
    wake(b);
    row.push(b);
    x += d;
    rowHeight = Math.max(rowHeight, d);
  }
  if (row.length > 0) flush();
  for (const b of world.bodies) clampInside(world, b);
}

/** Hard clamp used after a resize: walls, lid and floor circle. */
function clampInside(world: World, b: Body): void {
  b.x = Math.min(world.width - b.r, Math.max(b.r, b.x));
  b.y = Math.max(b.r, b.y);
  const { cx, cy, R } = world.bowl;
  const dx = b.x - cx;
  const dy = b.y - cy;
  const dist = Math.hypot(dx, dy);
  const limit = R - b.r;
  if (dist > limit && dist > 0) {
    b.x = cx + (dx / dist) * limit;
    b.y = cy + (dy / dist) * limit;
  }
}

/** Contact against an immovable surface; n points from the surface into the body. */
function resolveStatic(b: Body, nx: number, ny: number, pen: number): void {
  // Positional correction first, so the body never stays inside.
  const push = Math.max(pen - SLOP, 0) * CORRECTION + (pen > SLOP ? SLOP * 0.5 : 0);
  b.x += nx * push;
  b.y += ny * push;

  const vn = b.vx * nx + b.vy * ny;
  if (vn >= 0) return;
  const e = -vn > BOUNCE_THRESHOLD ? RESTITUTION : 0;
  const j = (-(1 + e) * vn) / b.invMass;
  b.vx += nx * j * b.invMass;
  b.vy += ny * j * b.invMass;

  // Friction with spin: the contact point sits at -r * n.
  const tx = -ny;
  const ty = nx;
  const vt = b.vx * tx + b.vy * ty - b.av * b.r;
  const kt = b.invMass + b.r * b.r * b.invInertia;
  let jt = -vt / kt;
  const maxJt = FRICTION * j;
  jt = Math.max(-maxJt, Math.min(maxJt, jt));
  b.vx += tx * jt * b.invMass;
  b.vy += ty * jt * b.invMass;
  b.av -= b.r * jt * b.invInertia;
}

function collideContainer(world: World, b: Body): void {
  if (b.x - b.r < 0) resolveStatic(b, 1, 0, b.r - b.x);
  if (b.x + b.r > world.width) resolveStatic(b, -1, 0, b.x + b.r - world.width);
  if (b.y - b.r < 0) resolveStatic(b, 0, 1, b.r - b.y);
  const { cx, cy, R } = world.bowl;
  const dx = b.x - cx;
  const dy = b.y - cy;
  const dist = Math.hypot(dx, dy);
  const pen = dist + b.r - R;
  if (pen > 0 && dist > 0) resolveStatic(b, -dx / dist, -dy / dist, pen);
}

function collidePair(a: Body, b: Body): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const rr = a.r + b.r;
  const d2 = dx * dx + dy * dy;
  if (d2 >= rr * rr) return;
  if (a.sleeping && b.sleeping) return;
  const dist = Math.sqrt(d2);
  const nx = dist > 1e-9 ? dx / dist : 0;
  const ny = dist > 1e-9 ? dy / dist : 1;
  const pen = rr - dist;

  // Relative velocity of b with respect to a along the normal.
  const rvx = b.vx - a.vx;
  const rvy = b.vy - a.vy;
  const vn = rvx * nx + rvy * ny;

  // A hard hit wakes a sleeping neighbour; a soft touch treats it as static.
  if (a.sleeping && -vn > WAKE_SPEED) wake(a);
  if (b.sleeping && -vn > WAKE_SPEED) wake(b);
  const ia = a.sleeping ? 0 : a.invMass;
  const ib = b.sleeping ? 0 : b.invMass;
  const iia = a.sleeping ? 0 : a.invInertia;
  const iib = b.sleeping ? 0 : b.invInertia;
  const inv = ia + ib;
  if (inv === 0) return;

  const push = (Math.max(pen - SLOP, 0) * CORRECTION) / inv;
  a.x -= nx * push * ia;
  a.y -= ny * push * ia;
  b.x += nx * push * ib;
  b.y += ny * push * ib;

  if (vn >= 0) return;
  const e = -vn > BOUNCE_THRESHOLD ? RESTITUTION : 0;
  const j = (-(1 + e) * vn) / inv;
  a.vx -= nx * j * ia;
  a.vy -= ny * j * ia;
  b.vx += nx * j * ib;
  b.vy += ny * j * ib;

  const tx = -ny;
  const ty = nx;
  const vt = (b.vx - a.vx) * tx + (b.vy - a.vy) * ty - b.av * b.r - a.av * a.r;
  const kt = inv + a.r * a.r * iia + b.r * b.r * iib;
  let jt = -vt / kt;
  const maxJt = FRICTION * j;
  jt = Math.max(-maxJt, Math.min(maxJt, jt));
  a.vx -= tx * jt * ia;
  a.vy -= ty * jt * ia;
  b.vx += tx * jt * ib;
  b.vy += ty * jt * ib;
  a.av -= a.r * jt * iia;
  b.av -= b.r * jt * iib;
}

/** One fixed step of FIXED_DT seconds. */
export function step(world: World, dt = FIXED_DT): void {
  const { bodies, gravity, drag } = world;
  const damp = Math.exp(-LINEAR_DAMPING * dt);
  const spin = Math.exp(-ANGULAR_DAMPING * dt);

  for (const b of bodies) {
    if (b.sleeping) continue;
    if (drag && drag.id === b.id) {
      // Spring towards the pointer, no gravity while held.
      const ax = DRAG_OMEGA * DRAG_OMEGA * (drag.x - b.x) - 2 * DRAG_ZETA * DRAG_OMEGA * b.vx;
      const ay = DRAG_OMEGA * DRAG_OMEGA * (drag.y - b.y) - 2 * DRAG_ZETA * DRAG_OMEGA * b.vy;
      b.vx += ax * dt;
      b.vy += ay * dt;
    } else {
      b.vx += gravity.x * dt;
      b.vy += gravity.y * dt;
    }
    b.vx *= damp;
    b.vy *= damp;
    b.av *= spin;
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > MAX_SPEED) {
      b.vx *= MAX_SPEED / speed;
      b.vy *= MAX_SPEED / speed;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.angle += b.av * dt;
  }

  for (let it = 0; it < ITERATIONS; it++) {
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      for (let k = i + 1; k < bodies.length; k++) collidePair(a, bodies[k]);
    }
    for (const b of bodies) if (!b.sleeping) collideContainer(world, b);
  }

  for (const b of bodies) {
    if (b.sleeping) continue;
    if (drag && drag.id === b.id) {
      b.still = 0;
      continue;
    }
    const slow = Math.hypot(b.vx, b.vy) < SLEEP_SPEED && Math.abs(b.av * b.r) < SLEEP_SPEED;
    b.still = slow ? b.still + dt : 0;
    if (b.still > SLEEP_TIME) {
      b.sleeping = true;
      b.vx = 0;
      b.vy = 0;
      b.av = 0;
    }
  }
}

/**
 * Advances the world by a frame's real time through the fixed-step
 * accumulator. Returns the number of steps taken.
 */
export function advance(world: World, frameSeconds: number): number {
  world.accumulator += Math.min(Math.max(frameSeconds, 0), 0.1);
  let steps = 0;
  while (world.accumulator >= FIXED_DT && steps < MAX_STEPS) {
    step(world);
    world.accumulator -= FIXED_DT;
    steps++;
  }
  if (steps === MAX_STEPS) world.accumulator = 0;
  return steps;
}

/** Runs the simulation until every body sleeps (or the time budget ends). */
export function settle(world: World, maxSeconds = 30): number {
  let t = 0;
  while (t < maxSeconds && !allSleeping(world)) {
    step(world);
    t += FIXED_DT;
  }
  return t;
}

export function bodyAt(world: World, x: number, y: number, slack = 0): Body | null {
  // Last drawn is on top, so search from the end.
  for (let i = world.bodies.length - 1; i >= 0; i--) {
    const b = world.bodies[i];
    const r = b.r + slack;
    if ((b.x - x) ** 2 + (b.y - y) ** 2 <= r * r) return b;
  }
  return null;
}

export function startDrag(world: World, body: Body, x: number, y: number): void {
  world.drag = { id: body.id, x, y };
  wakeAll(world);
}

export function moveDrag(world: World, x: number, y: number): void {
  if (!world.drag) return;
  world.drag.x = Math.min(world.width, Math.max(0, x));
  world.drag.y = Math.min(world.height, Math.max(0, y));
}

/** Releases the held body with the pointer's throw velocity (clamped). */
export function endDrag(world: World, throwVx: number, throwVy: number, maxThrow = 14): void {
  if (!world.drag) return;
  const body = world.bodies.find((b) => b.id === world.drag?.id);
  world.drag = null;
  if (!body) return;
  const speed = Math.hypot(throwVx, throwVy);
  const k = speed > maxThrow ? maxThrow / speed : 1;
  body.vx = throwVx * k;
  body.vy = throwVy * k;
  wakeAll(world);
}

/** Pushes every body near (x, y) outwards. */
export function radialImpulse(world: World, x: number, y: number, radius: number, strength: number): number {
  let hit = 0;
  for (const b of world.bodies) {
    const dx = b.x - x;
    const dy = b.y - y;
    const d = Math.hypot(dx, dy);
    if (d >= radius) continue;
    const falloff = 1 - d / radius;
    const nx = d > 1e-6 ? dx / d : 0;
    const ny = d > 1e-6 ? dy / d : -1;
    b.vx += nx * strength * falloff;
    b.vy += ny * strength * falloff;
    hit++;
  }
  if (hit > 0) wakeAll(world);
  return hit;
}

/** Throws every body against gravity with a little sideways scatter. */
export function shake(world: World, strength = 6, rand: () => number = Math.random): void {
  const g = Math.hypot(world.gravity.x, world.gravity.y) || 1;
  const ux = -world.gravity.x / g;
  const uy = -world.gravity.y / g;
  for (const b of world.bodies) {
    const up = strength * (0.55 + rand() * 0.45);
    const side = (rand() - 0.5) * strength * 0.8;
    b.vx += ux * up - uy * side;
    b.vy += uy * up + ux * side;
    b.av += (rand() - 0.5) * 6;
  }
  wakeAll(world);
}

/** Flips gravity, keeping its tilt. */
export function flipGravity(world: World): void {
  world.gravity = { x: -world.gravity.x, y: -world.gravity.y };
  wakeAll(world);
}

/** Tilts gravity a little towards a direction, keeping its strength. */
export function nudgeGravity(world: World, dx: number, dy: number, amount = 0.35): void {
  const g = Math.hypot(world.gravity.x, world.gravity.y) || GRAVITY;
  const x = world.gravity.x / g + dx * amount;
  const y = world.gravity.y / g + dy * amount;
  const len = Math.hypot(x, y) || 1;
  world.gravity = { x: (x / len) * g, y: (y / len) * g };
  wakeAll(world);
}

/** Kinetic plus potential energy, for tests (potential relative to y = 0). */
export function totalEnergy(world: World): number {
  let e = 0;
  for (const b of world.bodies) {
    const inertia = b.invInertia > 0 ? 1 / b.invInertia : 0;
    e += 0.5 * b.mass * (b.vx * b.vx + b.vy * b.vy) + 0.5 * inertia * b.av * b.av;
    e -= b.mass * (world.gravity.x * b.x + world.gravity.y * b.y);
  }
  return e;
}

/** True when the body lies inside the container, with a small tolerance. */
export function isInside(world: World, b: Body, tolerance = 0.02): boolean {
  if (b.x - b.r < -tolerance || b.x + b.r > world.width + tolerance) return false;
  if (b.y - b.r < -tolerance) return false;
  const { cx, cy, R } = world.bowl;
  return Math.hypot(b.x - cx, b.y - cy) + b.r <= R + tolerance;
}
