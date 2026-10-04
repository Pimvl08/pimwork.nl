"use client";

import { flushSync } from "react-dom";
import { persistTheme } from "./prefs";
import { uiStore, type Theme } from "./store";

/**
 * Switches theme for the whole interface: the <html data-theme> attribute
 * drives every CSS token, the WebGL shell and the charts read the same
 * tokens, and the choice is stored in a cookie so the server renders the
 * right paper on the next visit (no flash, no inline script).
 *
 * When supported, the new paper unfolds as a circle from `origin`.
 */
export function applyTheme(theme: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const commit = () => {
    root.dataset.theme = theme;
    flushSync(() => uiStore.set({ theme }));
  };
  persistTheme(theme);
  window.dispatchEvent(new CustomEvent("pim:theme", { detail: theme }));

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("startViewTransition" in document) || reduce) {
    commit();
    return;
  }
  if (origin) {
    root.style.setProperty("--vt-x", `${origin.x}px`);
    root.style.setProperty("--vt-y", `${origin.y}px`);
  }
  document.startViewTransition(commit);
}

export function toggleTheme(origin?: { x: number; y: number }) {
  applyTheme(uiStore.get().theme === "dark" ? "light" : "dark", origin);
}

/** Reads a CSS custom property holding "r g b" floats (0..1) for WebGL. */
export function readGlColor(name: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) return [parts[0], parts[1], parts[2]];
  return [0.5, 0.5, 0.5];
}
