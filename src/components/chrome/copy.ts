import type { Bilingual, Locale } from "@/i18n/config";

/** Each language named in itself (not translated). */
export const languageNames: Record<Locale, string> = { nl: "Nederlands", en: "English" };

/** All visible chrome text, Dutch first. */
export const chromeCopy = {
  skip: { nl: "Naar de inhoud", en: "Skip to content" },
  home: { nl: "Pim, naar de omslag", en: "Pim, back to the cover" },
  mainNav: { nl: "Hoofdmenu", en: "Main menu" },
  plates: { nl: "Platen", en: "Plates" },
  language: { nl: "Taal", en: "Language" },
  toLight: { nl: "Licht thema", en: "Light theme" },
  toDark: { nl: "Donker thema", en: "Dark theme" },
  terminal: { nl: "Terminal openen (Ctrl K)", en: "Open terminal (Ctrl K)" },
  menu: { nl: "Menu", en: "Menu" },
  openMenu: { nl: "Menu openen", en: "Open menu" },
  closeMenu: { nl: "Menu sluiten", en: "Close menu" },
  menuTitle: { nl: "Alle platen", en: "All plates" },
  current: { nl: "Nu op plaat", en: "Now on plate" },
  swipeHint: { nl: "Veeg omlaag om te sluiten", en: "Swipe down to close" },
  cursor: {
    view: { nl: "Bekijk", en: "View" },
    drag: { nl: "Sleep", en: "Drag" },
    play: { nl: "Speel", en: "Play" },
  },
  shortcuts: {
    nl: {
      title: "Sneltoetsen",
      lead: "Werkt overal, behalve terwijl je typt.",
      close: "Sluiten",
      terminal: "Terminal openen",
      sheet: "Deze lijst tonen",
      theme: "Licht of donker papier",
      lang: "Naar het Engels",
      plates: "Spring naar plaat 00 tot 07",
      esc: "Venster sluiten",
      or: "of",
      to: "tot",
    },
    en: {
      title: "Keyboard shortcuts",
      lead: "Works everywhere, except while you type.",
      close: "Close",
      terminal: "Open the terminal",
      sheet: "Show this list",
      theme: "Light or dark paper",
      lang: "Switch to Dutch",
      plates: "Jump to plate 00 to 07",
      esc: "Close a window",
      or: "or",
      to: "to",
    },
  },
  preloader: {
    status: { nl: "Papier wordt gevouwen", en: "Folding the paper" },
  },
  footer: {
    nl: {
      line: "Vorm uit één lijn.",
      colophon: "Gebouwd met Claude Code · Next.js 16 · eigen WebGL",
      nav: "Voettekst",
      github: "GitHub",
      githubNote: "opent in een nieuw tabblad",
      colophonLink: "Colofon",
      back: "Terug naar de omslag",
      made: "Pim",
    },
    en: {
      line: "Form from a single line.",
      colophon: "Built with Claude Code · Next.js 16 · custom WebGL",
      nav: "Footer",
      github: "GitHub",
      githubNote: "opens in a new tab",
      colophonLink: "Colophon",
      back: "Back to the cover",
      made: "Pim",
    },
  },
} satisfies Record<string, Bilingual<unknown> | Record<string, Bilingual<unknown>>>;
