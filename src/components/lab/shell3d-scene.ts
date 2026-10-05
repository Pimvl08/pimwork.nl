/**
 * three.js scene for "De schaal in de hand": the curved-crease shell from
 * @/lib/crease as lit paper with an ink crease, soft contact shadows and an
 * orbit camera. Framework free; ShellLab3D.tsx drives it.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { buildShell, creaseLine, creaseStates, mixCrease, type CreaseParams } from "@/lib/crease";
import { readGlColor } from "@/lib/theme";
import type { ShellStateKey } from "./shell3d-copy";

const RINGS = 40;
const SEGMENTS = 144;
const DPR_CAP = 1.75;
const STATE_MS = 900;
const CAMERA_MS = 700;
const LINE_WIDTH = 1.5;
const LINE_WIDTH_HOVER = 3;
const TARGET = new THREE.Vector3(0, 0.22, 0);
const FRAME_RADIUS = 1.12;
const HOME_POLAR = 0.98;
const HOME_AZIMUTH = 0.35;
const MIN_DISTANCE = 1.7;
const MAX_DISTANCE = 6;

/** Cubic bezier easing, solved for x with Newton steps then bisection. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const a = (p1: number, p2: number) => 1 - 3 * p2 + 3 * p1;
  const b = (p1: number, p2: number) => 3 * p2 - 6 * p1;
  const c = (p1: number) => 3 * p1;
  const at = (t: number, p1: number, p2: number) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t;
  const slope = (t: number, p1: number, p2: number) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1);
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const s = slope(t, x1, x2);
      if (Math.abs(s) < 1e-6) break;
      t -= (at(t, x1, x2) - x) / s;
    }
    if (t < 0 || t > 1 || Math.abs(at(t, x1, x2) - x) > 1e-4) {
      let lo = 0;
      let hi = 1;
      t = x;
      for (let i = 0; i < 30; i++) {
        const v = at(t, x1, x2);
        if (Math.abs(v - x) < 1e-5) break;
        if (v < x) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
    }
    return at(t, y1, y2);
  };
}

/** Reads a cubic-bezier() easing token, with the token's value as fallback. */
function tokenEase(name: string, fallback: [number, number, number, number]) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const nums = raw.match(/-?\d*\.?\d+/g)?.map(Number);
  const v = nums && nums.length === 4 && nums.every(Number.isFinite) ? (nums as [number, number, number, number]) : fallback;
  return bezier(...v);
}

