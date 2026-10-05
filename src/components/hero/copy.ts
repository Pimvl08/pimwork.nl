import type { Bilingual, Locale } from "@/i18n/config";
import { EXPERIMENT_COUNT } from "@/components/lab/logic";
import { countWord } from "./logic";

/** The phrase in the intro line cycles through real project categories. */
export interface IntroPhrase {
  slug: string;
  label: Bilingual<string>;
}

export const introPhrases: IntroPhrase[] = [
  { slug: "strength-tracker", label: { nl: "werkende apps", en: "working apps" } },
  { slug: "teamsync", label: { nl: "desktoptools", en: "desktop tools" } },
  { slug: "kdp-kleurboek", label: { nl: "drukklare boeken", en: "print-ready books" } },
  { slug: "solana-forensics", label: { nl: "onderzoekstools", en: "research tools" } },
  { slug: "belhulp", label: { nl: "belhulpjes", en: "call helpers" } },
];

/**
 * Number of Lab experiments, taken from the Lab's own pure module (the same
 * count its tabs and deep links use), so the intro line follows the Lab.
 */
export const LAB_EXPERIMENT_COUNT = EXPERIMENT_COUNT;

export const heroCopy = {
  lead: { nl: "bouwt", en: "builds" },
  tail: { nl: "met code en AI.", en: "with code and AI." },
  phraseHint: {
    nl: "Toont een ander soort werk van Pim.",
    en: "Shows another kind of work by Pim.",
  },
  projectLink: { nl: "Bekijk het project", en: "See the project" },
  explore: { nl: "Ontdek", en: "Explore" },
  seeWork: { nl: "Bekijk werk", en: "See the work" },
  shellDescription: {
    nl: "Een papieren schijf die langs één gebogen vouwlijn omhoog komt tot een stevige schaal. Met de muis of door horizontaal te slepen buig je de vouw.",
    en: "A paper disc that rises along one curved crease into a rigid shell. Move the mouse or drag sideways to bend the crease.",
  },
  bend: { nl: "Buig", en: "Bend" },
  intro: {
    label: { nl: "Introductie", en: "Introduction" },
    line1: { nl: "Welkom in Pims digitale wereld.", en: "Welcome to Pim's digital world." },
    skip: { nl: "Sla over", en: "Skip" },
  },
} satisfies Record<string, unknown>;

/** The sentence the screen reader hears when the phrase changes. */
export function introSentence(name: string, phrase: IntroPhrase, lang: Locale): string {
  return `${name} ${heroCopy.lead[lang]} ${phrase.label[lang]} ${heroCopy.tail[lang]}`;
}

/** "Acht projecten. Vijf experimenten. Eén lijn." from the real counts. */
export function introLine2(projectCount: number, experimentCount: number, lang: Locale): string {
  if (lang === "nl") {
    return `${countWord(projectCount, "nl")} ${projectCount === 1 ? "project" : "projecten"}. ${countWord(experimentCount, "nl")} ${experimentCount === 1 ? "experiment" : "experimenten"}. Eén lijn.`;
  }
  return `${countWord(projectCount, "en")} ${projectCount === 1 ? "project" : "projects"}. ${countWord(experimentCount, "en")} ${experimentCount === 1 ? "experiment" : "experiments"}. One line.`;
}
