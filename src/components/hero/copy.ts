import type { Bilingual, Locale } from "@/i18n/config";

/**
 * The example at the end of the intro sentence folds over through real
 * projects. Every phrase completes "..., zoals" / "..., like" grammatically.
 */
export interface IntroPhrase {
  slug: string;
  label: Bilingual<string>;
}

export const introPhrases: IntroPhrase[] = [
  {
    slug: "exact-online",
    label: { nl: "een tool die bedrijven als verkoopkans in Exact Online zet", en: "a tool that puts companies into Exact Online as sales opportunities" },
  },
  {
    slug: "strength-tracker",
    label: { nl: "een trainingsapp die ik elke week gebruik", en: "a training app I use every week" },
  },
  {
    slug: "teamsync",
    label: { nl: "een desktopapp waarmee een team bestanden deelt", en: "a desktop app that lets a team share files" },
  },
  {
    slug: "offerte-pdf-generator",
    label: { nl: "een tool die in een paar minuten een offerte maakt", en: "a tool that writes a quote in a few minutes" },
  },
  {
    slug: "belhulp",
    label: { nl: "een hulp die belgesprekken uitschrijft", en: "a helper that transcribes phone calls" },
  },
];

export const heroCopy = {
  lead: { nl: "Ik bouw software die werk uit handen neemt,", en: "I build software that takes work off your hands," },
  like: { nl: "zoals", en: "like" },
  phraseHint: {
    nl: "Toont een ander voorbeeld van mijn werk.",
    en: "Shows another example of my work.",
  },
  projectLink: { nl: "Bekijk", en: "See" },
  seeWork: { nl: "Bekijk mijn werk", en: "See my work" },
  contact: { nl: "Neem contact op", en: "Get in touch" },
  shellDescription: {
    nl: "Een papieren schijf die langs één gebogen vouwlijn omhoog komt tot een stevige schaal. Met de muis of door horizontaal te slepen buig je de vouw.",
    en: "A paper disc that rises along one curved crease into a rigid shell. Move the mouse or drag sideways to bend the crease.",
  },
} satisfies Record<string, Bilingual<string>>;

/** The full sentence, for screen readers when the example changes. */
export function introSentence(phrase: IntroPhrase, lang: Locale): string {
  return `${heroCopy.lead[lang]} ${heroCopy.like[lang]} ${phrase.label[lang]}.`;
}
