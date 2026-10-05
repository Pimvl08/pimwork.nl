/**
 * Pure helpers for the project media (lightbox and video player). No DOM, no React: unit tested
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
