"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useVisible } from "@/lib/hooks";
import { readGlColor } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { restParams } from "./camera";
import { clamp, FOLD_RANGE, pointerToPose, REST_FOLD, springStep, type SpringState } from "./logic";
import { createShellRenderer, type ShellRenderer } from "./shellRenderer";
import styles from "./hero.module.css";

interface ShellCanvasProps {
  onReady: () => void;
  onLost: () => void;
  onFail: () => void;
  className?: string;
}

const OMEGA = 5.2;

function readColors() {
  return { sheet: readGlColor("--gl-sheet"), ink: readGlColor("--gl-ink"), paper: readGlColor("--gl-paper") };
}

/**
 * The live shell. The pointer bends the crease (x sets the fold, y the
 * twist) through a critically damped spring; touch bends it by dragging
 * sideways. The loop only runs while visible and the tab is shown.
 */
export default function ShellCanvas({ onReady, onLost, onFail, className }: ShellCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ShellRenderer | null>(null);
  const reduce = useReducedMotion();
  const visible = useVisible(canvasRef);
  const [pageShown, setPageShown] = useState(true);
  const [alive, setAlive] = useState(false);
  const callbacks = useRef({ onReady, onLost, onFail });
  const motion = useRef({
    fold: { x: REST_FOLD, v: 0 } as SpringState,
    twist: { x: 0, v: 0 } as SpringState,
    target: { fold: REST_FOLD, twist: 0 },
    drag: null as null | { id: number; startX: number; startFold: number },
  });

  useEffect(() => {
    callbacks.current = { onReady, onLost, onFail };
  });

  // Renderer lifecycle: create, size, theme, context loss, dispose.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createShellRenderer(canvas);
    if (!renderer) {
      callbacks.current.onFail();
      return;
    }
    rendererRef.current = renderer;
    renderer.setColors(readColors());
    renderer.setParams(restParams);
    renderer.resize();
    renderer.render(true);
    setAlive(true);
    const ready = requestAnimationFrame(() => callbacks.current.onReady());

    const observer = new ResizeObserver(() => {
      renderer.resize();
      renderer.render(true);
    });
    observer.observe(canvas);
    const onTheme = () => {
      renderer.setColors(readColors());
      renderer.render(true);
    };
    const onLostEvent = (event: Event) => {
      event.preventDefault();
      setAlive(false);
      callbacks.current.onLost();
    };
    const onRestored = () => {
      if (!renderer.restore()) {
        callbacks.current.onFail();
        return;
      }
      renderer.setColors(readColors());
      renderer.resize();
      renderer.render(true);
      setAlive(true);
      callbacks.current.onReady();
    };
    window.addEventListener("pim:theme", onTheme);
    canvas.addEventListener("webglcontextlost", onLostEvent);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      cancelAnimationFrame(ready);
      observer.disconnect();
      window.removeEventListener("pim:theme", onTheme);
      canvas.removeEventListener("webglcontextlost", onLostEvent);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => setPageShown(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Reduced motion: one still frame at rest, no loop, no bending.
  useEffect(() => {
    if (!reduce || !alive) return;
    const renderer = rendererRef.current;
    const m = motion.current;
    m.fold = { x: REST_FOLD, v: 0 };
    m.twist = { x: 0, v: 0 };
    renderer?.setParams(restParams);
    renderer?.render(true);
  }, [reduce, alive]);

  // Mouse: the pointer anywhere over the cover bends the crease.
  useEffect(() => {
    if (reduce) return;
    const m = motion.current;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || m.drag) return;
      const cover = canvasRef.current?.closest("section") ?? document.body;
      const rect = cover.getBoundingClientRect();
      const inside = event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) {
        m.target = { fold: REST_FOLD, twist: 0 };
        return;
      }
      m.target = pointerToPose((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    };
    const onLeave = () => {
      m.target = { fold: REST_FOLD, twist: 0 };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  // The loop: springs towards the target, with a slow breathing fold.
  useEffect(() => {
    if (reduce || !visible || !pageShown || !alive) return;
    let raf = 0;
    let last = performance.now();
    const m = motion.current;
    const tick = (now: number) => {
      const renderer = rendererRef.current;
      if (!renderer) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const breathe = Math.sin(t * 0.9) * 0.022 + Math.sin(t * 0.37 + 1.3) * 0.012;
      m.fold = springStep(m.fold, clamp(m.target.fold + breathe, FOLD_RANGE[0], FOLD_RANGE[1]), OMEGA, dt);
      m.twist = springStep(m.twist, m.target.twist, OMEGA, dt);
      renderer.setParams({ ...restParams, fold: m.fold.x, twist: m.twist.x });
      renderer.render();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, visible, pageShown, alive]);

  // Touch and pen: drag sideways on the canvas to bend; vertical scroll stays native (pan-y).
  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (reduce || event.pointerType === "mouse") return;
    const m = motion.current;
    m.drag = { id: event.pointerId, startX: event.clientX, startFold: m.target.fold };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const m = motion.current;
    if (!m.drag || m.drag.id !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const fold = clamp(m.drag.startFold + ((event.clientX - m.drag.startX) / rect.width) * 1.25, FOLD_RANGE[0], FOLD_RANGE[1]);
    const { twist } = pointerToPose(0, (event.clientY - rect.top) / rect.height);
    m.target = { fold, twist };
  };
  const endDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const m = motion.current;
    if (m.drag?.id === event.pointerId) m.drag = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn(styles.canvas, className)}
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    />
  );
}
