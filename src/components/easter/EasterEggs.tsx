"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/i18n/LocaleProvider";
import { lockScroll } from "@/lib/scroll";
import { uiStore, unlockEgg } from "@/lib/store";
import { RAIN_EVENT } from "./bus";
import { easterCopy } from "./copy";
import { KONAMI, STORAGE_KEY, createClickCounter, createSequence, eggs } from "./eggs";
import { LetterRain } from "./LetterRain";
import { Toaster } from "./Toaster";
import { toast } from "./toast";
import styles from "./easter.module.css";

const FOLD_MS = 2400;
let greeted = false;

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

function readStoredEggs(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const known = new Set(eggs.map((e) => e.id));
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && known.has(id)) : [];
  } catch {
    return [];
  }
}

function storeEggs(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* private mode or blocked storage: eggs simply last for this visit */
  }
}

function greet(line: string) {
  if (greeted) return;
  greeted = true;
  const art = ["  ________", " |\\       |", " |  \\     |", " |    \\   |", " |______\\_|"].join("\n");
  console.log(`%c${art}\n%cpim@vorm\n%c${line}`, "font-family: monospace; line-height: 1.2", "font-family: Georgia, serif; font-style: italic; font-size: 16px", "font-family: monospace; color: gray");
}

/**
 * Easter eggs, mounted once for the whole site: Konami origami, letter rain,
 * five logo clicks for the compass cursor, "pim" for a greeting, a console
 * note, and the one Toaster every toast goes through.
 */
export default function EasterEggs() {
  const lang = useLang();
  const t = easterCopy[lang];
  const [raining, setRaining] = useState(false);

  /* Restore eggs found earlier, then announce new ones as they unlock. */
  useEffect(() => {
    const stored = readStoredEggs();
    if (stored.length) uiStore.set((s) => ({ eggs: [...new Set([...s.eggs, ...stored])] }));
    let previous = uiStore.get().eggs;
    const unsubscribe = uiStore.subscribe(() => {
      const current = uiStore.get().eggs;
      if (current === previous) return;
      const added = current.filter((id) => !previous.includes(id));
      previous = current;
      storeEggs(current);
      for (const id of added) {
        const egg = eggs.find((e) => e.id === id);
        if (egg) toast(egg.toast[lang], { id: `egg-${id}` });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [lang]);

  useEffect(() => greet(t.console), [t.console]);

  const fold = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.remove(styles.origami);
    void root.offsetWidth; // restart the animation when triggered twice
    root.classList.add(styles.origami);
    window.setTimeout(() => root.classList.remove(styles.origami), FOLD_MS);
  }, []);

  /* Keyboard eggs: Konami and p-i-m, never while typing in a field. */
  useEffect(() => {
    const konami = createSequence(KONAMI);
    const pim = createSequence(["p", "i", "m"]);
    const origami = eggs.find((e) => e.id === "origami")!;
    const hello = eggs.find((e) => e.id === "hello")!;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || isTyping(e.target) || uiStore.get().terminalOpen) return;
      if (konami(e.key)) {
        fold();
        if (!unlockEgg("origami")) toast(origami.toast[lang], { id: "egg-origami" });
      }
      if (pim(e.key)) {
        if (!unlockEgg("hello")) toast(hello.toast[lang], { id: "egg-hello" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fold, lang]);

  /* Five clicks on the logo within three seconds: the compass cursor. */
  useEffect(() => {
    const counter = createClickCounter(5, 3000);
    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target.closest('[data-egg="logo"]') : null;
      if (target && counter(performance.now())) unlockEgg("compass");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  /* Letter rain, started by the terminal's matrix command. */
  useEffect(() => {
    const onRain = () => {
      unlockEgg("rain");
      setRaining(true);
    };
    window.addEventListener(RAIN_EVENT, onRain);
    return () => window.removeEventListener(RAIN_EVENT, onRain);
  }, []);

  useEffect(() => {
    if (!raining) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [raining]);

  const stopRain = useCallback(() => setRaining(false), []);

  return (
    <>
      {raining ? <LetterRain onClose={stopRain} label={t.rain} closeLabel={t.rainClose} hint={t.rainHint} /> : null}
      <Toaster label={t.toasts} closeLabel={t.close} />
    </>
  );
}
