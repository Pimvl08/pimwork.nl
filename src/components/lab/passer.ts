import { mulberry32 } from "./logic";

/**
 * Passerwerk: a deterministic compass drawing. The same seed, density,
 * symmetry and size always give the same arcs, so a plate number is enough
 * to redraw (and export) a drawing.
 */

export type Symmetry = "none" | "mirror" | "rotational";

export interface ArcEl {
  kind: "arc";
  cx: number;
  cy: number;
  r: number;
  /** Start and end angle in radians, a1 > a0. A full circle spans 2 pi. */
  a0: number;
  a1: number;
  weight: number;
}

export interface LineEl {
  kind: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  weight: number;
}

export type PassEl = ArcEl | LineEl;

export interface Drawing {
  seed: number;
  width: number;
  height: number;
  elements: PassEl[];
  /** Where the compass needle stood. */
  pivots: { x: number; y: number }[];
}

export interface DrawingOptions {
  density: number; // 1..10
  symmetry: Symmetry;
  width?: number;
  height?: number;
}

const TAU = Math.PI * 2;
const r2 = (v: number) => Math.round(v * 100) / 100;

/** A fresh four-digit plate number. */
export function newSeed(rand: () => number = Math.random): number {
  return 1000 + Math.floor(rand() * 9000);
}

/** Clips the infinite line through (px, py) with direction (dx, dy) to the box. */
function clipLine(px: number, py: number, dx: number, dy: number, w: number, h: number): LineEl {
  let t0 = -Infinity;
  let t1 = Infinity;
  const slab = (p: number, d: number, max: number) => {
    if (Math.abs(d) < 1e-9) return;
    const a = (0 - p) / d;
    const b = (max - p) / d;
    t0 = Math.max(t0, Math.min(a, b));
    t1 = Math.min(t1, Math.max(a, b));
  };
  slab(px, dx, w);
  slab(py, dy, h);
  return { kind: "line", x1: r2(px + dx * t0), y1: r2(py + dy * t0), x2: r2(px + dx * t1), y2: r2(py + dy * t1), weight: 1.6 };
}

function ringsAround(rng: () => number, x: number, y: number, density: number, maxR: number): ArcEl[] {
  const out: ArcEl[] = [];
  const rings = Math.max(2, Math.round((2 + density * 0.7) * (0.6 + rng() * 0.8)));
  let r = 14 + rng() * 50;
  const step = 10 + rng() * (maxR / (rings + 1));
  for (let i = 0; i < rings && r < maxR; i++) {
    const full = rng() < 0.14;
    const a0 = full ? 0 : rng() * TAU;
    const sweep = full ? TAU : (0.22 + rng() * 1.25) * Math.PI;
    out.push({ kind: "arc", cx: r2(x), cy: r2(y), r: r2(r), a0: r2(a0), a1: full ? r2(TAU) : r2(a0 + sweep), weight: r2(0.6 + rng() * 0.9) });
    r += step * (0.7 + rng() * 0.6);
  }
  return out;
}

function mirrorArc(a: ArcEl, w: number): ArcEl {
  if (a.a1 - a.a0 >= TAU - 0.01) return { ...a, cx: r2(w - a.cx) };
  return { ...a, cx: r2(w - a.cx), a0: r2(Math.PI - a.a1), a1: r2(Math.PI - a.a0) };
}

function rotateArc(a: ArcEl, theta: number, ox: number, oy: number): ArcEl {
  const dx = a.cx - ox;
  const dy = a.cy - oy;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const full = a.a1 - a.a0 >= TAU - 0.01;
  return {
    ...a,
    cx: r2(ox + dx * c - dy * s),
    cy: r2(oy + dx * s + dy * c),
    a0: full ? a.a0 : r2(a.a0 + theta),
    a1: full ? a.a1 : r2(a.a1 + theta),
  };
}

