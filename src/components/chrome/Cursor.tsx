"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/i18n/LocaleProvider";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { useUI } from "@/lib/store";
import styles from "./chrome.module.css";
import { chromeCopy } from "./copy";
import { cursorModeFor, followFactor, lerpAngle, type CursorMode } from "./logic";

const TYPING = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"], [contenteditable=""]';
const PRESSABLE = 'a[href], button, select, label, summary, [role="button"], input[type="checkbox"], input[type="radio"], input[type="range"], input[type="submit"], input[type="button"]';

/** Only with a mouse or trackpad and without reduced motion. */
export function Cursor() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  if (!fine || reduce) return null;
  return <CursorInner />;
}

function CursorInner() {
  const lang = useLang();
  const compass = useUI((s) => s.eggs.includes("compass"));
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const needleCoreRef = useRef<SVGSVGElement>(null);
  const langRef = useRef(lang);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    const wrap = wrapRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const needle = needleRef.current;
    const needleCore = needleCoreRef.current;
    const labelEl = labelRef.current;
    if (!wrap || !dot || !ring || !needle || !needleCore || !labelEl) return;

    root.dataset.cursorRoot = "custom";
    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const dotPos = { x: -100, y: -100 };
    let angle = 0;
    let angleTarget = 0;
    let frame = 0;
    let last = 0;
    let seen = false;
    let mode: CursorMode = "default";

    const place = (el: HTMLElement, p: { x: number; y: number }) => {
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const fr = followFactor(0.2, dt);
      const fd = followFactor(0.55, dt);
      ringPos.x += (target.x - ringPos.x) * fr;
      ringPos.y += (target.y - ringPos.y) * fr;
      dotPos.x += (target.x - dotPos.x) * fd;
      dotPos.y += (target.y - dotPos.y) * fd;
      angle = lerpAngle(angle, angleTarget, followFactor(0.16, dt));
      place(ring, ringPos);
      place(dot, dotPos);
      place(needle, ringPos);
      needleCore.style.transform = `rotate(${angle}deg)`;
      const settled =
        Math.abs(target.x - ringPos.x) < 0.1 &&
        Math.abs(target.y - ringPos.y) < 0.1 &&
        Math.abs(lerpAngle(angle, angleTarget, 1) - angle) < 0.1;
      frame = settled ? 0 : requestAnimationFrame(tick);
      if (settled) last = 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const setMode = (next: CursorMode, label: string) => {
      if (label && labelEl.textContent !== label) labelEl.textContent = label;
      if (next === mode) return;
      mode = next;
      wrap.dataset.mode = next;
    };

    const resolve = (el: Element | null) => {
      if (!el) return setMode("default", "");
      const marked = el.closest("[data-cursor]");
      if (marked) {
        const labels = chromeCopy.cursor;
        const lng = langRef.current;
        const r = cursorModeFor(marked.getAttribute("data-cursor"), marked.getAttribute("data-cursor-label"), {
          view: labels.view[lng],
          drag: labels.drag[lng],
          play: labels.play[lng],
        });
        return setMode(r.mode, r.label);
      }
      if (el.closest(TYPING)) return setMode("text", "");
      if (el.closest(PRESSABLE)) return setMode("link", "");
      setMode("default", "");
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        wrap.dataset.visible = "false";
        return;
      }
      const dx = event.clientX - target.x;
      const dy = event.clientY - target.y;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!seen) {
        seen = true;
        ringPos.x = dotPos.x = target.x;
        ringPos.y = dotPos.y = target.y;
      } else if (dx * dx + dy * dy > 4) {
        // The compass needle points where the hand travels (0deg = up).
        angleTarget = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      }
      wrap.dataset.visible = "true";
      wake();
    };
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "touch") resolve(event.target as Element | null);
    };
    const onDown = () => {
      wrap.dataset.pressed = "true";
    };
    const onUp = () => {
      wrap.dataset.pressed = "false";
    };
    const onLeave = () => {
      wrap.dataset.visible = "false";
      // Coming back in should not glide across the screen from the exit point.
      seen = false;
    };
    // Fallback for browsers that skip mouseleave on <html>: leaving the window has no relatedTarget.
    const onOut = (event: MouseEvent) => {
      if (!event.relatedTarget) onLeave();
    };
    // Content can scroll under a resting pointer: re-read what is beneath it.
    let lastProbe = 0;
    const onScroll = () => {
      const now = performance.now();
      if (!seen || now - lastProbe < 120) return;
      lastProbe = now;
      resolve(document.elementFromPoint(target.x, target.y));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    root.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseout", onOut);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      delete root.dataset.cursorRoot;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.cursor} data-mode="default" data-visible="false" data-pressed="false" data-compass={compass} aria-hidden="true">
      <div ref={ringRef} className={styles.cRing}>
        <div className={styles.cRingCore}>
          <span ref={labelRef} className={styles.cLabel} />
        </div>
      </div>
      <div ref={dotRef} className={styles.cDot}>
        <div className={styles.cDotCore} />
      </div>
      <div ref={needleRef} className={styles.cNeedle}>
        <svg ref={needleCoreRef} className={styles.cNeedleCore} viewBox="0 0 32 32" focusable="false">
          <path d="M16 3 L20 16 L12 16 Z" fill="currentColor" />
          <path d="M12 16 L20 16 L16 29 Z" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="1.6" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
