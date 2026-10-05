"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { CircleButton } from "@/components/ui/CircleButton";
import { useReducedMotion, useVisible } from "@/lib/hooks";
import { useUI } from "@/lib/store";
import { heroCopy, introPhrases, introSentence } from "./copy";
import { nextIndex } from "./logic";
import styles from "./hero.module.css";

const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const CYCLE_MS = 4000;

/**
 * "bouwt [werkende apps] met code en AI." The bracketed phrase is a button
 * that folds over a horizontal crease to the next real category. It also
 * turns slowly on its own while visible, paused on hover and focus, never
 * under reduced motion. Screen readers hear the change only on user action.
 */
export function IntroLine({ lang, name, projectNames }: { lang: Locale; name: string; projectNames: Record<string, string> }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLParagraphElement>(null);
  const faceRef = useRef<HTMLSpanElement>(null);
  const visible = useVisible(rootRef);
  const introPlaying = useUI((s) => s.introState === "playing");
  const [index, setIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageShown, setPageShown] = useState(true);
  const busy = useRef(false);
  const unfoldNext = useRef(false);
  const hintId = useId();

  const phrase = introPhrases[index];
  const projectName = projectNames[phrase.slug];

  const advance = useCallback(
    (fromUser: boolean) => {
      if (busy.current) return;
      const next = nextIndex(index, introPhrases.length);
      const commit = () => {
        unfoldNext.current = !reduce;
        setIndex(next);
        if (fromUser) setAnnouncement(introSentence(name, introPhrases[next], lang));
      };
      const face = faceRef.current;
      if (reduce || !face || typeof face.animate !== "function") {
        commit();
        return;
      }
      busy.current = true;
      // First half of the fold: the phrase turns away over its crease.
      const away = face.animate(
        [
          { transform: "rotateX(0deg)", opacity: 1 },
          { transform: "rotateX(86deg)", opacity: 0.2 },
        ],
        { duration: 190, easing: EXPO, fill: "forwards" },
      );
      away.onfinish = commit;
      away.oncancel = () => {
        busy.current = false;
      };
    },
    [index, lang, name, reduce],
  );

  // Second half: the new phrase unfolds from behind the crease.
  useLayoutEffect(() => {
    const face = faceRef.current;
    if (!unfoldNext.current || !face) {
      busy.current = false;
      return;
    }
    unfoldNext.current = false;
    face.getAnimations().forEach((animation) => animation.cancel());
    const back = face.animate(
      [
        { transform: "rotateX(-86deg)", opacity: 0.2 },
        { transform: "rotateX(0deg)", opacity: 1 },
      ],
      { duration: 620, easing: EXPO },
    );
    const done = () => {
      busy.current = false;
    };
    back.onfinish = done;
    back.oncancel = done;
  }, [index]);

  useEffect(() => {
    const onVisibility = () => setPageShown(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Slow automatic turn while the line is on screen.
  useEffect(() => {
    if (reduce || !visible || hovered || focused || !pageShown || introPlaying) return;
    const timer = window.setTimeout(() => advance(false), CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [advance, reduce, visible, hovered, focused, pageShown, introPlaying, index]);

  return (
    <p
      ref={rootRef}
      className={styles.introLine}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <span>{heroCopy.lead[lang]} </span>
      <button
        type="button"
        className={styles.phrase}
        onClick={() => advance(true)}
        aria-describedby={hintId}
        data-cursor="link"
      >
        <span ref={faceRef} className={styles.phraseFace}>
          {phrase.label[lang]}
        </span>
      </button>
      <span> {heroCopy.tail[lang]}</span>
      {projectName ? (
        <CircleButton
          href={`/${lang}/werk/${phrase.slug}`}
          icon="arrowNE"
          size="md"
          label={`${heroCopy.projectLink[lang]}: ${projectName}`}
          className={styles.phraseLink}
        />
      ) : null}
      <span id={hintId} className="sr-only">
        {heroCopy.phraseHint[lang]}
      </span>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </p>
  );
}
