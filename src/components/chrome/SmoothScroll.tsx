"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { registerScroller } from "@/lib/scroll";
import { uiStore, useUI } from "@/lib/store";

/**
 * Lenis smooth scrolling for wheel and trackpad. Off under reduced motion
 * (native scrolling then), paused while the terminal is open. Elements with
 * data-lenis-prevent (dialogs, scrollable panels) keep native scrolling.
 */
export function SmoothScroll() {
  const reduce = useReducedMotion();
  const terminalOpen = useUI((s) => s.terminalOpen);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      autoRaf: true,
      anchors: false,
      prevent: (node) => node.closest?.('[aria-modal="true"]') != null,
    });
    lenisRef.current = lenis;
    registerScroller(lenis);
    if (uiStore.get().terminalOpen) lenis.stop();
    return () => {
      registerScroller(null);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduce]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (terminalOpen) lenis.stop();
    else lenis.start();
  }, [terminalOpen]);

  return null;
}
