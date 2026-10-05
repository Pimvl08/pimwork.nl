/**
 * Raw WebGL renderer for the hero shell (WebGL2, falls back to WebGL1).
 * Draws a soft contact shadow on the ground, then the folded paper disc (a
 * mesh that follows the crease, see buildCreaseMesh) with
 * wrap lighting, graphite shading on the curved flap, faint fibres and a
 * crisp crease line. No three.js: this ships in the first viewport.
 */
import { buildShell, computeNormals, foldPoint, type CreaseParams, type ShellMesh } from "@/lib/crease";
import { restParams, viewSetup, type Vec3, type ViewSetup } from "./camera";
import { creaseLineColor, needsRebuild } from "./logic";

type GL = WebGLRenderingContext | WebGL2RenderingContext;
type RGB = [number, number, number];

export interface ShellColors {
  sheet: RGB;
  ink: RGB;
  paper: RGB;
}

export interface ShellRenderer {
  /** Updates the pose; rebuilds the mesh only for meaningful changes. */
  setParams(params: CreaseParams): void;
  setColors(colors: ShellColors): void;
  /** Sizes the drawing buffer to the canvas box (device pixels, capped). */
  resize(): void;
  /** Draws if anything changed since the last frame (or when forced). */
  render(force?: boolean): void;
  /** Re-creates GPU resources after webglcontextrestored. */
  restore(): boolean;
  dispose(): void;
}

const COLUMNS = 160;
const BASE_ROWS = 20;
const FLAP_ROWS = 32;
const DPR_CAP = 1.75;

/**
 * The folded disc as a mesh that follows the crease instead of a polar grid.
 * Columns are rays from the crease centre, rows are arcs concentric with the
 * crease, and one row lies exactly on the crease. A polar grid cuts the crease
 * diagonally, so the fold happens along a zigzag of triangle edges, which
 * shows as a serrated edge where the crease meets the rim (the shell's lower
 * tip). Here the fold is exact, and a column sits on each crease end.
 */
export function buildCreaseMesh(p: CreaseParams, columns = COLUMNS, baseRows = BASE_ROWS, flapRows = FLAP_ROWS): ShellMesh {
  const cos = Math.cos(p.twist);
  const sin = Math.sin(p.twist);
  const cx = p.center[0] * cos - p.center[1] * sin;
  const cy = p.center[0] * sin + p.center[1] * cos;
  const D = Math.hypot(cx, cy);
  // The parametrisation needs the crease centre outside the disc (always true for the hero).
  if (D <= 1.0001) return buildShell(p, 48, 160);

  const toDisc = Math.atan2(-cy, -cx);
  const alpha = Math.asin(1 / D);
  const deltas: number[] = [];
  for (let j = 0; j <= columns; j++) deltas.push(-alpha + (2 * alpha * j) / columns);
  // Snap the nearest column onto each end of the crease, where it meets the rim.
  const cosEnd = (p.radius * p.radius + D * D - 1) / (2 * p.radius * D);
  if (Math.abs(cosEnd) < 1) {
    const end = Math.acos(cosEnd);
    for (const target of [-end, end]) {
      const j = Math.round(((target + alpha) / (2 * alpha)) * columns);
      if (j > 0 && j < columns) deltas[j] = target;
    }
  }

  const rows = baseRows + flapRows + 1;
  const vertexCount = (columns + 1) * rows;
  const positions = new Float32Array(vertexCount * 3);
  const flat = new Float32Array(vertexCount * 2);
  const creaseDistance = new Float32Array(vertexCount);
  let v = 0;
  for (const delta of deltas) {
    const ex = Math.cos(toDisc + delta);
    const ey = Math.sin(toDisc + delta);
    // The ray from the crease centre enters and leaves the unit disc at rho1, rho2.
    const along = D * Math.cos(delta);
    const half = Math.sqrt(Math.max(0, 1 - D * D * Math.sin(delta) ** 2));
    const rho1 = along - half;
    const rho2 = along + half;
    const mid = Math.min(rho2, Math.max(rho1, p.radius));
    for (let i = 0; i < rows; i++) {
      const rho = i <= baseRows ? rho1 + ((mid - rho1) * i) / baseRows : mid + ((rho2 - mid) * (i - baseRows)) / flapRows;
      const u = cx + ex * rho;
      const w = cy + ey * rho;
      const [x, y, z, d] = foldPoint(u, w, p);
      positions[v * 3] = x;
      positions[v * 3 + 1] = y;
      positions[v * 3 + 2] = z;
      flat[v * 2] = u;
      flat[v * 2 + 1] = w;
      creaseDistance[v] = d;
      v++;
    }
  }

  const indices = new Uint16Array(columns * (rows - 1) * 6);
  let k = 0;
  for (let j = 0; j < columns; j++) {
    for (let i = 0; i < rows - 1; i++) {
      const a = j * rows + i;
      const c = (j + 1) * rows + i;
      indices[k++] = a;
      indices[k++] = c;
      indices[k++] = a + 1;
      indices[k++] = a + 1;
      indices[k++] = c;
      indices[k++] = c + 1;
    }
  }
  const normals = computeNormals(positions, indices, vertexCount);
  return { positions, normals, flat, creaseDistance, indices, vertexCount };
}

