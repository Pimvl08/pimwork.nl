"use client";

import { useEffect } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { springSettled, springStep, type SpringState } from "./logic";

/**
 * Subtle pointer parallax on the cover: every element inside #cover with a
 * data-depth attribute drifts by up to that many pixels. Fine pointers only,
 * off under reduced motion. Renders nothing.
 */
export function HeroParallax({ sectionId = "cover" }: { sectionId?: string }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();

  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section || !fine || reduce) return;
    const layers = Array.from(section.querySelectorAll<HTMLElement>("[data-depth]")).map((el) => ({
      el,
      depth: Number(el.dataset.depth) || 0,
    }));
    if (!layers.length) return;

    let x: SpringState = { x: 0, v: 0 };
    let y: SpringState = { x: 0, v: 0 };
    const target = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;

    const apply = () => {
      for (const layer of layers) {
        layer.el.style.transform = `translate3d(${(x.x * layer.depth).toFixed(2)}px, ${(y.x * layer.depth).toFixed(2)}px, 0)`;
      }
    };
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      x = springStep(x, target.x, 7, dt);
      y = springStep(y, target.y, 7, dt);
      apply();
      if (springSettled(x, target.x, 5e-4) && springSettled(y, target.y, 5e-4)) {
        raf = 0;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0) return;
      target.x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      wake();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      wake();
    };
    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      for (const layer of layers) layer.el.style.transform = "";
    };
  }, [fine, reduce, sectionId]);

  return null;
}
