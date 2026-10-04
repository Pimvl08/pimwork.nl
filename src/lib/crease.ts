/**
 * Curved-crease shell geometry, shared by the hero (raw WebGL) and the 3D
 * lab experiment (three.js). Pure math, no DOM, so it is unit tested.
 *
 * Model: a unit disc lies on the ground plane (x, y; z is up). One circular
 * crease arc (centre C, radius R) crosses the disc. The part on the far side
 * of the crease is the flap. Every flap point is carried around the crease:
 * it keeps its distance d to the crease (paper does not stretch across the
 * fold) and rises by an angle that is largest mid-crease and fades towards the
 * crease ends, so the flap bends into a curved, rigid-looking shell instead of
 * a flat hinge. A small curl term rolls the outer edge further up.
 */

export interface CreaseParams {
  /** 0 = flat sheet, 1 = fully raised shell. */
  fold: number;
  /** Maximum lift angle in radians at fold = 1. */
  maxAngle: number;
  /** Crease circle centre in disc coordinates (outside the disc). */
  center: readonly [number, number];
  /** Crease circle radius. */
  radius: number;
  /** Extra roll towards the outer edge, 0..1. */
  curl: number;
  /** 1 lifts the flap upwards, -1 lifts the other side (inverted fold). */
  side: 1 | -1;
  /** Rotates the crease around the disc centre, in radians. */
  twist: number;
}

export const defaultCrease: CreaseParams = {
  fold: 0.72,
  maxAngle: 2.35,
  center: [-1.55, -1.2],
  radius: 2.05,
  curl: 0.38,
  side: 1,
  twist: 0,
};

export interface ShellMesh {
  /** xyz per vertex. */
  positions: Float32Array;
  /** Unit normal per vertex. */
  normals: Float32Array;
  /** Original flat disc coordinates (u, v) per vertex, for texturing. */
  flat: Float32Array;
  /** Signed distance to the crease per vertex (> 0 on the flap). */
  creaseDistance: Float32Array;
  indices: Uint16Array | Uint32Array;
  vertexCount: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

function rotate(x: number, y: number, angle: number): [number, number] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x * c - y * s, x * s + y * c];
}

/**
 * Maps one flat disc point to its folded 3D position.
 * Returns [x, y, z, signedCreaseDistance].
 */
export function foldPoint(u: number, v: number, p: CreaseParams): [number, number, number, number] {
  const [cx, cy] = rotate(p.center[0], p.center[1], p.twist);
  const dx = u - cx;
  const dy = v - cy;
  const dist = Math.hypot(dx, dy) || 1e-6;
  // Signed distance: positive beyond the crease (flap), negative on the base.
  const signed = (dist - p.radius) * p.side;
  if (signed <= 0) return [u, v, 0, signed];

  const nx = dx / dist;
  const ny = dy / dist;
  const qx = cx + nx * p.radius;
  const qy = cy + ny * p.radius;

  // Position along the crease: angle of the point around the crease centre,
  // relative to the direction of the disc centre. 0 = mid-crease.
  const toDisc = Math.atan2(-cy, -cx);
  let along = Math.atan2(dy, dx) - toDisc;
  along = Math.atan2(Math.sin(along), Math.cos(along));
  // Half-angle of the crease segment that lies inside the disc.
  const span = Math.asin(clamp(1 / Math.max(p.radius, 1e-3), 0, 1)) + 0.35;
  const centrality = 1 - smoothstep(0, span, Math.abs(along));

  const d = signed;
  const lift = clamp(p.fold, 0, 1) * p.maxAngle * (0.35 + 0.65 * centrality) * (1 + p.curl * d * 1.6);
  const angle = Math.min(lift, Math.PI * 0.98);

  // The flap direction on the ground is the outward normal of the crease
  // (towards the flap side).
  const ox = nx * p.side;
  const oy = ny * p.side;
  const ground = d * Math.cos(angle);
  const height = d * Math.sin(angle);
  return [qx + ox * ground, qy + oy * ground, height, signed];
}

/**
 * Builds the folded disc as an indexed triangle mesh on a polar grid.
 * `rings` x `segments` vertices plus one centre vertex.
 */
