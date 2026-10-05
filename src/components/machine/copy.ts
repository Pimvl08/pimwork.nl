import type { Bilingual } from "@/i18n/config";

export const machineCopy = {
  title: { nl: "Machine", en: "Machine" },
  lead: {
    nl: "AI is Pims dagelijkse gereedschap: elk project op deze site is gebouwd met Claude Code. Hier kun je de machine zelf bevragen.",
    en: "AI is Pim's daily tool: every project on this site was built with Claude Code. Here you can question the machine yourself.",
  },
  body: {
    nl: "De terminal hieronder kent dezelfde commando's als de terminal achter Ctrl+K (Cmd+K op een Mac). Een vraag in gewone taal gaat naar de machine. Antwoordt die niet, dan zegt de terminal dat eerlijk en zoekt hij het antwoord zelf op in de teksten van deze site.",
    en: "The terminal below knows the same commands as the one behind Ctrl+K (Cmd+K on a Mac). A question in plain language goes to the machine. If it cannot answer, the terminal says so honestly and looks the answer up in the texts of this site itself.",
  },
  modes: {
    nl: [
      { term: "Live", text: "Claude Opus 5.5 antwoordt, alleen op basis van de feiten op deze site." },
      { term: "Lokaal", text: "Zonder sleutel op de server: zinnen uit de site zelf, gekozen op trefwoorden. Geen taalmodel." },
    ],
    en: [
      { term: "Live", text: "Claude Opus 5.5 answers, using only the facts on this site." },
      { term: "Local", text: "Without a key on the server: sentences from the site itself, picked by keywords. No language model." },
    ],
  },
  terminalLabel: { nl: "Terminal van plaat 06", en: "Terminal of plate 06" },
  output: { nl: "Uitvoer van de machine", en: "Output of the machine" },
  welcome: {
    nl: "pim@vorm, plaat 06. Kies een commando of stel een vraag.",
    en: "pim@vorm, plate 06. Pick a command or ask a question.",
  },
  commandInput: { nl: "Commando", en: "Command" },
  chips: { nl: "Snelle commando's", en: "Quick commands" },
  ask: {
    label: { nl: "Vraag het de machine", en: "Ask the machine" },
    placeholder: { nl: "Bijvoorbeeld: waarom bouwde Pim TeamSync?", en: "For example: why did Pim build TeamSync?" },
    submit: { nl: "Vraag", en: "Ask" },
    busy: { nl: "Bezig", en: "Working" },
    tooShort: { nl: "Stel een vraag van minstens twee tekens.", en: "Ask a question of at least two characters." },
    counter: { nl: "tekens", en: "characters" },
  },
  label: {
    live: { nl: "Live: Claude Opus 5.5", en: "Live: Claude Opus 5.5" },
    local: {
      nl: "Lokale modus: antwoord samengesteld uit de inhoud van deze site, geen taalmodel",
      en: "Local mode: answer composed from the content of this site, no language model",
    },
    pending: { nl: "De machine denkt na", en: "The machine is thinking" },
  },
  reasons: {
    busy: {
      nl: "De machine is even druk, dus deze keer antwoordt de lokale modus.",
      en: "The machine is busy right now, so the local mode answers this time.",
    },
    rateLimited: {
      nl: "Maximaal acht vragen per tien minuten. Tot die tijd antwoordt de lokale modus.",
      en: "Eight questions per ten minutes at most. Until then the local mode answers.",
    },
    upstream: {
      nl: "De machine is niet bereikbaar, dus de lokale modus antwoordt.",
      en: "The machine cannot be reached, so the local mode answers.",
    },
    invalid: {
      nl: "Die vraag kon de machine niet lezen. Probeer een kortere vraag.",
      en: "The machine could not read that question. Try a shorter one.",
    },
  },
} satisfies Record<string, unknown>;

export type ModeCopy = Bilingual<{ term: string; text: string }[]>;
