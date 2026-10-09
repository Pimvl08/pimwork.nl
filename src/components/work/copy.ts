import type { Bilingual } from "@/i18n/config";

/** Interface copy for the work page, the featured work, the project pages and the sheet. */
export const workCopy: Bilingual<{
  title: string;
  lead: string;
  metaTitle: string;
  metaDescription: string;
  listLabel: string;
  featuredTitle: string;
  featuredLead: string;
  allProjects: string;
  view: string;
  audience: string;
  problem: string;
  solution: string;
  benefits: string;
  craft: string;
  challenge: string;
  media: string;
  stack: string;
  links: string;
  pager: string;
  prev: string;
  next: string;
  back: string;
  backLab: string;
  related: string;
  close: string;
  fig: string;
}> = {
  nl: {
    title: "Werk",
    lead: "Dit heb ik gebouwd, van een desktopapp voor een heel team tot een drukklaar kleurboek. Bij elk project lees je voor wie het is, welk probleem het oplost en hoe ik het heb aangepakt.",
    metaTitle: "Werk: voorbeelden van software op maat",
    metaDescription: "Wat ik heb gebouwd, van een koppeling met Exact Online tot een offertetool voor aannemers. Per project: voor wie het is en welk probleem het oplost.",
    listLabel: "Projecten",
    featuredTitle: "Uitgelicht werk",
    featuredLead: "Drie projecten die laten zien wat ik bouw: voor een belteam, voor een team dat samen bestanden deelt en voor een vakman die snel een offerte wil sturen.",
    allProjects: "Alle projecten",
    view: "Bekijk",
    audience: "Voor wie",
    problem: "Het probleem",
    solution: "Wat ik bouwde",
    benefits: "Wat het oplevert",
    craft: "Onder de motorkap",
    challenge: "Het lastigste stuk",
    media: "In beeld",
    stack: "Gebouwd met",
    links: "Links",
    pager: "Andere projecten",
    prev: "Vorig project",
    next: "Volgend project",
    back: "Alle projecten",
    backLab: "Terug naar het lab",
    related: "Iets vergelijkbaars nodig?",
    close: "Sluiten",
    fig: "fig.",
  },
  en: {
    title: "Work",
    lead: "This is what I have built, from a desktop app for a whole team to a print-ready coloring book. For each project you can read who it is for, which problem it solves and how I approached it.",
    metaTitle: "Work: examples of custom software",
    metaDescription: "What I have built, from an Exact Online integration to a quoting tool for contractors. For each project: who it is for and which problem it solves.",
    listLabel: "Projects",
    featuredTitle: "Selected work",
    featuredLead: "Three projects that show what I build: for a calling team, for a team that shares files and for a tradesperson who wants to send a quote fast.",
    allProjects: "All projects",
    view: "View",
    audience: "Who it is for",
    problem: "The problem",
    solution: "What I built",
    benefits: "What it delivers",
    craft: "Under the hood",
    challenge: "The hardest part",
    media: "Screens",
    stack: "Built with",
    links: "Links",
    pager: "Other projects",
    prev: "Previous project",
    next: "Next project",
    back: "All projects",
    backLab: "Back to the lab",
    related: "Need something similar?",
    close: "Close",
    fig: "fig.",
  },
};

/**
 * Words inside the authored plate diagrams. Every label describes the real
 * mechanism of the project as written in content/projects.ts. No dates, costs
 * or internal numbers.
 */
