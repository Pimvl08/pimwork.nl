"use client";

import { useSyncExternalStore } from "react";
import { sections } from "@/content/sections";
import { scrollToSection } from "@/lib/scroll";

/**
 * Which plate is in view. One IntersectionObserver for the whole chrome; the
 * header, the rail and the mobile bar all read from this tiny store.
 */
let active: string | null = null;
const listeners = new Set<() => void>();

function setActive(id: string | null) {
  if (id === active) return;
  active = id;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useActivePlate(): string | null {
  return useSyncExternalStore(subscribe, () => active, () => null);
}

/** Starts watching the plates on the current page. Returns a cleanup. */
export function startPlateTracking(): () => void {
  const nodes = sections
    .map((section) => document.getElementById(section.id))
    .filter((node): node is HTMLElement => node !== null);
  if (nodes.length === 0) {
    setActive(null);
    return () => {};
  }

  // The plate in view is the last one whose top has passed a line just above
  // the middle of the viewport (so the footer keeps the last plate active).
  const pick = () => {
    const line = window.innerHeight * 0.4;
    let current = nodes[0];
    for (const node of nodes) {
      if (node.getBoundingClientRect().top <= line) current = node;
    }
    setActive(current.id);
  };
  pick();

  // The observer only wakes us when a plate crosses the band; geometry decides.
  const observer = new IntersectionObserver(pick, { rootMargin: "-40% 0px -59% 0px" });
  nodes.forEach((node) => observer.observe(node));
  return () => observer.disconnect();
}

/** Scrolls to a plate on this page, or navigates home to it from another page. */
export function goToPlate(id: string, lang: string, navigate: (href: string) => void) {
  if (!scrollToSection(id)) navigate(`/${lang}#${id}`);
}

/** Click handler for links to `/<lang>#id`: smooth scroll when the plate is on this page. */
export function onPlateLinkClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (!document.getElementById(id)) return;
  event.preventDefault();
  scrollToSection(id);
}
