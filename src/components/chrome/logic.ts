import { sections } from "@/content/sections";

/* Pure helpers for the chrome, kept free of React and the DOM so they can be unit tested. */

export type ShortcutAction =
  | { type: "terminal" }
  | { type: "sheet" }
  | { type: "theme" }
  | { type: "lang" }
  | { type: "plate"; id: string }
  | { type: "escape" };

export interface KeyInput {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  /** Focus is in an input, textarea, select or contenteditable. */
  typing: boolean;
  terminalOpen: boolean;
  /** Another modal (the mobile menu) is open and owns the keyboard. */
  modalOpen: boolean;
  composing?: boolean;
}

/** Maps a keydown to a site shortcut, or null when the key belongs to someone else. */
export function shortcutFor(input: KeyInput): ShortcutAction | null {
  if (input.composing) return null;
  const { key } = input;
  // Ctrl/Cmd+K opens the terminal even from a form field; once open, the terminal owns the key.
  if ((input.ctrl || input.meta) && !input.alt && key.toLowerCase() === "k") {
    return input.terminalOpen ? null : { type: "terminal" };
  }
  if (key === "Escape") return input.terminalOpen ? null : { type: "escape" };
  if (input.ctrl || input.meta || input.alt) return null;
  if (input.typing || input.terminalOpen || input.modalOpen) return null;
  if (key === "?") return { type: "sheet" };
  const lower = key.toLowerCase();
  if (lower === "t") return { type: "theme" };
  if (lower === "l") return { type: "lang" };
  const plate = sections.find((section) => section.key === key);
  return plate ? { type: "plate", id: plate.id } : null;
}

export type CursorMode = "default" | "link" | "disc" | "text";

const DISC_KINDS = new Set(["view", "drag", "play"]);

/**
 * Resolves a `data-cursor` value. Known kinds map to a mode; any other value
 * (ArchButton passes its label, for example "Bekijk") becomes a disc with
 * that text.
 */
export function cursorModeFor(
  value: string | null | undefined,
  label: string | null | undefined,
  defaults: { view: string; drag: string; play: string },
): { mode: CursorMode; label: string } {
  const v = (value ?? "").trim();
  if (!v || v === "default" || v === "none") return { mode: "default", label: "" };
  if (v === "link") return { mode: "link", label: "" };
  if (v === "text") return { mode: "text", label: "" };
  if (DISC_KINDS.has(v)) {
    return { mode: "disc", label: label?.trim() || defaults[v as keyof typeof defaults] };
  }
  return { mode: "disc", label: label?.trim() || v };
}

/** Frame-rate independent smoothing factor: `base` is the share covered per 60 fps frame. */
export function followFactor(base: number, dtMs: number): number {
  return 1 - Math.pow(1 - base, Math.max(0, dtMs) / (1000 / 60));
}

/** Moves an angle (degrees) toward a target along the shortest way round. */
export function lerpAngle(from: number, to: number, t: number): number {
  const diff = ((((to - from) % 360) + 540) % 360) - 180;
  return from + diff * t;
}

export const PRELOAD_MIN = 700;
export const PRELOAD_MAX = 1800;

/**
 * The preloader percentage: real milestones (hydrated, fonts ready, window
 * loaded) capped by time, so it never reaches 100 before PRELOAD_MIN and
 * always does by PRELOAD_MAX.
 */
export function preloadTarget(elapsed: number, fontsReady: boolean, loaded: boolean): number {
  if (elapsed >= PRELOAD_MAX) return 100;
  const real = 34 + (fontsReady ? 33 : 0) + (loaded ? 33 : 0);
  const timeCap = 100 * Math.min(1, Math.max(0, elapsed) / PRELOAD_MIN);
  return Math.min(real, timeCap);
}

export function preloadDone(elapsed: number, fontsReady: boolean, loaded: boolean): boolean {
  return elapsed >= PRELOAD_MAX || (fontsReady && loaded && elapsed >= PRELOAD_MIN);
}

/**
 * Horizontal offset (px) of rail item `index` so the dots sit on one
 * compass arc bulging toward the content: x = bulge * (1 - t^2).
 */
export function railArcOffset(index: number, count: number, bulge: number): number {
  if (count < 2) return 0;
  const t = (index - (count - 1) / 2) / ((count - 1) / 2);
  return Math.round(bulge * (1 - t * t) * 10) / 10;
}

/** True when `pathname` is the home page of `lang` (where the plates live). */
export function isHomePath(pathname: string | null | undefined, lang: string): boolean {
  if (!pathname) return false;
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === `/${lang}` || trimmed === "";
}
