"use client";

import { useEffect, useRef, useState } from "react";
import { CreaseMark } from "@/components/ui/CreaseMark";
import { useCopy } from "@/i18n/LocaleProvider";
import styles from "./chrome.module.css";
import { chromeCopy } from "./copy";
import { followFactor, preloadDone, preloadTarget } from "./logic";

const KEY = "pim-preloaded";
const LIFT_MS = 950;

type Phase = "off" | "in" | "lift";

function announce() {
  window.dispatchEvent(new CustomEvent("pim:preloaded"));
}

/**
 * First visit per browser session only, never with reduced motion. It starts
 * after hydration as an overlay, so the server-rendered page (and its LCP
 * text) paints first. The crease draws while a real percentage follows the
 * fonts and the window load, then the paper lifts away along an arc.
 */
export function Preloader() {
  const [phase, setPhase] = useState<Phase>("off");
  const countRef = useRef<HTMLSpanElement>(null);
  const creaseRef = useRef<SVGPathElement>(null);
  const status = useCopy(chromeCopy.preloader.status);

  // Decide once, after hydration.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let first = false;
    try {
      first = window.sessionStorage.getItem(KEY) !== "1";
      window.sessionStorage.setItem(KEY, "1");
    } catch {
      first = false;
    }
    if (reduce || !first) {
      announce();
      return;
    }
    const frame = requestAnimationFrame(() => setPhase("in"));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Count up while the page settles; any input skips.
  useEffect(() => {
    if (phase !== "in") return;
    const start = performance.now();
    let fontsReady = false;
    let loaded = document.readyState === "complete";
    let shown = 0;
    let last = start;
    let frame = 0;
    let finished = false;

    document.fonts?.ready.then(() => {
      fontsReady = true;
    });
    if (!document.fonts) fontsReady = true;
    const onLoad = () => {
      loaded = true;
    };
    window.addEventListener("load", onLoad, { once: true });

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      requestAnimationFrame(() => setPhase("lift"));
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const goal = preloadTarget(elapsed, fontsReady, loaded);
      shown += (goal - shown) * followFactor(0.14, now - last);
      last = now;
      const done = preloadDone(elapsed, fontsReady, loaded);
      if (done && goal >= 100 && shown > 99.2) shown = 100;
      const value = Math.round(shown);
      if (countRef.current) countRef.current.textContent = String(value);
      if (creaseRef.current) creaseRef.current.style.strokeDashoffset = String(1 - shown / 100);
      if (shown >= 100) {
        finish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [phase]);

  // Leave the stage once the paper has lifted.
  useEffect(() => {
    if (phase !== "lift") return;
    announce();
    const timer = window.setTimeout(() => setPhase("off"), LIFT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "off") return null;

  return (
    <div className={styles.pre} data-phase={phase} aria-hidden="true">
      <div className={styles.preStage}>
        <div className={styles.preMark}>
          <CreaseMark size={112} className={styles.preGhost} />
          <svg className={styles.preDraw} viewBox="0 0 64 64" focusable="false">
            <path ref={creaseRef} d="M12 52 C 22 44 36 26 42 4.5" pathLength={1} />
          </svg>
        </div>
        <p className={styles.preCount}>
          <span ref={countRef} className="data">
            0
          </span>
          <span className="data">%</span>
        </p>
        <p className={`label ${styles.preStatus}`}>{status}</p>
      </div>
    </div>
  );
}