const SHADOW_GLSL = `
uniform vec2 uShadowC;
uniform vec2 uShadowAxis;
uniform vec2 uShadowSize;
uniform float uShadowStrength;
float flapShadow(vec2 p) {
  vec2 d = p - uShadowC;
  vec2 q = vec2(dot(d, uShadowAxis), dot(d, vec2(-uShadowAxis.y, uShadowAxis.x))) / uShadowSize;
  return uShadowStrength * exp(-dot(q, q) * 2.4);
}
`;

const SHELL_VS = `
attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec2 aFlat;
attribute float aCrease;
uniform mat4 uViewProj;
varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vFlat;
varying float vCrease;
void main() {
  vPos = aPos;
  vNormal = aNormal;
  vFlat = aFlat;
  vCrease = aCrease;
  gl_Position = uViewProj * vec4(aPos, 1.0);
}
`;

const SHELL_FS = `
uniform vec3 uSheet;
uniform vec3 uLine;
uniform vec3 uLight;
uniform vec3 uEye;
varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vFlat;
varying float vCrease;
${SHADOW_GLSL}
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(uEye - vPos);
  if (dot(n, v) < 0.0) n = -n;
  float ndl = dot(n, uLight);
  // Soft wrap lighting: the paper never goes fully black on the far side.
  float diff = clamp((ndl + 0.55) / 1.55, 0.0, 1.0);
  float flap = smoothstep(0.0, 0.85, vCrease);
  float shade = 0.5 + 0.5 * diff;
  // Graphite deepens on the curved flap where it turns away from the light.
  shade *= 1.0 - flap * (1.0 - diff) * 0.6;
  // The lifted flap shades the base underneath it.
  float onBase = 1.0 - smoothstep(-0.02, 0.0, vCrease);
  shade *= 1.0 - flapShadow(vPos.xy) * onBase * 0.75;
  float fibre = vnoise(vFlat * vec2(260.0, 36.0)) * 0.55 + vnoise(vFlat * 72.0 + 3.1) * 0.45;
  vec3 col = uSheet * shade * (0.972 + 0.056 * fibre);
  float w = DERIV(vCrease);
  float line = 1.0 - smoothstep(w * 0.6, w * 1.6, abs(vCrease));
  float r = length(vFlat);
  float wr = DERIV(r);
  float rim = smoothstep(1.0 - wr * 1.8, 1.0 - wr * 0.3, r);
  col = mix(col, uLine, line * 0.9);
  col = mix(col, uLine, rim * 0.4);
  FRAG = vec4(col, 1.0);
}
`;