export const diagramCopy = {
  "exact-online": {
    nl: {
      caption: "Bedrijven uit openbare bronnen, als verkoopkans in Exact Online gezet.",
      alt: "Diagram: drie openbare bronnen leveren bedrijfsgegevens aan. De tool haalt ze op en houdt alleen over wat bruikbaar is. Daarna zet hij elk bedrijf als nieuwe verkoopkans in Exact Online, met bedrijf en contactpersoon. Zo staat de lijst klaar als de dag begint.",
      sources: "openbare bronnen",
      fetch: "ophalen",
      sift: "wat bruikbaar is",
      exact: "Exact Online",
      company: "bedrijf",
      contact: "contact",
      opportunity: "nieuwe verkoopkans",
      ready: "klaar als de dag begint",
    },
    en: {
      caption: "Companies from public sources, put into Exact Online as sales opportunities.",
      alt: "Diagram: three public sources supply company details. The tool collects them and keeps only what is useful. It then puts each company into Exact Online as a new sales opportunity, with company and contact person. That way the list is ready when the day starts.",
      sources: "public sources",
      fetch: "collect",
      sift: "what is useful",
      exact: "Exact Online",
      company: "company",
      contact: "contact",
      opportunity: "new opportunity",
      ready: "ready when the day starts",
    },
  },
  "wordpress-koppeling": {
    nl: {
      caption: "Portalsites zijn het begin: bijna alles met een koppeling kan aan WordPress hangen.",
      alt: "Diagram: WordPress in het midden. Een portalsite is er met een doorgetrokken lijn aan gekoppeld en wisselt gegevens in twee richtingen uit; dat is gebouwd. Met stippellijnen hangen er andere systemen omheen die op dezelfde manier gekoppeld kunnen worden: een CRM, een spreadsheet, een webshop, een formulier en een mailbox.",
      hub: "WordPress",
      portal: "portalsite",
      others: ["CRM", "spreadsheet", "webshop", "formulier", "mailbox"],
      built: "gebouwd",
      could: "kan ook",
      both: "twee kanten op",
    },
    en: {
      caption: "Portal sites are the start: almost anything with an interface can connect to WordPress.",
      alt: "Diagram: WordPress in the middle. A portal site is connected to it with a solid line and exchanges data both ways; that is built. Around it, with dotted lines, are other systems that can be connected the same way: a CRM, a spreadsheet, a web shop, a form and a mailbox.",
      hub: "WordPress",
      portal: "portal site",
      others: ["CRM", "spreadsheet", "web shop", "form", "mailbox"],
      built: "built",
      could: "possible too",
      both: "both ways",
    },
  },
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
  "kdp-kleurboek": {
    nl: {
      caption: "Van ruwe tekening naar gekeurde vectorplaat: elke plaat wordt op drie punten gecontroleerd.",
      alt: "Diagram: vier stappen per kleurplaat. Een ruwe tekening met grijze spikkels wordt opgeschoond, met potrace omgezet naar strakke vectorlijnen en daarna gekeurd. De keuring controleert de lijndikte, te kleine vlakjes en losse vormen die nergens aan vastzitten. Pas als alle drie in orde zijn, gaat de plaat het boek in.",
      stages: ["ruwe tekening", "opgeschoond", "vector", "keuring"],
      subs: ["grijs, spikkels", "drempelwaarde", "potrace", "0 grijze pixels"],
      inspect: "keuring per plaat",
      checks: ["lijndikte", "te kleine vlakjes", "losse vormen"],
      pass: "in orde",
      verdict: "het boek in",
    },
    en: {
      caption: "From raw drawing to inspected vector plate: every plate is checked on three points.",
      alt: "Diagram: four steps per coloring page. A raw drawing with grey speckles is cleaned up, turned into clean vector lines with potrace and then inspected. The inspection checks the line weight, regions that are too small and loose shapes that float free. Only when all three pass does the plate go into the book.",
      stages: ["raw drawing", "cleaned", "vector", "inspection"],
      subs: ["grey, speckles", "threshold", "potrace", "0 grey pixels"],
      inspect: "inspection per plate",
      checks: ["line weight", "tiny regions", "loose shapes"],
      pass: "passed",
      verdict: "into the book",
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
} as const;

export type DiagramSlug = keyof typeof diagramCopy;

export function isDiagramSlug(slug: string): slug is DiagramSlug {
  return Object.prototype.hasOwnProperty.call(diagramCopy, slug);
}
