import type { Bilingual } from "@/i18n/config";

/** Interface copy for plate 02, the project pages and the modal sheet. */
export const workCopy: Bilingual<{
  title: string;
  lead: string;
  listLabel: string;
  cursor: string;
  open: string;
  problem: string;
  whatItDoes: string;
  highlights: string;
  hardProblems: string;
  metrics: string;
  metricLabel: string;
  metricValue: string;
  stack: string;
  links: string;
  noLinks: string;
  pager: string;
  prev: string;
  next: string;
  back: string;
  close: string;
  fig: string;
  plate: string;
}> = {
  nl: {
    title: "Werk",
    lead: "Acht projecten die Pim bouwde met code en AI. Elk krijgt een eigen plaat: wat het probleem was, hoe het werkt en wat de meeste tijd kostte.",
    listLabel: "Projecten",
    cursor: "Bekijk",
    open: "Open de plaat van",
    problem: "Het probleem",
    whatItDoes: "Wat het doet",
    highlights: "Hoe het werkt",
    hardProblems: "Wat tijd kostte",
    metrics: "Gemeten",
    metricLabel: "Meting",
    metricValue: "Waarde",
    stack: "Gereedschap",
    links: "Links",
    noLinks: "Er is geen openbare link naar dit project.",
    pager: "Andere projecten",
    prev: "Vorige plaat",
    next: "Volgende plaat",
    back: "Alle projecten",
    close: "Sluiten",
    fig: "fig.",
    plate: "Plaat",
  },
  en: {
    title: "Work",
    lead: "Eight projects Pim built with code and AI. Each one gets its own plate: what the problem was, how it works and what took the most time.",
    listLabel: "Projects",
    cursor: "View",
    open: "Open the plate of",
    problem: "The problem",
    whatItDoes: "What it does",
    highlights: "How it works",
    hardProblems: "What cost time",
    metrics: "Measured",
    metricLabel: "Measure",
    metricValue: "Value",
    stack: "Tools",
    links: "Links",
    noLinks: "There is no public link to this project.",
    pager: "Other projects",
    prev: "Previous plate",
    next: "Next plate",
    back: "All projects",
    close: "Close",
    fig: "fig.",
    plate: "Plate",
  },
};

/**
 * Words inside the authored plate diagrams. Every label describes the real
 * mechanism of the project as written in content/projects.ts.
 */
