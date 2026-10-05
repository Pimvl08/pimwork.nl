"use client";

import { useEffect, useRef } from "react";
import { CircleButton } from "@/components/ui/CircleButton";
import { useReducedMotion } from "@/lib/hooks";
import styles from "./easter.module.css";

const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const STEP_MS = 55;

interface Drop {
  y: number;
  speed: number;
}

/**
 * "Letterregen": columns of falling Bodoni italic letters and Fragment Mono
 * digits, ink on paper. Esc, a click or the close button ends it. Reduced
 * motion gets one still frame.
 */
export function LetterRain({ onClose, label, closeLabel, hint }: { onClose: () => void; label: string; closeLabel: string; hint: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const root = document.documentElement;
    let paper = "";
    let ink = "";
    const readColours = () => {
      const css = getComputedStyle(root);
      paper = css.getPropertyValue("--paper").trim() || "Canvas";
      ink = css.getPropertyValue("--ink").trim() || "CanvasText";
    };
    readColours();
    const css = getComputedStyle(root);
    const serif = css.getPropertyValue("--font-bodoni").trim() || "Georgia, serif";
    const mono = css.getPropertyValue("--font-fragment").trim() || "ui-monospace, monospace";

    let width = 0;
    let height = 0;
    let size = 22;
    let drops: Drop[] = [];

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = width < 640 ? 18 : 24;
      const cols = Math.ceil(width / (size * 0.95));
      drops = Array.from({ length: cols }, () => ({ y: -Math.random() * (height / size), speed: 0.45 + Math.random() * 0.6 }));
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, width, height);
    };

    const step = () => {
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      ctx.fillStyle = ink;
      ctx.textBaseline = "top";
      drops.forEach((drop, i) => {
        const digit = Math.random() < 0.28;
        const glyph = digit ? DIGITS[(Math.random() * DIGITS.length) | 0] : LETTERS[(Math.random() * LETTERS.length) | 0];
        ctx.font = digit ? `${Math.round(size * 0.82)}px ${mono}` : `italic ${size}px ${serif}`;
        ctx.fillText(glyph, i * size * 0.95, drop.y * size);
        drop.y += drop.speed;
        if (drop.y * size > height && Math.random() > 0.96) drop.y = -Math.random() * 6;
      });
    };

    resize();

    if (reduced) {
      // One still frame: run the rain forward without animating it.
      for (let i = 0; i < 90; i++) step();
      return;
    }

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < STEP_MS) return;
      last = now;
      step();
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    const onTheme = () => {
      requestAnimationFrame(() => {
        readColours();
        ctx.fillStyle = paper;
        ctx.fillRect(0, 0, width, height);
      });
    };

    start();
    window.addEventListener("resize", resize);
    window.addEventListener("pim:theme", onTheme);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pim:theme", onTheme);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div role="dialog" aria-modal="true" aria-label={label} className={styles.rain} onClick={onClose}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <p className={styles.rainHint}>{hint}</p>
      <CircleButton
        icon="close"
        label={closeLabel}
        size="md"
        className={styles.rainClose}
        autoFocus
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
    </div>
  );
}
