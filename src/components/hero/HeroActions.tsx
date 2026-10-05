"use client";

import type { MouseEvent } from "react";
import { ArchButton } from "@/components/ui/ArchButton";
import type { Locale } from "@/i18n/config";
import { useReducedMotion } from "@/lib/hooks";
import { scrollToSection } from "@/lib/scroll";
import { uiStore } from "@/lib/store";
import { heroCopy } from "./copy";
import { IntroSequence, type IntroLines } from "./IntroSequence";
import { primeFoldSound } from "./sound";
import styles from "./hero.module.css";

/**
 * "Ontdek" starts the intro sequence on the way to the about plate (without
 * JavaScript it is a plain link to #about). "Bekijk werk" goes to the work plate.
 */
export function HeroActions({ lang, lines }: { lang: Locale; lines: IntroLines }) {
  const reduce = useReducedMotion();

  const explore = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (reduce) {
      uiStore.set({ introState: "done" });
      scrollToSection("about");
      return;
    }
    if (uiStore.get().soundOn) primeFoldSound();
    uiStore.set({ introState: "playing" });
  };

  const seeWork = (event: MouseEvent<HTMLAnchorElement>) => {
    if (scrollToSection("work")) event.preventDefault();
  };

  return (
    <div className={styles.actions}>
      <ArchButton variant="primary" size="lg" href="#about" onClick={explore} aria-haspopup="dialog">
        {heroCopy.explore[lang]}
      </ArchButton>
      <ArchButton variant="secondary" size="lg" icon="arrowSE" href="#work" onClick={seeWork}>
        {heroCopy.seeWork[lang]}
      </ArchButton>
      <IntroSequence lang={lang} lines={lines} />
    </div>
  );
}