export const diagramCopy = {
  teamsync: {
    nl: {
      caption: "Drie feiten per bestand, precies één actie.",
      alt: "Diagram: per bestand gaan drie feiten, de lokale hash, de laatst gesynchroniseerde basis en de cloudversie, naar één pure beslisfunctie. Die kiest precies één actie. Wijken lokaal en cloud allebei af van de basis, dan wordt het een conflictkopie en gaat er niets verloren.",
      local: "lokale hash",
      base: "basis",
      cloud: "cloudversie",
      decide: "beslis",
      pure: "pure functie, geen I/O",
      one: "precies één actie",
      actions: ["uploaden", "downloaden", "conflictkopie", "niets doen"],
    },
    en: {
      caption: "Three facts per file, exactly one action.",
      alt: "Diagram: per file three facts, the local hash, the last synced base and the cloud version, go into one pure decision function. It picks exactly one action. When local and cloud both differ from the base, the result is a conflict copy and nothing is lost.",
      local: "local hash",
      base: "base",
      cloud: "cloud version",
      decide: "decide",
      pure: "pure function, no I/O",
      one: "exactly one action",
      actions: ["upload", "download", "conflict copy", "do nothing"],
    },
  },
  "strength-tracker": {
    nl: {
      caption: "Twee weken naast elkaar, een stap van 2,5 kg voor volgende week.",
      alt: "Diagram: de sets van vorige week en deze week worden per oefening vergeleken. Daaruit volgt een status (verbeterd, gelijk, teruggang of nieuw) en bij verbeterd een voorstel voor volgende week: het gewicht plus een stap van 2,5 kg, of 1,25 kg.",
      prev: "vorige week",
      curr: "deze week",
      compare: "vergelijk per oefening",
      statuses: ["verbeterd", "gelijk", "teruggang", "nieuw"],
      nextWeek: "volgende week",
      weight: "gewicht",
      plus: "w + 2,5 kg",
      steps: "stap 2,5 of 1,25 kg",
    },
    en: {
      caption: "Two weeks side by side, one 2.5 kg step for next week.",
      alt: "Diagram: last week's and this week's sets are compared per exercise. That gives a status (improved, same, regression or new) and, when improved, a suggestion for next week: the weight plus a step of 2.5 kg, or 1.25 kg.",
      prev: "last week",
      curr: "this week",
      compare: "compare per exercise",
      statuses: ["improved", "same", "regression", "new"],
      nextWeek: "next week",
      weight: "weight",
      plus: "w + 2.5 kg",
      steps: "step 2.5 or 1.25 kg",
    },
  },
  belhulp: {
    nl: {
      caption: "Grijze voorlopige tekst, per venster van 45 seconden vervangen door de definitieve.",
      alt: "Diagram: een tijdlijn in vensters van 45 seconden. Whisper small schrijft meteen grijze voorlopige tekst uit. Zodra een venster is afgesloten, schrijft Gemini het geluid opnieuw uit en vervangt de grijze tekst door de definitieve. Het lopende venster is nog grijs.",
      provisional: "voorlopig · Whisper small, direct",
      final: "definitief · Gemini, per venster",
      replaces: "vervangt",
      running: "venster loopt",
      now: "nu",
      window: "één venster",
    },
    en: {
      caption: "Grey provisional text, replaced by the final version every 45 second window.",
      alt: "Diagram: a timeline in windows of 45 seconds. Whisper small writes grey provisional text right away. Once a window closes, Gemini transcribes its audio again and replaces the grey text with the final version. The running window is still grey.",
      provisional: "provisional · Whisper small, instant",
      final: "final · Gemini, per window",
      replaces: "replaces",
      running: "window running",
      now: "now",
      window: "one window",
    },
  },
  capcraft: {
    nl: {
      caption: "Elke route laadt zijn eigen LCP-beeld vooraf; de layout shift daalt van 0,21 naar 0,001.",
      alt: "Diagram: een route zoals /products laadt met een preload-link vooraf precies het beeld dat het grootste element van die pagina is. Rechts een meter voor Cumulative Layout Shift: de naald gaat van 0,21 naar 0,001.",
      route: "route",
      lcp: "LCP-beeld",
      own: "alleen het eigen beeld",
      cls: "Cumulative Layout Shift",
      before: "0,21",
      after: "0,001",
      zero: "0",
      max: "0,25",
    },
    en: {
      caption: "Every route preloads its own LCP image; layout shift drops from 0.21 to 0.001.",
      alt: "Diagram: a route such as /products uses a preload link to fetch exactly the image that is the largest element of that page. On the right a gauge for Cumulative Layout Shift: the needle moves from 0.21 to 0.001.",
      route: "route",
      lcp: "LCP image",
      own: "only its own image",
      cls: "Cumulative Layout Shift",
      before: "0.21",
      after: "0.001",
      zero: "0",
      max: "0.25",
    },
  },
  "kdp-kleurboek": {
    nl: {
      caption: "Van ruwe PNG naar gekeurde vector, binnen een harde budgetgrens van $7.",
      alt: "Diagram: vier stappen per kleurplaat. Een ruwe PNG met grijze spikkels wordt opgeschoond met een threshold, gevectoriseerd met potrace en gekeurd, met 0 grijze pixels als uitkomst. Daaronder het API-budget: $3,85 voor 147 calls, tegen een harde grens van $7 waarboven de code een call weigert.",
      stages: ["ruwe PNG", "opgeschoond", "vector", "QC"],
      subs: ["grijs, spikkels", "threshold", "potrace", "0 grijze pixels"],
      budget: "API-budget",
      spent: "$3,85 · 147 calls",
      limit: "harde grens $7",
      refuse: "weigert",
    },
    en: {
      caption: "From raw PNG to checked vector, inside a hard budget limit of $7.",
      alt: "Diagram: four steps per coloring page. A raw PNG with grey speckles is cleaned with a threshold, vectorised with potrace and checked, ending with 0 grey pixels. Below it the API budget: $3.85 for 147 calls, against a hard limit of $7 above which the code refuses a call.",
      stages: ["raw PNG", "cleaned", "vector", "QC"],
      subs: ["grey, speckles", "threshold", "potrace", "0 grey pixels"],
      budget: "API budget",
      spent: "$3.85 · 147 calls",
      limit: "hard limit $7",
      refuse: "refuses",
    },
  },
  "solana-forensics": {
    nl: {
      caption: "De vault-delta's van de pools herbouwen de trade, ook als het SOL-saldo van de trader vlak blijft.",
      alt: "Diagram: een trader ruilt token A naar token B via een aggregator. Token A gaat pool A in, SOL gaat van pool A rechtstreeks naar pool B, en token B komt terug bij de trader. Het SOL-saldo van de trader beweegt nauwelijks, dus een prijs op basis van de wallet klopt niet. De saldowijzigingen van de vaults van beide pools herbouwen de echte trade: A naar B.",
      trader: "trader",
      flat: "SOL-saldo vlak",
      poolA: "pool A",
      poolB: "pool B",
      deltas: "vault-delta's",
      trade: "trade",
      tradeValue: "A naar B",
      wallet: "wallet-SOL",
      walletValue: "± 0",
    },
    en: {
      caption: "The pools' vault deltas rebuild the trade, even when the trader's SOL balance stays flat.",
      alt: "Diagram: a trader swaps token A for token B through an aggregator. Token A goes into pool A, SOL moves from pool A straight to pool B, and token B comes back to the trader. The trader's SOL balance barely moves, so a wallet-based price is wrong. The balance changes of both pools' vaults rebuild the real trade: A to B.",
      trader: "trader",
      flat: "SOL balance flat",
      poolA: "pool A",
      poolB: "pool B",
      deltas: "vault deltas",
      trade: "trade",
      tradeValue: "A to B",
      wallet: "wallet SOL",
      walletValue: "± 0",
    },
  },
  "offerte-pdf-generator": {
    nl: {
      caption: "A4-pagina's met een tabelkop die terugkomt, en paginanummers die in een slotronde worden gestempeld.",
      alt: "Diagram: drie A4-pagina's van een offerte. De tabelkop wordt op elke vervolgpagina opnieuw getekend. Pas als alles getekend is, is het totaal bekend; een slotronde opent dan elke pagina opnieuw en stempelt Pagina 1 van 3, Pagina 2 van 3 en Pagina 3 van 3.",
      header: "tabelkop, op elke pagina",
      pass: "slotronde: Y = 3",
      page: "Pagina",
      of: "van",
      totals: "totaal",
    },
    en: {
      caption: "A4 pages with a repeating table header, and page numbers stamped in a final pass.",
      alt: "Diagram: three A4 pages of a quote. The table header is drawn again on every follow-up page. Only when everything is drawn is the total known; a final pass then reopens every page and stamps Page 1 of 3, Page 2 of 3 and Page 3 of 3.",
      header: "table header, every page",
      pass: "final pass: Y = 3",
      page: "Page",
      of: "of",
      totals: "total",
    },
  },
  paletteforge: {
    nl: {
      caption: "Tintrotaties op de kleurcirkel, alleen in inkt getekend: 30, 120, 180 en 240 graden.",
      alt: "Diagram: een kleurcirkel in inkt, zonder kleur. Vanaf de basistint staan de afgeleide tinten op 30 graden (analoog), 120 en 240 graden (triadisch) en 180 graden (complementair), elk met een boog die de rotatie meet.",
      base: "basis",
      analog: "analoog",
      triadic: "triadisch",
      complement: "complementair",
      model: "hex, RGB, HSL",
    },
    en: {
      caption: "Hue rotations on the colour wheel, drawn in ink only: 30, 120, 180 and 240 degrees.",
      alt: "Diagram: a colour wheel drawn in ink, without colour. From the base hue the derived hues sit at 30 degrees (analogous), 120 and 240 degrees (triadic) and 180 degrees (complementary), each with an arc measuring the rotation.",
      base: "base",
      analog: "analogous",
      triadic: "triadic",
      complement: "complementary",
      model: "hex, RGB, HSL",
    },
  },
} as const;

export type DiagramSlug = keyof typeof diagramCopy;

export function isDiagramSlug(slug: string): slug is DiagramSlug {
  return Object.prototype.hasOwnProperty.call(diagramCopy, slug);
}