const GROUND_VS = `
attribute vec2 aGround;
uniform mat4 uViewProj;
varying vec2 vP;
void main() {
  vP = aGround;
  gl_Position = uViewProj * vec4(aGround, 0.0, 1.0);
}
`;

const GROUND_FS = `
uniform vec3 uShadowColor;
uniform vec2 uRes;
varying vec2 vP;
${SHADOW_GLSL}
void main() {
  float r = length(vP);
  float contact = (1.0 - smoothstep(0.95, 1.12, r)) * 0.2;
  float a = 1.0 - (1.0 - contact) * (1.0 - flapShadow(vP));
  // Fade out well before the canvas edge so the shadow never ends in a hard line.
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 edge = smoothstep(vec2(0.0), vec2(0.16), uv) * smoothstep(vec2(0.0), vec2(0.16), 1.0 - uv);
  a = clamp(a, 0.0, 0.5) * edge.x * edge.y;
  FRAG = vec4(uShadowColor * a, a);
}
`;

function prefixes(webgl2: boolean, derivatives: boolean) {
  if (webgl2) {
    return {
      vs: "#version 300 es\n#define attribute in\n#define varying out\n",
      fs: "#version 300 es\nprecision highp float;\n#define varying in\nout vec4 fragOut;\n#define FRAG fragOut\n#define DERIV(x) fwidth(x)\n",
    };
  }
  return {
    vs: "precision highp float;\n",
    fs:
      (derivatives ? "#extension GL_OES_standard_derivatives : enable\n" : "") +
      "precision mediump float;\n#define FRAG gl_FragColor\n" +
      (derivatives ? "#define DERIV(x) fwidth(x)\n" : "#define DERIV(x) 0.006\n"),
  };
}

