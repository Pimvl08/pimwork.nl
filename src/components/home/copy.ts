import type { Bilingual } from "@/i18n/config";

/** Text for the home page sections below the hero, Dutch first. */
export const homeCopy = {
  services: {
    title: { nl: "Wat ik voor je kan bouwen", en: "What I can build for you" },
    lead: {
      nl: "Ik begin bij het werk dat tijd kost en bouw daar iets voor dat het overneemt. Hiermee kan ik je helpen:",
      en: "I start with the work that eats up your time and build something that takes it over. This is what I can help you with:",
    },
  },
  about: {
    title: { nl: "Over mij", en: "About me" },
    more: { nl: "Meer over mij en hoe ik werk", en: "More about me and how I work" },
  },
  contact: {
    title: { nl: "Heb je werk dat elke keer terugkomt?", en: "Do you have work that keeps coming back?" },
    body: {
      nl: "Vertel me wat je tegenkomt. Dan denk ik mee over wat ik ervoor kan bouwen.",
      en: "Tell me what you keep running into, and I'll help you work out what I could build for it.",
    },
    action: { nl: "Neem contact op", en: "Get in touch" },
  },
} satisfies Record<string, Record<string, Bilingual<string>>>;