/** Tileable paper fibre: red = height for the bump map, green = roughness. */
function makeFibreTexture(): THREE.DataTexture {
  const size = 256;
  const height = new Float32Array(size * size);
  let seed = 9;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < height.length; i++) height[i] = (rand() - 0.5) * 0.25;
  for (let f = 0; f < 900; f++) {
    let x = rand() * size;
    let y = rand() * size;
    const angle = rand() * Math.PI;
    const length = 6 + rand() * 26;
    const strength = 0.35 + rand() * 0.65;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    for (let s = 0; s < length; s++) {
      const px = ((Math.round(x) % size) + size) % size;
      const py = ((Math.round(y) % size) + size) % size;
      const fade = Math.sin((s / length) * Math.PI);
      height[py * size + px] += strength * fade;
      x += dx;
      y += dy;
    }
  }
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < height.length; i++) {
    const h = Math.max(0, Math.min(1, 0.5 + height[i] * 0.35));
    data[i * 4] = Math.round(h * 255);
    data[i * 4 + 1] = Math.round((0.84 + (1 - h) * 0.16) * 255);
    data[i * 4 + 2] = 255;
    data[i * 4 + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 2.2);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

const luminance = (c: [number, number, number]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

export interface ShellSceneOptions {
  canvas: HTMLCanvasElement;
  /** Element that receives pointer events and carries the cursor label. */
  surface: HTMLElement;
  reducedMotion: boolean;
  cursorLabel: string;
  /** Called when an animation ends, with the resting fold and side. */
  onSettled?: (params: CreaseParams) => void;
}

export interface ShellScene {
  setActive(active: boolean): void;
  setReducedMotion(reduced: boolean): void;
  setFold(fold: number): void;
  flip(): void;
  setLocked(locked: boolean): void;
  goTo(state: ShellStateKey): void;
  setWireframe(on: boolean): void;
  resetCamera(): void;
  orbit(dAzimuth: number, dPolar: number): void;
  zoom(factor: number): void;
  setCursorLabel(label: string): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

type Animation = { from: CreaseParams; to: CreaseParams; start: number; flip: boolean };

export function createShellScene(opts: ShellSceneOptions): ShellScene {
  const { canvas, surface } = opts;
  let reduced = opts.reducedMotion;
  let cursorLabel = opts.cursorLabel;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // Light and ground never move: redraw the shadow map only when the sheet does.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);

  // Lights: a soft studio. Sky and floor bounce, one shadow-casting key,
  // a weak fill opposite and a low rim from behind.
  const hemi = new THREE.HemisphereLight(0xffffff, 0x808080, 0.95);
  const key = new THREE.DirectionalLight(0xffffff, 1.55);
  key.position.set(1.8, 3.4, 1.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  const shadowCam = key.shadow.camera;
  shadowCam.left = -1.7;
  shadowCam.right = 1.7;
  shadowCam.top = 1.7;
  shadowCam.bottom = -1.7;
  shadowCam.near = 0.5;
  shadowCam.far = 8;
  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(-2.4, 1.2, 1.2);
  const rim = new THREE.DirectionalLight(0xffffff, 0.35);
  rim.position.set(-0.6, 1.4, -2.6);
  scene.add(hemi, key, fill, rim);

  // Ground: only receives the contact shadow, the stage paper shows through.
  const groundGeo = new THREE.PlaneGeometry(14, 14);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.2, color: 0x000000 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.002;
  ground.receiveShadow = true;
  scene.add(ground);

  // The sheet lives in disc coordinates (z up); the group turns z into y.
  const sheet = new THREE.Group();
  sheet.rotation.x = -Math.PI / 2;
  scene.add(sheet);

  let base: CreaseParams = { ...creaseStates.stable };
  let shown: CreaseParams = { ...base };
  const first = buildShell(base, RINGS, SEGMENTS);
  const geometry = new THREE.BufferGeometry();
  const position = new THREE.BufferAttribute(new Float32Array(first.positions), 3).setUsage(THREE.DynamicDrawUsage);
  const normal = new THREE.BufferAttribute(new Float32Array(first.normals), 3).setUsage(THREE.DynamicDrawUsage);
  const uv = new Float32Array(first.vertexCount * 2);
  for (let i = 0; i < first.vertexCount; i++) {
    uv[i * 2] = first.flat[i * 2] * 0.5 + 0.5;
    uv[i * 2 + 1] = first.flat[i * 2 + 1] * 0.5 + 0.5;
  }
  geometry.setAttribute("position", position);
  geometry.setAttribute("normal", normal);
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(new THREE.BufferAttribute(first.indices, 1));
  geometry.computeBoundingSphere();
  // Aim at the middle of the folded shell, not at the disc centre.
  const target = TARGET.clone();
  geometry.computeBoundingBox();
  if (geometry.boundingBox) {
    const mid = geometry.boundingBox.getCenter(new THREE.Vector3());
    target.set(mid.x, Math.max(0.15, mid.z * 0.8), -mid.y);
  }

  const fibre = makeFibreTexture();
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
    roughnessMap: fibre,
    bumpMap: fibre,
    bumpScale: 0.6,
    // Push the sheet back a hair in depth so the ink lines on it stay crisp.
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 2,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  sheet.add(mesh);

  // The rim: a hairline along the outer edge of the sheet.
  const rimStart = 1 + (RINGS - 1) * SEGMENTS;
  const rimGeo = new THREE.BufferGeometry();
  const rimPos = new THREE.BufferAttribute(new Float32Array(SEGMENTS * 3), 3).setUsage(THREE.DynamicDrawUsage);
  rimGeo.setAttribute("position", rimPos);
  const rimMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
  const rimLine = new THREE.LineLoop(rimGeo, rimMat);
  sheet.add(rimLine);

  // The crease: a crisp ink line with real pixel width so it can thicken.
  const creaseMat = new LineMaterial({ color: 0x000000, linewidth: LINE_WIDTH, worldUnits: false, transparent: true, opacity: 0.75 });
  let creaseGeo = new LineGeometry();
  const crease = new Line2(creaseGeo, creaseMat);
  crease.renderOrder = 2;
  sheet.add(crease);
  let creaseKey = "";

  const writeCrease = (p: CreaseParams) => {
    const k = `${p.center[0].toFixed(4)},${p.center[1].toFixed(4)},${p.radius.toFixed(4)},${p.twist.toFixed(4)},${p.side}`;
    if (k === creaseKey) return;
    creaseKey = k;
    const pts = creaseLine(p, 96);
    // Sit the ink a hair onto the flat base and above it, so the rising flap
    // never cuts through the line.
    const c = Math.cos(p.twist);
    const sn = Math.sin(p.twist);
    const cx = p.center[0] * c - p.center[1] * sn;
    const cy = p.center[0] * sn + p.center[1] * c;
    for (let i = 0; i < pts.length; i += 3) {
      const dx = pts[i] - cx;
      const dy = pts[i + 1] - cy;
      const d = Math.hypot(dx, dy) || 1;
      pts[i] -= (dx / d) * 0.012 * p.side;
      pts[i + 1] -= (dy / d) * 0.012 * p.side;
      pts[i + 2] = 0.003;
    }
    creaseGeo.dispose();
    creaseGeo = new LineGeometry();
    if (pts.length >= 6) creaseGeo.setPositions(pts);
    crease.geometry = creaseGeo;
    crease.visible = pts.length >= 6;
  };

  const writeShell = (p: CreaseParams) => {
    const m = buildShell(p, RINGS, SEGMENTS);
    (position.array as Float32Array).set(m.positions);
    (normal.array as Float32Array).set(m.normals);
    position.needsUpdate = true;
    normal.needsUpdate = true;
    geometry.computeBoundingSphere();
    (rimPos.array as Float32Array).set(m.positions.subarray(rimStart * 3, (rimStart + SEGMENTS) * 3));
    rimPos.needsUpdate = true;
    writeCrease(p);
    renderer.shadowMap.needsUpdate = true;
  };
  writeShell(base);

  const applyColours = () => {
    const sheetC = readGlColor("--gl-sheet");
    const ink = readGlColor("--gl-ink");
    const paper = readGlColor("--gl-paper");
    material.color.setRGB(sheetC[0], sheetC[1], sheetC[2], THREE.SRGBColorSpace);
    // The crease uses whichever token reads clearly on the sheet: ink by day,
    // graphite paper by night (where the sheet itself is light).
    const line = Math.abs(luminance(ink) - luminance(sheetC)) >= Math.abs(luminance(paper) - luminance(sheetC)) ? ink : paper;
    creaseMat.color.setRGB(line[0], line[1], line[2], THREE.SRGBColorSpace);
    rimMat.color.setRGB(line[0], line[1], line[2], THREE.SRGBColorSpace);
    hemi.groundColor.setRGB(paper[0], paper[1], paper[2], THREE.SRGBColorSpace);
    const dark = luminance(paper) < 0.5;
    groundMat.opacity = dark ? 0.55 : 0.2;
    hemi.intensity = dark ? 0.8 : 0.95;
    dirty = true;
  };

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = MIN_DISTANCE;
  controls.maxDistance = MAX_DISTANCE;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = 1.42;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.7;
  controls.target.copy(target);
  // Vertical swipes keep scrolling the page on phones; sideways turns.
  canvas.style.touchAction = "pan-y";

  let width = 1;
  let height = 1;
  const homeDistance = () => {
    const aspect = width / height;
    const halfV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return THREE.MathUtils.clamp(Math.max(FRAME_RADIUS / halfV, FRAME_RADIUS / (halfV * aspect)), MIN_DISTANCE + 0.4, MAX_DISTANCE - 0.5);
  };
  const homePosition = () => new THREE.Vector3().setFromSphericalCoords(homeDistance(), HOME_POLAR, HOME_AZIMUTH).add(target);
  camera.position.copy(homePosition());
  controls.update();

  let dirty = true;
  let locked = false;
  let active = false;
  let anim: Animation | null = null;
  let camAnim: { from: THREE.Vector3; to: THREE.Vector3; start: number } | null = null;
  let hovering = false;
  let overSheet = false;
  let pointerInside = false;
  let pointerMoved = false;
  let dragging = false;
  const ndc = new THREE.Vector2();
  const response = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const easeState = tokenEase("--ease-crease", [0.65, 0, 0.35, 1]);
  const easeCamera = tokenEase("--ease-out-expo", [0.16, 1, 0.3, 1]);
  let lastTime = 0;
  let clock = 0;

  const setCursor = (on: boolean) => {
    if (on === overSheet) return;
    overSheet = on;
    surface.setAttribute("data-cursor", on ? "drag" : "default");
    if (on) surface.setAttribute("data-cursor-label", cursorLabel);
    surface.style.cursor = dragging ? "grabbing" : on ? "grab" : "default";
  };

  const setHover = (on: boolean) => {
    if (on === hovering) return;
    hovering = on;
    creaseMat.linewidth = on ? LINE_WIDTH_HOVER : LINE_WIDTH;
    creaseMat.opacity = on ? 1 : 0.75;
    rimMat.opacity = on ? 0.55 : 0.35;
    dirty = true;
  };

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    pointerInside = true;
    pointerMoved = true;
  };
  const onPointerLeave = () => {
    pointerInside = false;
    setHover(false);
    setCursor(false);
  };
  const onStart = () => {
    dragging = true;
    surface.style.cursor = "grabbing";
  };
  const onEnd = () => {
    dragging = false;
    surface.style.cursor = overSheet ? "grab" : "default";
  };
  surface.addEventListener("pointermove", onPointerMove);
  surface.addEventListener("pointerleave", onPointerLeave);
  controls.addEventListener("start", onStart);
  controls.addEventListener("end", onEnd);

  const settleTo = (p: CreaseParams) => {
    base = { ...p, center: [p.center[0], p.center[1]] };
    anim = null;
    dirty = true;
    opts.onSettled?.(base);
  };

  const startAnim = (to: CreaseParams, flip = false) => {
    if (reduced) {
      settleTo(to);
      return;
    }
    anim = { from: { ...base }, to, start: performance.now(), flip };
  };

  const animatedBase = (now: number): CreaseParams => {
    if (!anim) return base;
    const t = Math.min(1, (now - anim.start) / STATE_MS);
    let p: CreaseParams;
    if (anim.flip) {
      // Fold down to flat on the old side, then up again on the new side.
      const flatFrom = { ...anim.from, fold: 0 };
      const flatTo = { ...anim.to, fold: 0 };
      p = t < 0.5 ? mixCrease(anim.from, flatFrom, easeState(t * 2)) : mixCrease(flatTo, anim.to, easeState(t * 2 - 1));
    } else {
      p = mixCrease(anim.from, anim.to, easeState(t));
    }
    if (t >= 1) {
      settleTo(anim.to);
      return base;
    }
    return p;
  };

  const sameParams = (a: CreaseParams, b: CreaseParams) =>
    Math.abs(a.fold - b.fold) < 1e-5 &&
    Math.abs(a.curl - b.curl) < 1e-5 &&
    Math.abs(a.radius - b.radius) < 1e-5 &&
    Math.abs(a.maxAngle - b.maxAngle) < 1e-5 &&
    Math.abs(a.twist - b.twist) < 1e-5 &&
    Math.abs(a.center[0] - b.center[0]) < 1e-5 &&
    Math.abs(a.center[1] - b.center[1]) < 1e-5 &&
    a.side === b.side;

  const frame = (now: number) => {
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;
    clock += dt;

    if (camAnim) {
      const t = Math.min(1, (now - camAnim.start) / CAMERA_MS);
      camera.position.lerpVectors(camAnim.from, camAnim.to, easeCamera(t));
      if (t >= 1) camAnim = null;
      dirty = true;
    }
    if (controls.update(dt)) dirty = true;

    // Hover: one raycast per frame at most, only after the pointer moved.
    if (pointerInside && pointerMoved) {
      pointerMoved = false;
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(mesh, false).length > 0;
      setHover(hit || dragging);
      setCursor(hit);
    }

    let p = animatedBase(now);
    const alive = !locked && !reduced;
    if (alive) {
      // Pointer response: the sheet leans towards the pointer a little.
      const tx = pointerInside ? ndc.x : 0;
      const ty = pointerInside ? ndc.y : 0;
      const k = 1 - Math.exp(-dt * 4);
      response.x += (tx - response.x) * k;
      response.y += (ty - response.y) * k;
      const breathe = Math.sin(clock * 1.1) * 0.028;
      const curl = Math.sin(clock * 0.7) * 0.035;
      p = {
        ...p,
        fold: Math.min(1, Math.max(0, p.fold + breathe + response.y * 0.05)),
        curl: Math.max(0, p.curl + curl + response.x * 0.06),
      };
    } else {
      response.set(0, 0);
    }
    if (!sameParams(p, shown)) {
      shown = p;
      writeShell(p);
      dirty = true;
    }

    if (dirty) {
      renderer.render(scene, camera);
      dirty = false;
    }
  };

  const updateLoop = () => {
    const run = active && !document.hidden;
    renderer.setAnimationLoop(run ? frame : null);
    if (!run) lastTime = 0;
    else dirty = true;
  };
  const onVisibility = () => updateLoop();
  document.addEventListener("visibilitychange", onVisibility);
  const onTheme = () => {
    applyColours();
    if (!active) renderer.render(scene, camera);
  };
  window.addEventListener("pim:theme", onTheme);
  applyColours();

  return {
    setActive(next) {
      active = next;
      updateLoop();
    },
    setReducedMotion(next) {
      reduced = next;
      if (reduced && anim) settleTo(anim.to);
      dirty = true;
    },
    setFold(fold) {
      anim = null;
      base = { ...base, fold: Math.min(1, Math.max(0, fold)) };
      dirty = true;
    },
    flip() {
      const to = { ...base, side: (base.side === 1 ? -1 : 1) as 1 | -1 };
      startAnim(to, true);
    },
    setLocked(next) {
      locked = next;
      dirty = true;
    },
    goTo(state) {
      startAnim({ ...creaseStates[state] });
    },
    setWireframe(on) {
      material.wireframe = on;
      dirty = true;
    },
    resetCamera() {
      const to = homePosition();
      controls.target.copy(target);
      if (reduced) {
        camera.position.copy(to);
        camAnim = null;
      } else {
        camAnim = { from: camera.position.clone(), to, start: performance.now() };
      }
      dirty = true;
    },
    orbit(dAzimuth, dPolar) {
      camAnim = null;
      const offset = camera.position.clone().sub(controls.target);
      const s = new THREE.Spherical().setFromVector3(offset);
      s.theta += dAzimuth;
      s.phi = THREE.MathUtils.clamp(s.phi + dPolar, controls.minPolarAngle, controls.maxPolarAngle);
      camera.position.copy(new THREE.Vector3().setFromSpherical(s).add(controls.target));
      dirty = true;
    },
    zoom(factor) {
      camAnim = null;
      const offset = camera.position.clone().sub(controls.target);
      const d = THREE.MathUtils.clamp(offset.length() * factor, MIN_DISTANCE, MAX_DISTANCE);
      camera.position.copy(offset.setLength(d).add(controls.target));
      dirty = true;
    },
    setCursorLabel(label) {
      cursorLabel = label;
      if (overSheet) surface.setAttribute("data-cursor-label", label);
    },
    resize(w, h) {
      const firstSize = width === 1 && height === 1;
      width = Math.max(1, w);
      height = Math.max(1, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (firstSize) {
        camera.position.copy(homePosition());
        controls.update();
      }
      dirty = true;
      if (!active) renderer.render(scene, camera);
    },
    dispose() {
      renderer.setAnimationLoop(null);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pim:theme", onTheme);
      surface.removeEventListener("pointermove", onPointerMove);
      surface.removeEventListener("pointerleave", onPointerLeave);
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      fibre.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      creaseGeo.dispose();
      creaseMat.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      key.dispose();
      fill.dispose();
      rim.dispose();
      hemi.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
