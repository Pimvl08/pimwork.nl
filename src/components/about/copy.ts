import type { Bilingual } from "@/i18n/config";

/**
 * All visible text of plate 01. Facts themselves live in src/content; this
 * file only holds the sentences around them.
 */
export const aboutCopy = {
  title: { nl: "Wie", en: "Who" },
  lead: {
    nl: "Wie Pim is, in feiten die je kunt nagaan.",
    en: "Who Pim is, in facts you can check.",
  },
  /** Bio sentences. `{count}`, `{fromMonth}`, `{toMonth}` and `{year}` come from projects.ts. */
  bio: {
    nl: [
      "Pim bouwt elke dag met Claude Code, op een MacBook Pro uit 2017.",
      "Tussen {fromMonth} en {toMonth} {year} maakte hij de {count} eigen projecten op deze site.",
      "Daarnaast traint hij kracht met een vaste partner en werkt hij aan een eigen pettenmerk.",
    ],
    en: [
      "Pim builds with Claude Code every day, on a 2017 MacBook Pro.",
      "Between {fromMonth} and {toMonth} {year} he made the {count} projects of his own on this site.",
      "Besides that, he trains strength with a regular partner and works on his own cap brand.",
    ],
  },
  portrait: {
    what: { nl: "Portret", en: "Portrait" },
    caption: { nl: "Fig. 1 · Portret", en: "Fig. 1 · Portrait" },
  },
  facts: {
    title: { nl: "Feiten", en: "Facts" },
    source: { nl: "bron", en: "source" },
    hint: {
      nl: "Wijs een feit aan of tab erheen om de bron te zien.",
      en: "Point at a fact or tab to it to see its source.",
    },
  },
  interests: {
    title: { nl: "Waar hij mee bezig is", en: "What he is into" },
    lead: {
      nl: "Zes interesses, elk met een project als bewijs.",
      en: "Six interests, each with a project as proof.",
    },
    evidence: { nl: "Bewijs", en: "Proof" },
    listLabel: { nl: "Interesses", en: "Interests" },
  },
  timeline: {
    title: { nl: "Tijdlijn", en: "Timeline" },
    lead: {
      nl: "Elk project staat op zijn echte periode: een stip voor een dag, een boog voor meerdere dagen.",
      en: "Every project sits at its real period: a dot for one day, an arc for several days.",
    },
    idle: {
      nl: "Wijs een project aan voor naam, soort en datum.",
      en: "Point at a project for its name, kind and dates.",
    },
    until: { nl: "tot", en: "to" },
    day: { nl: "dag", en: "day" },
    days: { nl: "dagen", en: "days" },
    figure: {
      nl: "Kompasboog van maart tot en met oktober 2026 met de acht projecten op hun periode.",
      en: "Compass arc from March through October 2026 with the eight projects at their period.",
    },
    months: {
      nl: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
      en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    },
    monthsShort: {
      nl: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
      en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    },
  },
  measures: {
    title: { nl: "Gemeten", en: "Measured" },
    lead: {
      nl: "Vijf getallen uit de projecten zelf, met hun bron.",
      en: "Five numbers from the projects themselves, with their source.",
    },
    colValue: { nl: "Maat", en: "Value" },
    colWhat: { nl: "Wat en waar", en: "What and where" },
    note: {
      nl: "Alle waarden staan in src/content/projects.ts, verzameld uit Pims eigen projectmappen.",
      en: "Every value lives in src/content/projects.ts, collected from Pim's own project folders.",
    },
  },
};

/**
 * The five measured figures, chosen to tell the story. Each points at a
 * metric in projects.ts by slug and English label, so the value shown is
 * always the value stored there. `context` adds a proven detail from the
 * same project (its hard problems or other metrics).
 */
export const measureSelection: { slug: string; metric: string; what: Bilingual<string>; context?: Bilingual<string> }[] = [
  {
    slug: "teamsync",
    metric: "Build time",
    what: { nl: "Bouwtijd van een desktopapp met eigen sync-engine", en: "Build time of a desktop app with its own sync engine" },
    context: { nl: "van architectuurafweging tot ondertekende updates", en: "from architecture trade-off to signed updates" },
  },
  {
    slug: "strength-tracker",
    metric: "Unit tests",
    what: { nl: "Unit tests na de ombouw in tien fasen", en: "Unit tests after the ten-phase rebuild" },
  },
  {
    slug: "kdp-kleurboek",
    metric: "API cost for 147 calls",
    what: { nl: "API-kosten voor 147 calls, samen 50 kleurplaten", en: "API cost for 147 calls, 50 coloring plates in total" },
    context: { nl: "onder een harde grens van $7 in de code", en: "under a hard $7 limit in code" },
  },
  {
    slug: "belhulp",
    metric: "Word error rate, Whisper small with term list",
    what: { nl: "Woordfouten bij live uitschrijven", en: "Word errors in live transcription" },
    context: { nl: "Whisper small op een Intel-laptop uit 2017, 1,1x realtime", en: "Whisper small on a 2017 Intel laptop, 1.1x realtime" },
  },
  {
    slug: "solana-forensics",
    metric: "npm dependencies",
    what: { nl: "npm-dependencies in een CLI van ruim 3.000 regels", en: "npm dependencies in a CLI of over 3,000 lines" },
  },
];
