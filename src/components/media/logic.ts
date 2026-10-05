/**
 * Pure helpers for plate 04 (Beeld / Media). No DOM, no React: unit tested
 * in tests/unit/media.test.ts.
 */

/** "m:ss" (or "h:mm:ss") for a time in seconds; invalid input reads as 0:00. */
export function formatTime(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Index after moving `step` places through a list of `length`, wrapping round. */
export function wrapIndex(index: number, step: number, length: number): number {
  if (length <= 0) return 0;
  return (((index + step) % length) + length) % length;
}

/** Time for a pointer at `clientX` over a track starting at `left` with `width`. */
export function timeFromPointer(clientX: number, left: number, width: number, duration: number): number {
  if (!(width > 0) || !(duration > 0)) return 0;
  return clamp(((clientX - left) / width) * duration, 0, duration);
}

/** Seek target for a key on the progress slider, or null when the key is not a seek key. */
export function sliderKeyTarget(key: string, current: number, duration: number, step = 5): number | null {
  if (!(duration > 0)) return null;
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return clamp(current + step, 0, duration);
    case "ArrowLeft":
    case "ArrowDown":
      return clamp(current - step, 0, duration);
    case "PageUp":
      return clamp(current + duration / 10, 0, duration);
    case "PageDown":
      return clamp(current - duration / 10, 0, duration);
    case "Home":
      return 0;
    case "End":
      return duration;
    default:
      return null;
  }
}

export type PlayerAction = "toggle" | "fullscreen" | "mute" | "back" | "forward";

/** Player shortcuts: Space/K play-pause, F fullscreen, M mute, J/L seek. */
export function playerKeyAction(key: string): PlayerAction | null {
  switch (key.length === 1 ? key.toLowerCase() : key) {
    case " ":
    case "k":
      return "toggle";
    case "f":
      return "fullscreen";
    case "m":
      return "mute";
    case "j":
      return "back";
    case "l":
      return "forward";
    default:
      return null;
  }
}

/** Swipe direction for a horizontal drag: 1 = next, -1 = previous, 0 = none. */
export function swipeStep(dx: number, dy: number, threshold = 48): -1 | 0 | 1 {
  if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.2) return 0;
  return dx < 0 ? 1 : -1;
}

/** The first line of an alt text (up to the first colon or full stop), used as a short caption. */
export function shortCaption(alt: string): string {
  const cut = alt.search(/[:.]/);
  return (cut > 0 ? alt.slice(0, cut) : alt).trim();
}

/** A curated selection: at most `perProject` items per project, in the given order. */
export function selectPerProject<T extends { project?: string }>(items: T[], perProject = 2): T[] {
  const seen = new Map<string, number>();
  return items.filter((item) => {
    const key = item.project ?? "";
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count < perProject;
  });
}

export type Shape = "banner" | "wide" | "square" | "tall" | "phone";

export function shapeOf(width: number, height: number): Shape {
  const ratio = width / Math.max(1, height);
  if (ratio >= 2) return "banner";
  if (ratio >= 1.2) return "wide";
  if (ratio >= 0.8) return "square";
  if (ratio >= 0.55) return "tall";
  return "phone";
}

export interface Placement {
  /** Columns spanned on the 12 column grid (wide screens). */
  span: number;
  /** Explicit start column for the first item of a row, so rows breathe. */
  start?: number;
  /** Vertical alignment inside its row. */
  align: "start" | "end" | "center";
  /** Columns spanned on the 6 column grid (phones and small tablets). */
  spanSm: number;
  startSm?: number;
}

const WIDE_SPANS = [7, 6, 8, 5];
const SQUARE_SPANS = [5, 4, 6];

function desiredSpan(shape: Shape, i: number): number {
  switch (shape) {
    case "banner":
      return 10;
    case "wide":
      return WIDE_SPANS[i % WIDE_SPANS.length];
    case "square":
      return SQUARE_SPANS[i % SQUARE_SPANS.length];
    case "tall":
      return 4;
    case "phone":
      return 3;
  }
}

/**
 * An editorial composition rather than a uniform grid: images keep their own
 * shape, rows are packed greedily on 12 columns, leftover columns become an
 * indent before the row (alternating side), and items in a row alternate
 * between top and bottom alignment. On small screens phones pair up two by two.
 */
export function composeGallery(items: { width: number; height: number }[]): Placement[] {
  const shapes = items.map((item) => shapeOf(item.width, item.height));
  const out: Placement[] = shapes.map(() => ({ span: 12, align: "start", spanSm: 6 }));

  // Wide screens.
  let row: number[] = [];
  let used = 0;
  let rowIndex = 0;
  const flush = () => {
    if (!row.length) return;
    const leftover = 12 - used;
    // Indent the row on alternating rows; the rest of the leftover trails.
    const indent = rowIndex % 2 === 1 ? Math.min(leftover, 2) : Math.min(leftover, 1);
    out[row[0]].start = 1 + indent;
    row.forEach((index, k) => {
      out[index].align = row.length === 1 ? "start" : k % 2 === (rowIndex % 2) ? "start" : "end";
    });
    rowIndex += 1;
    row = [];
    used = 0;
  };
  shapes.forEach((shape, i) => {
    const span = desiredSpan(shape, i);
    if (used + span > 12) flush();
    out[i].span = span;
    row.push(i);
    used += span;
  });
  flush();

  // Small screens: 6 columns. Phones and tall pages pair up; a lone one is indented.
  for (let i = 0; i < shapes.length; i++) {
    const narrow = shapes[i] === "phone" || shapes[i] === "tall";
    if (!narrow) {
      out[i].spanSm = 6;
      out[i].startSm = 1;
      continue;
    }
    const nextNarrow = i + 1 < shapes.length && (shapes[i + 1] === "phone" || shapes[i + 1] === "tall");
    if (nextNarrow) {
      out[i].spanSm = 3;
      out[i].startSm = 1;
      out[i + 1].spanSm = 3;
      out[i + 1].startSm = 4;
      i += 1;
    } else {
      out[i].spanSm = 4;
      out[i].startSm = 2;
    }
  }
  return out;
}
