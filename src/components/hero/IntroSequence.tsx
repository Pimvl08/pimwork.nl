"use client";

import { useCallback, useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ArchButton } from "@/components/ui/ArchButton";
import type { Locale } from "@/i18n/config";
import { useReducedMotion } from "@/lib/hooks";
import { lockScroll, scrollToSection } from "@/lib/scroll";
import { uiStore, useUI } from "@/lib/store";
import { heroCopy } from "./copy";
import { INTRO, splitWords, wordDelay } from "./logic";
import { playFoldSound } from "./sound";
import styles from "./hero.module.css";

export interface IntroLines {
  line1: string;
  line2: string;
}

/**
 * Mounted on the cover; shows the paper overlay while uiStore.introState is
 * "playing" (from the Explore button, or anything else that sets it).
 * Reduced motion never plays it: it goes straight to the about plate.
 */
export function IntroSequence({ lang, lines }: { lang: Locale; lines: IntroLines }) {
  const state = useUI((s) => s.introState);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (state !== "playing" || !reduce) return;
    uiStore.set({ introState: "done" });
    scrollToSection("about");
  }, [state, reduce]);

  if (state !== "playing" || reduce) return null;
  return createPortal(<IntroOverlay lang={lang} lines={lines} />, document.body);
}

function IntroOverlay({ lang, lines }: { lang: Locale; lines: IntroLines }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const revealed = useRef(false);
  const timers = useRef<number[]>([]);
  const descriptionId = "intro-description";
  // The crease is drawn in screen pixels so its dash draw stays one clean stroke.
  const [box, setBox] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  useEffect(() => {
    const onResize = () => setBox({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    timers.current.forEach((t) => window.clearTimeout(t));
    lockScroll(false);
    uiStore.set({ introState: "done" });
    // After the overlay is gone: land on the about plate and focus its heading.
    requestAnimationFrame(() => scrollToSection("about", { immediate: true }));
  }, []);

  /** The crease is drawn: put the about plate behind the sheet, then the fold reveals it. */
  const reveal = useCallback(() => {
    if (revealed.current || finished.current) return;
    revealed.current = true;
    lockScroll(false);
    scrollToSection("about", { immediate: true });
    rootRef.current?.querySelector<HTMLElement>("[data-intro-skip]")?.focus({ preventScroll: true });
    lockScroll(true);
    if (uiStore.get().soundOn) playFoldSound();
  }, []);

  // The CSS timeline leads; JavaScript follows its events, so a slow first
  // frame can never cut the fold short. animationend bubbles to the dialog.
  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.animationName.includes("intro-crease-draw")) reveal();
    else if (event.animationName.includes("intro-sheet-out")) finish();
  };

  useEffect(() => {
    const skip = () => rootRef.current?.querySelector<HTMLElement>("[data-intro-skip]");
    lockScroll(true);
    skip()?.focus({ preventScroll: true });
    // Safety net in case animation events never arrive.
    timers.current.push(window.setTimeout(finish, INTRO.total + 1500));

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        finish();
      } else if (event.key === "Tab") {
        // The skip button is the only control: keep focus inside the dialog.
        event.preventDefault();
        skip()?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const pending = timers.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      pending.forEach((t) => window.clearTimeout(t));
      if (!finished.current) lockScroll(false);
    };
  }, [finish]);

  const words1 = splitWords(lines.line1);
  const words2 = splitWords(lines.line2);
  const timing = {
    "--sheet-in": `${INTRO.sheetIn}ms`,
    "--word-dur": `${INTRO.wordDuration}ms`,
    "--crease-start": `${INTRO.creaseStart}ms`,
    "--crease-dur": `${INTRO.creaseDuration}ms`,
    "--fold-start": `${INTRO.foldStart}ms`,
    "--fold-dur": `${INTRO.foldDuration}ms`,
    "--fade-start": `${INTRO.total - 260}ms`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={styles.intro}
      role="dialog"
      aria-modal="true"
      aria-label={heroCopy.intro.label[lang]}
      aria-describedby={descriptionId}
      style={timing}
      onAnimationEnd={onAnimationEnd}
    >
      <div className={styles.introSheet}>
        <div className={styles.introText} aria-hidden="true">
          <p className={styles.introLine1}>
            {words1.map((word, i) => (
              <span key={`a${i}`} className={styles.introWord} style={{ animationDelay: `${wordDelay(1, i)}ms` }}>
                {word}
              </span>
            ))}
          </p>
          <p className={styles.introLine2}>
            {words2.map((word, i) => (
              <span key={`b${i}`} className={styles.introWord} style={{ animationDelay: `${wordDelay(2, i)}ms` }}>
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>
      <p id={descriptionId} className="sr-only">
        {lines.line1} {lines.line2}
      </p>
      <svg className={styles.introCrease} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true" focusable="false">
        <path d={`M0 ${(box.h * 0.62).toFixed(1)} L${box.w} ${(box.h * 0.38).toFixed(1)}`} pathLength={1} />
      </svg>
      <div className={styles.introSkip}>
        <ArchButton variant="secondary" onClick={finish} data-intro-skip="">
          {heroCopy.intro.skip[lang]}
        </ArchButton>
      </div>
    </div>
  );
}