function compile(gl: GL, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    console.warn("[shell] shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: GL, vs: string, fs: string, attribs: string[]): WebGLProgram | null {
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  const program = gl.createProgram();
  if (!v || !f || !program) return null;
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  attribs.forEach((name, index) => gl.bindAttribLocation(program, index, name));
  gl.linkProgram(program);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
    console.warn("[shell] link:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

interface Resources {
  shell: WebGLProgram;
  ground: WebGLProgram;
  positions: WebGLBuffer;
  normals: WebGLBuffer;
  flat: WebGLBuffer;
  crease: WebGLBuffer;
  indices: WebGLBuffer;
  groundQuad: WebGLBuffer;
  indexCount: number;
  indexType: number;
  shellU: Record<string, WebGLUniformLocation | null>;
  groundU: Record<string, WebGLUniformLocation | null>;
}

const SHELL_UNIFORMS = ["uViewProj", "uSheet", "uLine", "uLight", "uEye", "uShadowC", "uShadowAxis", "uShadowSize", "uShadowStrength"];
const GROUND_UNIFORMS = ["uViewProj", "uShadowColor", "uRes", "uShadowC", "uShadowAxis", "uShadowSize", "uShadowStrength"];

export function createShellRenderer(canvas: HTMLCanvasElement): ShellRenderer | null {
  const options: WebGLContextAttributes = { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" };
  let gl: GL | null = canvas.getContext("webgl2", options);
  const webgl2 = !!gl;
  if (!gl) gl = (canvas.getContext("webgl", options) ?? canvas.getContext("experimental-webgl", options)) as WebGLRenderingContext | null;
  if (!gl) return null;
  const ctx: GL = gl;

  let res: Resources | null = null;
  let view: ViewSetup = viewSetup(canvas.width / Math.max(1, canvas.height) || 1);
  let lastPose: { fold: number; twist: number } | null = null;
  let params: CreaseParams | null = null;
  let dirty = true;
  let colors: ShellColors = { sheet: [0.86, 0.83, 0.78], ink: [0.93, 0.9, 0.86], paper: [0.07, 0.07, 0.07] };
  const shadow = { c: [0, 0] as [number, number], axis: [1, 0] as [number, number], size: [0.6, 0.3] as [number, number], strength: 0 };

  function init(): boolean {
    const derivatives = webgl2 || !!ctx.getExtension("OES_standard_derivatives");
    const pre = prefixes(webgl2, derivatives);
    const shell = link(ctx, pre.vs + SHELL_VS, pre.fs + SHELL_FS, ["aPos", "aNormal", "aFlat", "aCrease"]);
    const ground = link(ctx, pre.vs + GROUND_VS, pre.fs + GROUND_FS, ["aGround"]);
    if (!shell || !ground) return false;
    const make = () => ctx.createBuffer();
    const buffers = [make(), make(), make(), make(), make(), make()];
    if (buffers.some((b) => !b)) return false;
    const [positions, normals, flat, crease, indices, groundQuad] = buffers as WebGLBuffer[];
    const uniforms = (program: WebGLProgram, names: string[]) =>
      Object.fromEntries(names.map((name) => [name, ctx.getUniformLocation(program, name)]));

    ctx.bindBuffer(ctx.ARRAY_BUFFER, groundQuad);
    const g = 2.2;
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-g, -g, g, -g, -g, g, g, g]), ctx.STATIC_DRAW);

    res = {
      shell,
      ground,
      positions,
      normals,
      flat,
      crease,
      indices,
      groundQuad,
      indexCount: 0,
      indexType: ctx.UNSIGNED_SHORT,
      shellU: uniforms(shell, SHELL_UNIFORMS),
      groundU: uniforms(ground, GROUND_UNIFORMS),
    };
    lastPose = null;
    upload(params ?? restParams);
    dirty = true;
    return true;
  }

  function upload(p: CreaseParams) {
    if (!res) return;
    // The mesh follows the crease, so every buffer (also the flat coordinates
    // and, in principle, the indices) belongs to the current pose.
    const mesh = buildCreaseMesh(p);
    const data: [WebGLBuffer, Float32Array][] = [
      [res.positions, mesh.positions],
      [res.normals, mesh.normals],
      [res.flat, mesh.flat],
      [res.crease, mesh.creaseDistance],
    ];
    for (const [buffer, values] of data) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, values, ctx.DYNAMIC_DRAW);
    }
    if (mesh.indices.length !== res.indexCount) {
      ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, res.indices);
      ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, mesh.indices, ctx.STATIC_DRAW);
      res.indexCount = mesh.indices.length;
      res.indexType = mesh.indices instanceof Uint32Array ? ctx.UNSIGNED_INT : ctx.UNSIGNED_SHORT;
    }
    updateShadow(p, mesh.positions, mesh.creaseDistance);
    lastPose = { fold: p.fold, twist: p.twist };
    dirty = true;
  }

  /** Soft ellipse under the lifted flap: its centroid pushed away from the light. */
  function updateShadow(p: CreaseParams, positions: Float32Array, distance: Float32Array) {
    let sx = 0;
    let sy = 0;
    let sz = 0;
    let count = 0;
    for (let i = 0; i < distance.length; i++) {
      if (distance[i] <= 0) continue;
      sx += positions[i * 3];
      sy += positions[i * 3 + 1];
      sz += positions[i * 3 + 2];
      count++;
    }
    if (!count) {
      shadow.strength = 0;
      return;
    }
    const cx = sx / count;
    const cy = sy / count;
    const cz = sz / count;
    const L = view.light;
    const push = (cz * 0.6) / Math.max(0.2, L[2]);
    shadow.c = [cx - L[0] * push, cy - L[1] * push];
    // Major axis follows the crease tangent.
    const ccos = Math.cos(p.twist);
    const csin = Math.sin(p.twist);
    const kx = p.center[0] * ccos - p.center[1] * csin;
    const ky = p.center[0] * csin + p.center[1] * ccos;
    const len = Math.hypot(kx, ky) || 1;
    shadow.axis = [-ky / len, kx / len];
    shadow.size = [0.56, 0.2 + cz * 0.32];
    const t = Math.min(1, Math.max(0, (p.fold - 0.05) / 0.55));
    shadow.strength = 0.34 * t * t * (3 - 2 * t);
  }

  function setShadowUniforms(u: Record<string, WebGLUniformLocation | null>) {
    ctx.uniform2f(u.uShadowC, shadow.c[0], shadow.c[1]);
    ctx.uniform2f(u.uShadowAxis, shadow.axis[0], shadow.axis[1]);
    ctx.uniform2f(u.uShadowSize, shadow.size[0], shadow.size[1]);
    ctx.uniform1f(u.uShadowStrength, shadow.strength);
  }

  function bindAttrib(buffer: WebGLBuffer, location: number, size: number) {
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
    ctx.enableVertexAttribArray(location);
    ctx.vertexAttribPointer(location, size, ctx.FLOAT, false, 0, 0);
  }

  function draw() {
    if (!res || ctx.isContextLost()) return;
    const line = creaseLineColor(colors.sheet, colors.ink, colors.paper);
    ctx.viewport(0, 0, canvas.width, canvas.height);
    ctx.clearColor(0, 0, 0, 0);
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

    // Ground: contact shadow only, blended over the page paper.
    ctx.disable(ctx.DEPTH_TEST);
    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
    ctx.useProgram(res.ground);
    for (let i = 1; i < 4; i++) ctx.disableVertexAttribArray(i);
    bindAttrib(res.groundQuad, 0, 2);
    ctx.uniformMatrix4fv(res.groundU.uViewProj, false, view.matrix);
    const sc: Vec3 = [colors.paper[0] * 0.22, colors.paper[1] * 0.22, colors.paper[2] * 0.22];
    ctx.uniform3f(res.groundU.uShadowColor, sc[0], sc[1], sc[2]);
    ctx.uniform2f(res.groundU.uRes, canvas.width, canvas.height);
    setShadowUniforms(res.groundU);
    ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);

    // Shell.
    ctx.disable(ctx.BLEND);
    ctx.enable(ctx.DEPTH_TEST);
    ctx.depthFunc(ctx.LEQUAL);
    ctx.useProgram(res.shell);
    bindAttrib(res.positions, 0, 3);
    bindAttrib(res.normals, 1, 3);
    bindAttrib(res.flat, 2, 2);
    bindAttrib(res.crease, 3, 1);
    const u = res.shellU;
    ctx.uniformMatrix4fv(u.uViewProj, false, view.matrix);
    ctx.uniform3f(u.uSheet, colors.sheet[0], colors.sheet[1], colors.sheet[2]);
    ctx.uniform3f(u.uLine, line[0], line[1], line[2]);
    ctx.uniform3f(u.uLight, view.light[0], view.light[1], view.light[2]);
    ctx.uniform3f(u.uEye, view.eye[0], view.eye[1], view.eye[2]);
    setShadowUniforms(u);
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, res.indices);
    ctx.drawElements(ctx.TRIANGLES, res.indexCount, res.indexType, 0);
    dirty = false;
  }

  function release() {
    if (!res || ctx.isContextLost()) {
      res = null;
      return;
    }
    ctx.deleteProgram(res.shell);
    ctx.deleteProgram(res.ground);
    [res.positions, res.normals, res.flat, res.crease, res.indices, res.groundQuad].forEach((b) => ctx.deleteBuffer(b));
    res = null;
  }

  if (!init()) {
    release();
    return null;
  }

  return {
    setParams(next) {
      params = next;
      if (needsRebuild(lastPose, next)) upload(next);
    },
    setColors(next) {
      colors = next;
      dirty = true;
    },
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      view = viewSetup(width / height);
      if (params) {
        lastPose = null;
        upload(params);
      }
      dirty = true;
    },
    render(force = false) {
      if (dirty || force) draw();
    },
    restore() {
      res = null;
      return init();
    },
    dispose() {
      // Free GPU resources. The context itself is not force-lost: React may
      // mount again on the same canvas (Strict Mode, fast refresh).
      release();
    },
  };
}
