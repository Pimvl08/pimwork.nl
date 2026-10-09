import type { Bilingual } from "@/i18n/config";

/**
 * Text around the about page. The facts, the intro and the "Hoe ik werk"
 * block live in src/content/person.ts; this file only holds the sentences
 * that frame them.
 */
export const aboutCopy = {
  meta: {
    title: { nl: "Over mij: softwareontwikkelaar uit Aarle-Rixtel", en: "About me: software developer from Aarle-Rixtel" },
    description: {
      nl: "Ik ben Pim van Leeuwen uit Aarle-Rixtel. Ik bouw software, koppelingen en websites voor bedrijven in Helmond en omgeving. Lees wie ik ben en hoe ik werk.",
      en: "I'm Pim van Leeuwen from Aarle-Rixtel. I build software, integrations and websites for businesses in and around Helmond. Read who I am and how I work.",
    },
  },
  title: { nl: "Over mij", en: "About me" },
  portrait: {
    caption: { nl: "Pim", en: "Pim" },
  },
  facts: {
    title: { nl: "In het kort", en: "In short" },
  },
  principles: {
    title: { nl: "Waar ik op let", en: "What I pay attention to" },
  },
  closing: {
    title: { nl: "Benieuwd wat ik kan bouwen?", en: "Curious what I can build?" },
    body: {
      nl: "Bekijk wat ik heb gemaakt, of stuur me een bericht als je een idee of een probleem hebt waar software bij kan helpen.",
      en: "Have a look at what I have made, or send me a message if you have an idea or a problem that software could help with.",
    },
    work: { nl: "Bekijk mijn werk", en: "See my work" },
    contact: { nl: "Neem contact op", en: "Get in touch" },
    portfolio: { nl: "Download mijn portfolio (PDF)", en: "Download my portfolio (PDF)" },
  },
} satisfies {
  meta: { title: Bilingual<string>; description: Bilingual<string> };
  title: Bilingual<string>;
  portrait: { caption: Bilingual<string> };
  facts: { title: Bilingual<string> };
  principles: { title: Bilingual<string> };
  closing: {
    title: Bilingual<string>;
    body: Bilingual<string>;
    work: Bilingual<string>;
    contact: Bilingual<string>;
    portfolio: Bilingual<string>;
  };
};
