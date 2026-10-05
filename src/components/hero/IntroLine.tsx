"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n/config";
import { useReducedMotion, useVisible } from "@/lib/hooks";
import { heroCopy, introPhrases, introSentence } from "./copy";
import { nextIndex } from "./logic";
import styles from "./hero.module.css";

const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const CYCLE_MS = 4200;

const wordsOf = (face: HTMLElement | null) => (face ? Array.from(face.querySelectorAll<HTMLElement>("[data-word]")) : []);

/**
 * "Ik bouw software die werk uit handen neemt, zoals [een trainingsapp ...]."
 * The bracketed example is a button that folds over a horizontal crease to
 * the next real project, word by word. It also turns slowly on its own while visible,
 * paused on hover and focus, never under reduced motion. Invisible copies of
 * every example reserve the height of the longest, so nothing below jumps.
 * Screen readers hear the change only on user action.
 */
export function IntroLine({ lang, projectNames }: { lang: Locale; projectNames: Record<string, string> }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLSpanElement>(null);
  const visible = useVisible(rootRef);
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
        if (fromUser) setAnnouncement(introSentence(introPhrases[next], lang));
      };
      const words = wordsOf(faceRef.current);
      if (reduce || !words.length || typeof words[0].animate !== "function") {
        commit();
        return;
      }
      busy.current = true;
      // First half of the fold: the words turn away over their crease, left to right.
      const animations = words.map((word, i) =>
        word.animate(
          [
            { transform: "perspective(420px) rotateX(0deg)", opacity: 1 },
            { transform: "perspective(420px) rotateX(86deg)", opacity: 0.15 },
          ],
          { duration: 200, delay: i * 22, easing: EXPO, fill: "forwards" },
        ),
      );
      const last = animations[animations.length - 1];
      last.onfinish = commit;
      last.oncancel = () => {
        busy.current = false;
      };
    },
    [index, lang, reduce],
  );

  // Second half: the new words unfold from behind the crease.
  useLayoutEffect(() => {
    const words = wordsOf(faceRef.current);
    if (!unfoldNext.current || !words.length) {
      busy.current = false;
      return;
    }
    unfoldNext.current = false;
    const animations = words.map((word, i) =>
      word.animate(
        [
          { transform: "perspective(420px) rotateX(-86deg)", opacity: 0.15 },
          { transform: "perspective(420px) rotateX(0deg)", opacity: 1 },
        ],
        { duration: 620, delay: i * 26, easing: EXPO, fill: "backwards" },
      ),
    );
    const done = () => {
      busy.current = false;
    };
    animations[animations.length - 1].onfinish = done;
    animations[animations.length - 1].oncancel = done;
  }, [index]);

  useEffect(() => {
    const onVisibility = () => setPageShown(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Slow automatic turn while the line is on screen.
  useEffect(() => {
    if (reduce || !visible || hovered || focused || !pageShown) return;
    const timer = window.setTimeout(() => advance(false), CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [advance, reduce, visible, hovered, focused, pageShown, index]);

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      advance(true);
    }
  };

  const words = phrase.label[lang].split(" ");

  return (
    <div
      ref={rootRef}
      className={styles.intro}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <p className={styles.introLine}>
        {introPhrases.map((p) => (
          <span key={p.slug} className={styles.ghost} aria-hidden="true">
            {heroCopy.lead[lang]} {heroCopy.like[lang]} <span className={styles.ghostPhrase}>{p.label[lang]}</span>.
          </span>
        ))}
        <span>
          <span className={styles.introLead}>{heroCopy.lead[lang]}</span> {heroCopy.like[lang]}{" "}
          {/* An inline span (not a <button>) so the example wraps like the rest of the sentence. */}
          <span
            ref={faceRef}
            role="button"
            tabIndex={0}
            className={styles.phrase}
            onClick={() => advance(true)}
            onKeyDown={onKeyDown}
            aria-describedby={hintId}
          >
            {words.map((word, i) => (
              <Fragment key={`${index}-${i}`}>
                {i > 0 ? " " : null}
                <span className={styles.word} data-word="">
                  {word}
                </span>
              </Fragment>
            ))}
          </span>
          .
        </span>
      </p>
      {projectName ? (
        <Link href={`/${lang}/werk/${phrase.slug}`} className={styles.phraseLink}>
          <span>
            {heroCopy.projectLink[lang]} {projectName}
          </span>
          <Icon name="arrowNE" size={16} />
        </Link>
      ) : null}
      <span id={hintId} className="sr-only">
        {heroCopy.phraseHint[lang]}
      </span>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
