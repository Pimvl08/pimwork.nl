/**
 * The hero camera, shared by the WebGL renderer and the static SVG
 * silhouette that stands in while WebGL loads, so both draw the exact same
 * outline. Pure math (column-major 4x4 matrices), no DOM.
 */
import { creaseLine, defaultCrease, foldPoint, type CreaseParams } from "@/lib/crease";
import { REST_FOLD } from "./logic";

export type Vec3 = [number, number, number];

/** Width / height of the shell stage. CSS uses the same ratio. */
export const STAGE_ASPECT = 10 / 9;

export const heroCamera = {
  /** Looking down at about 35 degrees. */
  elevation: (35 * Math.PI) / 180,
  /** Rotation around the vertical axis: a three-quarter view into the shell. */
  azimuth: (40 * Math.PI) / 180,
  distance: 3.9,
  target: [-0.16, -0.11, 0.12] as Vec3,
  fovY: (30 * Math.PI) / 180,
  near: 0.1,
  far: 30,
};

/** The pose of the shell at rest, as drawn by the silhouette. */
export const restParams: CreaseParams = { ...defaultCrease, fold: REST_FOLD };

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const normalize = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export function cameraEye(cam = heroCamera): Vec3 {
  const ce = Math.cos(cam.elevation);
  return [
    cam.target[0] + cam.distance * ce * Math.sin(cam.azimuth),
    cam.target[1] - cam.distance * ce * Math.cos(cam.azimuth),
    cam.target[2] + cam.distance * Math.sin(cam.elevation),
  ];
}

export function lookAt(eye: Vec3, target: Vec3, up: Vec3 = [0, 0, 1]): Float32Array {
  const f = normalize(sub(target, eye));
  const s = normalize(cross(f, up));
  const u = cross(s, f);
  return new Float32Array([
    s[0], u[0], -f[0], 0,
    s[1], u[1], -f[1], 0,
    s[2], u[2], -f[2], 0,
    -dot(s, eye), -dot(u, eye), dot(f, eye), 1,
  ]);
}

export function perspective(fovY: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

/** a * b for column-major 4x4 matrices. */
export function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

export interface ViewSetup {
  matrix: Float32Array;
  eye: Vec3;
  /** Light direction (towards the light): from the top-left of the view. */
  light: Vec3;
}

export function viewSetup(aspect: number, cam = heroCamera): ViewSetup {
  const eye = cameraEye(cam);
  const matrix = multiply(perspective(cam.fovY, aspect, cam.near, cam.far), lookAt(eye, cam.target));
  const forward = normalize(sub(cam.target, eye));
  const right = normalize(cross(forward, [0, 0, 1]));
  const back: Vec3 = [-forward[0], -forward[1], -forward[2]];
  const light = normalize([
    -0.55 * right[0] + 0.3 * back[0],
    -0.55 * right[1] + 0.3 * back[1],
    -0.55 * right[2] + 0.3 * back[2] + 0.95,
  ]);
  return { matrix, eye, light };
}

/** Projects a world point to normalised device coordinates. */
export function project(m: Float32Array, x: number, y: number, z: number): [number, number] {
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
  const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
  return [cx / cw, cy / cw];
}

export interface Silhouette {
  viewBox: string;
  /** The folded rim of the disc. */
  rim: string;
  /** The crease arc. */
  crease: string;
}

/**
 * Outline of the shell at rest, in an SVG box of 1000 x (1000 / aspect).
 * Rendered by the server so the stage is never an empty hole.
 */
export function shellSilhouette(aspect = STAGE_ASPECT, params: CreaseParams = restParams, samples = 120): Silhouette {
  const { matrix } = viewSetup(aspect);
  const w = 1000;
  const h = Math.round(1000 / aspect);
  const toSvg = (x: number, y: number, z: number) => {
    const [nx, ny] = project(matrix, x, y, z);
    return `${(((nx + 1) / 2) * w).toFixed(1)} ${(((1 - ny) / 2) * h).toFixed(1)}`;
  };
  const rimPoints: string[] = [];
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    const [x, y, z] = foldPoint(Math.cos(a), Math.sin(a), params);
    rimPoints.push(toSvg(x, y, z));
  }
  const line = creaseLine(params, 48);
  const creasePoints: string[] = [];
  for (let i = 0; i < line.length; i += 3) creasePoints.push(toSvg(line[i], line[i + 1], line[i + 2]));
  return {
    viewBox: `0 0 ${w} ${h}`,
    rim: `M${rimPoints.join(" L")} Z`,
    crease: creasePoints.length > 1 ? `M${creasePoints.join(" L")}` : "",
  };
}
