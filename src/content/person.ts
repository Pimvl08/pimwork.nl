import type { Bilingual } from "@/i18n/config";

/**
 * Facts about Pim. Only what is proven by his own files is filled in.
 * Anything unknown is `null` and renders as a visibly open slot that says
 * "nog in te vullen" / "to be filled in". Replace null with a value to fill it.
 */

export interface Fact {
  id: string;
  label: Bilingual<string>;
  value: Bilingual<string> | null;
  /** Where the fact comes from, shown on hover so every claim has a source. */
  source?: string;
}

export const person = {
  name: "Pim",
  github: { handle: "pimdaanbram-prog", href: "https://github.com/pimdaanbram-prog" },
  /** Path to a portrait in /public. Null keeps the arched frame empty. */
  portrait: null as null | { src: string; alt: Bilingual<string> },
};

export const facts: Fact[] = [
  {
    id: "tool",
    label: { nl: "Gereedschap", en: "Tool" },
    value: { nl: "Claude Code, elke dag", en: "Claude Code, every day" },
    source: "~/Documents/claude code/OVERZICHT.md",
  },
  {
    id: "machine",
    label: { nl: "Machine", en: "Machine" },
    value: {
      nl: "MacBook Pro uit 2017, Intel i7, macOS Ventura",
      en: "2017 MacBook Pro, Intel i7, macOS Ventura",
    },
    source: "sysctl machdep.cpu.brand_string",
  },
  {
    id: "projects",
    label: { nl: "Eigen projecten op deze site", en: "Own projects on this site" },
    value: { nl: "8", en: "8" },
    source: "src/content/projects.ts",
  },
  {
    id: "github",
    label: { nl: "GitHub", en: "GitHub" },
    value: { nl: "pimdaanbram-prog", en: "pimdaanbram-prog" },
    source: "github.com/pimdaanbram-prog",
  },
  { id: "study", label: { nl: "Opleiding", en: "Education" }, value: null },
  { id: "place", label: { nl: "Woonplaats", en: "Based in" }, value: null },
  { id: "next", label: { nl: "Volgende stap", en: "Next step" }, value: null },
];

export interface Interest {
  id: string;
  title: Bilingual<string>;
  body: Bilingual<string>;
  /** Project slug that proves this interest. */
  evidence: string;
}

export const interests: Interest[] = [
  {
    id: "training",
    title: { nl: "Krachttraining", en: "Strength training" },
    body: {
      nl: "Traint met een vaste partner en bouwde daar zijn eigen app voor, die na elke week het volgende gewicht voorstelt.",
      en: "Trains with a regular partner and built his own app for it, which suggests the next weight after every week.",
    },
    evidence: "strength-tracker",
  },
  {
    id: "brand",
    title: { nl: "Een eigen merk", en: "An own brand" },
    body: {
      nl: "Werkt aan een eigen pettenmerk en bouwde de winkel ervoor, met de nadruk op materiaal en maatwerk.",
      en: "Works on his own cap brand and built its shop, with the focus on material and custom work.",
    },
    evidence: "capcraft",
  },
  {
    id: "automation",
    // The soft hyphen (U+00AD) lets the long word break on a narrow sheet.
    title: { nl: "Saai werk weg\u00ADautomatiseren", en: "Automating the boring parts" },
    body: {
      nl: "Belformulieren, offertes en verkoopkansen: als iets elke dag terugkomt, wordt het een tool.",
      en: "Call forms, quotes and sales leads: if it comes back every day, it becomes a tool.",
    },
    evidence: "belhulp",
  },
  {
    id: "onchain",
    title: { nl: "On-chain onderzoek", en: "On-chain research" },
    body: {
      nl: "Zoekt uit wat er echt gebeurde bij een memecoin-launch, alleen lezend en met bewijsniveaus per conclusie.",
      en: "Works out what really happened in a meme-coin launch, read-only and with an evidence grade per conclusion.",
    },
    evidence: "solana-forensics",
  },
  {
    id: "print",
    title: { nl: "Drukwerk", en: "Print" },
    body: {
      nl: "Van pixels naar papier: vectorlijnen, CMYK-covers en preflights die elke plaat keuren.",
      en: "From pixels to paper: vector lines, CMYK covers and preflights that inspect every plate.",
    },
    evidence: "kdp-kleurboek",
  },
  {
    id: "teams",
    title: { nl: "Samenwerken zonder gedoe", en: "Teamwork without friction" },
    body: {
      nl: "Een studententeam met Macs en Windows-laptops werkt in dezelfde map, zonder overschreven werk.",
      en: "A student team on Macs and Windows laptops shares one folder, without overwritten work.",
    },
    evidence: "teamsync",
  },
];
