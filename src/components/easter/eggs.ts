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

/** Every easter egg on the site, in the order the secret plate lists them. */
export const eggs: EggDef[] = [
  {
    id: "origami",
    name: { nl: "Origami", en: "Origami" },
    found: { nl: "De Konami-code vouwt elke plaat één keer langs de diagonaal.", en: "The Konami code folds every plate once along the diagonal." },
    hint: { nl: "Een cheatcode uit 1986, buiten een tekstveld. De terminal kent een hint.", en: "A cheat code from 1986, outside a text field. The terminal has a hint." },
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
    found: { nl: "Vijf klikken op het logo binnen drie seconden maken van de cursor een passer.", en: "Five clicks on the logo within three seconds turn the cursor into a compass." },
    hint: { nl: "Het logo is geduldig, maar niet eindeloos. Klik vaker dan normaal.", en: "The logo is patient, but not endlessly. Click more than usual." },
    toast: { nl: "Passer ontgrendeld: de cursor tekent nu cirkels", en: "Compass unlocked: the cursor now draws circles" },
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
    name: { nl: "Plaat 99", en: "Plate 99" },
    found: { nl: "Deze plaat. Het commando secret brengt je hier.", en: "This plate. The secret command brings you here." },
    hint: { nl: "", en: "" },
    toast: { nl: "Plaat 99 gevonden", en: "Plate 99 found" },
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
