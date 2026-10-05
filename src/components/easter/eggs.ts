import type { Bilingual } from "@/i18n/config";

export interface EggDef {
  id: string;
  name: Bilingual<string>;
  /** Shown once found: what it was. */
  found: Bilingual<string>;
  /** Shown while still hidden: a nudge, never the answer. */
  hint: Bilingual<string>;
  /** Toast when it unlocks. */
  toast: Bilingual<string>;
}

/** Every easter egg on the site, in the order the hidden page lists them. */
export const eggs: EggDef[] = [
  {
    id: "origami",
    name: { nl: "Origami", en: "Origami" },
    found: { nl: "De Konami-code vouwt de pagina één keer langs de diagonaal.", en: "The Konami code folds the page once along the diagonal." },
    hint: { nl: "Een beroemde cheatcode uit 1986, getypt buiten een tekstveld.", en: "A famous cheat code from 1986, typed outside a text field." },
    toast: { nl: "Origami-modus ontgrendeld", en: "Origami mode unlocked" },
  },
  {
    id: "rain",
    name: { nl: "Letterregen", en: "Letter rain" },
    found: { nl: "Het commando matrix laat Bodoni-letters regenen, inkt op papier.", en: "The matrix command rains Bodoni letters, ink on paper." },
    hint: { nl: "Een film uit 1999, als commando.", en: "A film from 1999, as a command." },
    toast: { nl: "Letterregen gevonden", en: "Letter rain found" },
  },
  {
    id: "compass",
    name: { nl: "Passer", en: "Compass" },
    found: { nl: "Vijf klikken op het logo binnen drie seconden laten het een rondje draaien, als een passer.", en: "Five clicks on the logo within three seconds spin it round once, like a compass." },
    hint: { nl: "Het logo is geduldig, maar niet eindeloos. Klik vaker dan normaal.", en: "The logo is patient, but not endlessly. Click more than usual." },
    toast: { nl: "Passer gevonden: het logo draait een rondje", en: "Compass found: the logo turns a full circle" },
  },
  {
    id: "hello",
    name: { nl: "Hoi", en: "Hello" },
    found: { nl: "Wie de naam van de maker typt, krijgt een groet terug.", en: "Typing the maker's name gets you a greeting." },
    hint: { nl: "Drie letters, buiten een tekstveld. Je weet wiens site dit is.", en: "Three letters, outside a text field. You know whose site this is." },
    toast: { nl: "Hoi.", en: "Hi." },
  },
  {
    id: "sudo",
    name: { nl: "Geweigerd", en: "Denied" },
    found: { nl: "sudo in de terminal: netjes geweigerd.", en: "sudo in the terminal: politely refused." },
    hint: { nl: "Vraag de terminal om meer rechten dan je hebt.", en: "Ask the terminal for more rights than you have." },
    toast: { nl: "Netjes geprobeerd", en: "Nice try" },
  },
  {
    id: "secret",
    name: { nl: "Het verborgen blad", en: "The hidden sheet" },
    found: { nl: "Deze pagina. Het commando secret brengt je hier.", en: "This page. The secret command brings you here." },
    hint: { nl: "", en: "" },
    toast: { nl: "Verborgen blad gevonden", en: "Hidden sheet found" },
  },
];

export const STORAGE_KEY = "pim-eggs";

/** Konami code: up up down down left right left right b a. */
export const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/**
 * Feeds keys into a sequence and reports when the last keys typed match it.
 * Using the tail of a buffer means "up up up down down ..." still counts.
 */
export function createSequence(sequence: string[]) {
  let buffer: string[] = [];
  return (key: string): boolean => {
    const k = key.length === 1 ? key.toLowerCase() : key;
    buffer = [...buffer, k].slice(-sequence.length);
    if (buffer.length === sequence.length && buffer.every((x, i) => x === sequence[i])) {
      buffer = [];
      return true;
    }
    return false;
  };
}

/** Counts clicks inside a time window; true on the click that reaches `count`. */
export function createClickCounter(count: number, windowMs: number) {
  let stamps: number[] = [];
  return (now: number): boolean => {
    stamps = [...stamps.filter((t) => now - t < windowMs), now];
    if (stamps.length >= count) {
      stamps = [];
      return true;
    }
    return false;
  };
}