export function generateDrawing(seed: number, opts: DrawingOptions): Drawing {
  const width = Math.round(opts.width ?? 1000);
  const height = Math.round(opts.height ?? 625);
  const density = Math.min(10, Math.max(1, Math.round(opts.density)));
  const rng = mulberry32(seed * 2654435761 + density * 97 + (opts.symmetry === "mirror" ? 1 : opts.symmetry === "rotational" ? 2 : 0));
  const cx = width / 2;
  const cy = height / 2;
  const span = Math.min(width, height);

  // The single crease: a vertical axis for mirror, a diameter for rotation,
  // a free fold otherwise.
  let angle: number;
  let px = cx;
  let py = cy;
  if (opts.symmetry === "mirror") {
    angle = Math.PI / 2;
  } else if (opts.symmetry === "rotational") {
    angle = rng() * Math.PI;
  } else {
    angle = (rng() - 0.5) * 1.3 + (rng() < 0.35 ? Math.PI / 2 : 0);
    px = cx + (rng() - 0.5) * width * 0.3;
    py = cy + (rng() - 0.5) * height * 0.3;
  }
  const crease = clipLine(px, py, Math.cos(angle), Math.sin(angle), width, height);

  const pivotCount = 2 + Math.floor(rng() * (density > 6 ? 3 : 2));
  const pivots: { x: number; y: number }[] = [];
  for (let i = 0; i < pivotCount; i++) {
    if (opts.symmetry === "mirror") {
      pivots.push({ x: r2(cx - rng() * width * 0.32), y: r2(height * (0.2 + rng() * 0.6)) });
    } else if (opts.symmetry === "rotational") {
      const a = rng() * TAU;
      const d = rng() * span * 0.28;
      pivots.push({ x: r2(cx + Math.cos(a) * d), y: r2(cy + Math.sin(a) * d) });
    } else {
      // The needle stands on the fold.
      const t = (i + 0.5) / pivotCount + (rng() - 0.5) * 0.18;
      pivots.push({ x: r2(crease.x1 + (crease.x2 - crease.x1) * t), y: r2(crease.y1 + (crease.y2 - crease.y1) * t) });
    }
  }

  const maxR = span * (opts.symmetry === "rotational" ? 0.42 : 0.55);
  const arcs: ArcEl[] = [];
  for (const p of pivots) arcs.push(...ringsAround(rng, p.x, p.y, density, maxR));

  const elements: PassEl[] = [crease];
  const allPivots = [...pivots];
  for (const a of arcs) {
    elements.push(a);
    if (opts.symmetry === "mirror") elements.push(mirrorArc(a, width));
    if (opts.symmetry === "rotational") {
      elements.push(rotateArc(a, TAU / 3, cx, cy), rotateArc(a, (2 * TAU) / 3, cx, cy));
    }
  }
  if (opts.symmetry === "mirror") for (const p of pivots) allPivots.push({ x: r2(width - p.x), y: p.y });
  if (opts.symmetry === "rotational") {
    for (const p of pivots) {
      for (const th of [TAU / 3, (2 * TAU) / 3]) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        allPivots.push({ x: r2(cx + dx * Math.cos(th) - dy * Math.sin(th)), y: r2(cy + dx * Math.sin(th) + dy * Math.cos(th)) });
      }
    }
  }
  return { seed, width, height, elements, pivots: allPivots };
}

export function elementLength(el: PassEl): number {
  if (el.kind === "line") return Math.hypot(el.x2 - el.x1, el.y2 - el.y1);
  return el.r * (el.a1 - el.a0);
}

export function totalLength(d: Drawing): number {
  return d.elements.reduce((sum, el) => sum + elementLength(el), 0);
}

/** Draws the drawing up to `length` pixels of pen travel (Infinity = all). */
export function drawPartial(ctx: CanvasRenderingContext2D, d: Drawing, length: number, scale: number, ink: string, mute: string): void {
  let left = length;
  ctx.lineCap = "round";
  for (const el of d.elements) {
    if (left <= 0) break;
    const len = elementLength(el);
    const f = Math.min(1, left / Math.max(len, 0.001));
    left -= len;
    ctx.beginPath();
    if (el.kind === "line") {
      ctx.strokeStyle = ink;
      ctx.lineWidth = el.weight * scale;
      ctx.moveTo(el.x1 * scale, el.y1 * scale);
      ctx.lineTo((el.x1 + (el.x2 - el.x1) * f) * scale, (el.y1 + (el.y2 - el.y1) * f) * scale);
    } else {
      ctx.strokeStyle = el.weight > 1.2 ? ink : mute;
      ctx.lineWidth = el.weight * scale;
      ctx.arc(el.cx * scale, el.cy * scale, el.r * scale, el.a0, el.a0 + (el.a1 - el.a0) * f);
    }
    ctx.stroke();
  }
  if (length >= totalLength(d)) {
    ctx.fillStyle = ink;
    for (const p of d.pivots) {
      ctx.beginPath();
      ctx.arc(p.x * scale, p.y * scale, 2.2 * scale, 0, TAU);
      ctx.fill();
    }
  }
}

/** The same arcs as standalone SVG text. Colours are passed in (tokens). */
export function drawingToSvg(d: Drawing, colors: { paper: string; ink: string; mute: string }): string {
  const parts: string[] = [];
  for (const el of d.elements) {
    if (el.kind === "line") {
      parts.push(`<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${colors.ink}" stroke-width="${el.weight}"/>`);
      continue;
    }
    const stroke = el.weight > 1.2 ? colors.ink : colors.mute;
    if (el.a1 - el.a0 >= TAU - 0.01) {
      parts.push(`<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" stroke="${stroke}" stroke-width="${el.weight}"/>`);
      continue;
    }
    const x0 = r2(el.cx + el.r * Math.cos(el.a0));
    const y0 = r2(el.cy + el.r * Math.sin(el.a0));
    const x1 = r2(el.cx + el.r * Math.cos(el.a1));
    const y1 = r2(el.cy + el.r * Math.sin(el.a1));
    const large = el.a1 - el.a0 > Math.PI ? 1 : 0;
    parts.push(`<path d="M${x0} ${y0}A${el.r} ${el.r} 0 ${large} 1 ${x1} ${y1}" stroke="${stroke}" stroke-width="${el.weight}"/>`);
  }
  for (const p of d.pivots) parts.push(`<circle cx="${p.x}" cy="${p.y}" r="2.2" fill="${colors.ink}"/>`);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.width} ${d.height}" width="${d.width}" height="${d.height}">`,
    `<title>Passerwerk, plaat ${d.seed}</title>`,
    `<rect width="100%" height="100%" fill="${colors.paper}"/>`,
    `<g fill="none" stroke-linecap="round">`,
    ...parts,
    `</g></svg>`,
  ].join("\n");
}
