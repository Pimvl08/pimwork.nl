"use client";

/**
 * One place to scroll to an element by id, used by links, keyboard shortcuts
 * and the command palette. Uses native scrolling, smooth unless the visitor
 * prefers reduced motion.
 */
export function scrollToSection(id: string, options: { immediate?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce || options.immediate ? "auto" : "smooth", block: "start" });
  // Move focus for keyboard and screen reader users without a second jump.
  const heading = el.querySelector<HTMLElement>("h1, h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
  if (history.replaceState) history.replaceState(null, "", `#${id}`);
  return true;
}

/** Locks page scrolling while an overlay (palette, lightbox, project sheet) is open. */
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
