"use client";

/**
 * One place to scroll to a plate, used by the rail, the header, keyboard
 * shortcuts and terminal commands. SmoothScroll registers its Lenis instance
 * here; without it (reduced motion, no JS yet) native scrolling is used.
 */
interface Scroller {
  scrollTo(target: HTMLElement | number, options?: { offset?: number; immediate?: boolean; duration?: number }): void;
  stop(): void;
  start(): void;
}

let scroller: Scroller | null = null;

export function registerScroller(instance: Scroller | null) {
  scroller = instance;
}

export function scrollToSection(id: string, options: { immediate?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (scroller) {
    scroller.scrollTo(el, { offset: 0, immediate: options.immediate, duration: 1.4 });
  } else {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce || options.immediate ? "auto" : "smooth", block: "start" });
  }
  // Move focus for keyboard and screen reader users without a second jump.
  const heading = el.querySelector<HTMLElement>("h1, h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
  if (history.replaceState) history.replaceState(null, "", `#${id}`);
  return true;
}

/** Pauses smooth scrolling while an overlay (terminal, lightbox) is open. */
export function lockScroll(locked: boolean) {
  if (scroller) {
    if (locked) scroller.stop();
    else scroller.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
