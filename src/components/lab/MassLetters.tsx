"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { labCopy } from "./copy";
import { letterTargets, settle, type LetterState } from "./letters";
import type { ExperimentProps } from "./types";
import styles from "./lab.module.css";

interface Motion {
  x: number;
  y: number;
  inside: boolean;
  vx: number;
  vy: number;
  lastT: number;
  scrollV: number;
}

/**
 * Experiment 05: a phrase whose letters gain weight near the cursor, lean
 * with its speed and stretch with the scroll. One rAF loop writes styles
 * straight to the spans, so React never re-renders per frame.
 */
export default function MassLetters({ lang, active, reducedMotion }: ExperimentProps) {
  const t = labCopy.mass[lang];
  const alt = labCopy.experiments[lang][4].alt;
  const phrase = t.phrase;
  const words = phrase.split(" ").map((w) => Array.from(w.normalize("NFC")));
  const surfaceRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const motion = useRef<Motion>({ x: 0, y: 0, inside: false, vx: 0, vy: 0, lastT: 0, scrollV: 0 });
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    const surface = surfaceRef.current;
    const els = letterRefs.current.filter((el): el is HTMLSpanElement => el !== null);
    if (!surface || els.length === 0) return;
    if (reducedMotion || !active) {
      if (reducedMotion) {
        for (const el of els) {
          el.style.transform = "";
          el.style.fontVariationSettings = "";
        }
      }
      wakeRef.current = () => {};
      return;
    }
    const states: LetterState[] = els.map(() => ({ wght: 400, opsz: 96, skew: 0, tx: 0, sx: 1, sy: 1 }));
    const m = motion.current;
    let raf = 0;
    let last = 0;
    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - (last || now)) / 1000));
      last = now;
      // Speeds fade when nothing new arrives.
      const fade = Math.exp(-dt / 0.22);
      m.vx *= fade;
      m.vy *= fade;
      m.scrollV *= Math.exp(-dt / 0.2);
      const width = surface.clientWidth;
      // Read phase: all letter centres first, then write.
      const centres = els.map((el) => ({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 }));
      let moving = false;
      for (let i = 0; i < els.length; i++) {
        const target = letterTargets({
          dx: centres[i].x - m.x,
          dy: centres[i].y - m.y,
          inside: m.inside,
          radius: Math.max(110, width * 0.17),
          vx: m.vx,
          vy: m.vy,
          scrollV: m.scrollV,
          index: i,
        });
        moving = settle(states[i], target, dt) || moving;
        const s = states[i];
        els[i].style.transform = `translateX(${s.tx.toFixed(2)}px) skewX(${s.skew.toFixed(2)}deg) scale(${s.sx.toFixed(3)}, ${s.sy.toFixed(3)})`;
        els[i].style.fontVariationSettings = `"wght" ${s.wght.toFixed(1)}, "opsz" ${s.opsz.toFixed(1)}`;
      }
      if (moving || m.inside || Math.abs(m.scrollV) > 0.01) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    wakeRef.current = wake;

    const onScroll = () => {
      const now = performance.now();
      const dtMs = Math.max(8, now - lastScrollT);
      const v = (window.scrollY - lastScrollY) / dtMs;
      lastScrollY = window.scrollY;
      lastScrollT = now;
      m.scrollV = m.scrollV * 0.6 + v * 0.4;
      wake();
    };
    const onHidden = () => {
      if (document.hidden && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!document.hidden) wake();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onHidden);
    wake();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      wakeRef.current = () => {};
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [active, reducedMotion]);

  const track = (x: number, y: number) => {
    const m = motion.current;
    const now = performance.now();
    if (m.inside && m.lastT) {
      const dtMs = Math.max(8, now - m.lastT);
      m.vx = m.vx * 0.55 + ((x - m.x) / dtMs) * 0.45;
      m.vy = m.vy * 0.55 + ((y - m.y) / dtMs) * 0.45;
    }
    m.x = x;
    m.y = y;
    m.lastT = now;
    m.inside = true;
    wakeRef.current();
  };

  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    track(event.clientX - r.left, event.clientY - r.top);
  };

  const leave = () => {
    motion.current.inside = false;
    motion.current.lastT = 0;
    if (markRef.current) markRef.current.style.opacity = "";
    wakeRef.current();
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const m = motion.current;
    const step = event.shiftKey ? 72 : 28;
    let { x, y } = m.inside ? m : { x: surface.clientWidth / 2, y: surface.clientHeight / 2 };
    if (event.key === "ArrowLeft") x -= step;
    else if (event.key === "ArrowRight") x += step;
    else if (event.key === "ArrowUp") y -= step;
    else if (event.key === "ArrowDown") y += step;
    else if (event.key === "Escape") return leave();
    else return;
    event.preventDefault();
    x = Math.min(surface.clientWidth, Math.max(0, x));
    y = Math.min(surface.clientHeight, Math.max(0, y));
    if (markRef.current) markRef.current.style.transform = `translate(${x}px, ${y}px)`;
    track(x, y);
  };

  const offsets = words.map((_, w) => words.slice(0, w).reduce((n, l) => n + l.length, 0));
  return (
    <div className={styles.exp}>
      <div
        ref={surfaceRef}
        className={cn(styles.surface, styles.massSurface, reducedMotion && styles.massStatic)}
        tabIndex={0}
        role="group"
        aria-roledescription={labCopy.stageRole[lang]}
        aria-label={`${t.stage}. ${alt}`}
        onPointerMove={reducedMotion ? undefined : onPointer}
        onPointerDown={reducedMotion ? undefined : onPointer}
        onPointerLeave={reducedMotion ? undefined : leave}
        onPointerCancel={reducedMotion ? undefined : leave}
        onBlur={leave}
        onKeyDown={reducedMotion ? undefined : onKey}
      >
        <span ref={markRef} className={styles.vpointer} aria-hidden="true" />
        <p className={styles.phrase}>
          <span className={styles.srOnly}>{phrase}</span>
          <span aria-hidden="true">
            {words.map((letters, w) => (
              <span key={`${w}-${letters.join("")}`}>
                <span className={styles.word}>
                  {letters.map((ch, c) => {
                    const i = offsets[w] + c;
                    return (
                      <span
                        key={`${ch}-${c}`}
                        ref={(node) => {
                          letterRefs.current[i] = node;
                        }}
                        className={styles.letter}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </span>
                {w < words.length - 1 ? " " : null}
              </span>
            ))}
          </span>
        </p>
      </div>
    </div>
  );
}
