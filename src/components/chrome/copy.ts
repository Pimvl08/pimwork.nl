import type { Bilingual, Locale } from "@/i18n/config";

/** Each language named in itself (not translated). */
export const languageNames: Record<Locale, string> = { nl: "Nederlands", en: "English" };

/** All visible chrome text, Dutch first. */
export const chromeCopy = {
  skip: { nl: "Naar de inhoud", en: "Skip to content" },
  home: { nl: "PimWork, naar de homepagina", en: "PimWork, to the home page" },
  mainNav: { nl: "Hoofdmenu", en: "Main menu" },
  pages: { nl: "Pagina's", en: "Pages" },
  language: { nl: "Taal", en: "Language" },
  toLight: { nl: "Licht thema", en: "Light theme" },
  toDark: { nl: "Donker thema", en: "Dark theme" },
  menu: { nl: "Menu", en: "Menu" },
  openMenu: { nl: "Menu openen", en: "Open menu" },
  closeMenu: { nl: "Sluiten", en: "Close" },
  menuTitle: { nl: "Menu", en: "Menu" },
  swipeHint: { nl: "Veeg omlaag om te sluiten", en: "Swipe down to close" },
  shortcuts: {
    nl: {
      title: "Sneltoetsen",
      lead: "Werkt overal, behalve terwijl je typt.",
      close: "Sluiten",
      terminal: "Snel naar een pagina of project",
      sheet: "Deze lijst tonen",
      theme: "Licht of donker thema",
      lang: "Switch to English",
      pages: "Home, Werk, Diensten, Over mij, Lab, Contact",
      esc: "Venster sluiten",
      or: "of",
      to: "tot",
    },
    en: {
      title: "Keyboard shortcuts",
      lead: "Works everywhere, except while you type.",
      close: "Close",
      terminal: "Jump to a page or project",
      sheet: "Show this list",
      theme: "Light or dark theme",
      lang: "Naar het Nederlands",
      pages: "Home, Work, Services, About, Lab, Contact",
      esc: "Close a window",
      or: "or",
      to: "to",
    },
  },
  footer: {
    nl: {
      line: "Software, automatisering en websites uit Aarle-Rixtel.",
      nav: "Voettekst",
      services: "Diensten",
      portfolio: "Download mijn portfolio (PDF)",
    },
    en: {
      line: "Software, automation and websites from Aarle-Rixtel.",
      nav: "Footer",
      services: "Services",
      portfolio: "Download my portfolio (PDF)",
    },
  },
} satisfies Record<string, Bilingual<unknown> | Record<string, Bilingual<unknown>>>;