export function buildShell(params: CreaseParams, rings = 48, segments = 160): ShellMesh {
  const vertexCount = 1 + rings * segments;
  const positions = new Float32Array(vertexCount * 3);
  const flat = new Float32Array(vertexCount * 2);
  const creaseDistance = new Float32Array(vertexCount);

  const write = (index: number, u: number, v: number) => {
    const [x, y, z, s] = foldPoint(u, v, params);
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
    flat[index * 2] = u;
    flat[index * 2 + 1] = v;
    creaseDistance[index] = s;
  };

  write(0, 0, 0);
  for (let r = 0; r < rings; r++) {
    const radius = (r + 1) / rings;
    for (let s = 0; s < segments; s++) {
      const theta = (s / segments) * Math.PI * 2;
      write(1 + r * segments + s, Math.cos(theta) * radius, Math.sin(theta) * radius);
    }
  }

  const triangleCount = segments + (rings - 1) * segments * 2;
  const indices = vertexCount > 65535 ? new Uint32Array(triangleCount * 3) : new Uint16Array(triangleCount * 3);
  let i = 0;
  for (let s = 0; s < segments; s++) {
    const a = 1 + s;
    const b = 1 + ((s + 1) % segments);
    indices[i++] = 0;
    indices[i++] = a;
    indices[i++] = b;
  }
  for (let r = 0; r < rings - 1; r++) {
    for (let s = 0; s < segments; s++) {
      const a = 1 + r * segments + s;
      const b = 1 + r * segments + ((s + 1) % segments);
      const c = 1 + (r + 1) * segments + s;
      const d = 1 + (r + 1) * segments + ((s + 1) % segments);
      indices[i++] = a;
      indices[i++] = c;
      indices[i++] = b;
      indices[i++] = b;
      indices[i++] = c;
      indices[i++] = d;
    }
  }

  const normals = computeNormals(positions, indices, vertexCount);
  return { positions, normals, flat, creaseDistance, indices, vertexCount };
}

/** Area-weighted vertex normals, oriented to point upwards (z >= 0) on average. */
export function computeNormals(positions: Float32Array, indices: ArrayLike<number>, vertexCount: number): Float32Array {
  const normals = new Float32Array(vertexCount * 3);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3;
    const b = indices[i + 1] * 3;
    const c = indices[i + 2] * 3;
    const abx = positions[b] - positions[a];
    const aby = positions[b + 1] - positions[a + 1];
    const abz = positions[b + 2] - positions[a + 2];
    const acx = positions[c] - positions[a];
    const acy = positions[c + 1] - positions[a + 1];
    const acz = positions[c + 2] - positions[a + 2];
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    for (const v of [a, b, c]) {
      normals[v] += nx;
      normals[v + 1] += ny;
      normals[v + 2] += nz;
    }
  }
  for (let v = 0; v < vertexCount; v++) {
    const x = normals[v * 3];
    const y = normals[v * 3 + 1];
    const z = normals[v * 3 + 2];
    const length = Math.hypot(x, y, z) || 1;
    normals[v * 3] = x / length;
    normals[v * 3 + 1] = y / length;
    normals[v * 3 + 2] = z / length;
  }
  return normals;
}

/** Points along the crease arc inside the disc, for drawing the crease line. */
export function creaseLine(params: CreaseParams, samples = 96): Float32Array {
  const [cx, cy] = rotate(params.center[0], params.center[1], params.twist);
  const toDisc = Math.atan2(-cy, -cx);
  const span = Math.asin(clamp(1 / Math.max(params.radius, 1e-3), 0, 1)) * 1.6;
  const points: number[] = [];
  for (let i = 0; i < samples; i++) {
    const a = toDisc - span + (2 * span * i) / (samples - 1);
    const x = cx + Math.cos(a) * params.radius;
    const y = cy + Math.sin(a) * params.radius;
    if (x * x + y * y <= 1.0001) points.push(x, y, 0);
  }
  return new Float32Array(points);
}

/** Linear blend between two parameter sets, used to animate between states. */
export function mixCrease(a: CreaseParams, b: CreaseParams, t: number): CreaseParams {
  const k = clamp(t, 0, 1);
  const lerp = (x: number, y: number) => x + (y - x) * k;
  return {
    fold: lerp(a.fold, b.fold),
    maxAngle: lerp(a.maxAngle, b.maxAngle),
    center: [lerp(a.center[0], b.center[0]), lerp(a.center[1], b.center[1])],
    radius: lerp(a.radius, b.radius),
    curl: lerp(a.curl, b.curl),
    side: k < 0.5 ? a.side : b.side,
    twist: lerp(a.twist, b.twist),
  };
}

/** Named states for the lab: flat, curving, stable, buckled, reversed. */
export const creaseStates: Record<"flat" | "curving" | "stable" | "buckled" | "reversed", CreaseParams> = {
  flat: { ...defaultCrease, fold: 0 },
  curving: { ...defaultCrease, fold: 0.38, curl: 0.2 },
  stable: { ...defaultCrease },
  buckled: { ...defaultCrease, fold: 0.95, curl: 0.85, radius: 1.85 },
  reversed: { ...defaultCrease, side: -1, fold: 0.6 },
};
