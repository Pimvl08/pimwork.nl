import type { Bilingual } from "@/i18n/config";
import type { FamilyId, TestKindId } from "./stats";

interface ChartCopy {
  title: string;
  guide: string;
  /** Longer text alternative for screen readers. */
  describe: string;
}

export interface DataCopy {
  title: string;
  lead: (date: string) => string;
  method: string;
  missing: (names: string) => string;
  showTable: string;
  hideTable: string;
  families: Record<FamilyId, string>;
  testKinds: Record<TestKindId, string>;
  lines: ChartCopy & {
    project: string;
    total: string;
    files: string;
    docs: string;
    deps: string;
    noManifest: string;
    scale: string;
    legend: string;
    linesUnit: string;
    filesUnit: string;
    noCode: string;
  };
  timeline: ChartCopy & {
    project: string;
    source: string;
    sourceGit: string;
    sourceFiles: string;
    fileBand: string;
    weeks: string;
    commits: string;
    total: string;
    period: string;
    noCommits: string;
    outside: (n: string) => string;
    dotKey: string;
    weekOf: (date: string) => string;
    commitsN: (n: string, one: boolean) => string;
    filesSpan: (from: string, to: string) => string;
    months: string[];
  };
  tests: ChartCopy & {
    project: string;
    total: string;
    none: string;
    legend: string;
    kind: string;
  };
  stack: ChartCopy & {
    tech: string;
    used: string;
    count: string;
    yes: string;
    no: string;
    alone: (name: string) => string;
    uses: (project: string, tech: string) => string;
  };
}

export const dataCopy: Bilingual<DataCopy> = {
  nl: {
    title: "Data",
    lead: (date) => `Gemeten op Pims eigen schijf, ${date}.`,
    method:
      "Een klein script leest de acht projectmappen alleen maar en telt: regels per taal, testgevallen, afhankelijkheden en commits per week. Het bewaart geen bestandsnamen, geen inhoud en geen commitberichten. Mappen als node_modules, builds, virtuele omgevingen en ontwerpvoorbeelden tellen niet mee.",
    missing: (names) => `Voor ${names} vond het script geen map, dus daar staat niets.`,
    showTable: "Toon als tabel",
    hideTable: "Verberg tabel",
    families: {
      typescript: "TypeScript",
      javascript: "JavaScript",
      python: "Python",
      rust: "Rust",
      sql: "SQL",
      web: "HTML en CSS",
      other: "Shell en Swift",
    },
    testKinds: {
      js: "TS/JS-testgevallen",
      rust: "Rust-tests",
      python: "Python-tests",
      pgtap: "Databasecontroles (pgTAP)",
    },
    lines: {
      title: "Waar de regels zitten",
      guide: "Elke straal is een project: hoe langer, hoe meer niet-lege regels code. De vulling laat de taal zien.",
      describe:
        "Waaierdiagram met een straal per project. De lengte is het aantal niet-lege regels code, opgedeeld per taal. Documentatie in Markdown telt apart. De tabel eronder geeft alle getallen.",
      project: "Project",
      total: "Regels code",
      files: "Bestanden",
      docs: "Regels documentatie",
      deps: "Afhankelijkheden",
      noManifest: "geen lijst gevonden",
      scale: "regels",
      legend: "Talen",
      linesUnit: "regels",
      filesUnit: "bestanden",
      noCode: "geen code gevonden",
    },
    timeline: {
      title: "Wanneer er gewerkt is",
      guide:
        "Maart tot oktober 2026 langs de boog, één spoor per project, vroegste bovenaan. Een stip is een week met commits, groter is meer.",
      describe:
        "Tijdlijn in de vorm van een boog. Per project een spoor. Projecten met git tonen commits per week als stippen; projecten zonder git tonen een smalle band op basis van bestandsdatums.",
      project: "Project",
      source: "Bron",
      sourceGit: "git-commits",
      sourceFiles: "op basis van bestandsdatums",
      fileBand: "Smalle band: op basis van bestandsdatums",
      weeks: "Weken met commits",
      commits: "Commits",
      total: "Totaal",
      period: "Eerste en laatste dag",
      noCommits: "geen git, dus geen commits",
      outside: (n) => `${n} buiten maart tot oktober`,
      dotKey: "Stip: commits in die week",
      weekOf: (date) => `week van ${date}`,
      commitsN: (n, one) => `${n} ${one ? "commit" : "commits"}`,
      filesSpan: (from, to) => (from === to ? `${from}, op basis van bestandsdatums` : `${from} tot ${to}, op basis van bestandsdatums`),
      months: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
    },
    tests: {
      title: "Wat er gecontroleerd wordt",
      guide: "Geautomatiseerde testgevallen per project, geteld in de testbestanden zelf.",
      describe:
        "Liggende staven met het aantal testgevallen per project, opgedeeld naar soort. Projecten zonder tests staan er ook in, met nul.",
      project: "Project",
      total: "Testgevallen",
      none: "geen tests gevonden",
      legend: "Soort test",
      kind: "Soort",
    },
    stack: {
      title: "Gedeelde bouwstenen",
      guide: "Technieken die in minstens twee projecten terugkomen. Een stip: staat in de stack van dat project.",
      describe:
        "Matrix met technieken als rijen en projecten als kolommen. Een stip betekent dat de techniek in de stack van dat project staat.",
      tech: "Techniek",
      used: "Gebruikt in",
      count: "Aantal",
      yes: "ja",
      no: "nee",
      alone: (name) => `${name} deelt geen van deze bouwstenen.`,
      uses: (project, tech) => `${project} gebruikt ${tech}`,
    },
  },
  en: {
    title: "Data",
    lead: (date) => `Measured on Pim's own disk, ${date}.`,
    method:
      "A small script only reads the eight project folders and counts: lines per language, test cases, dependencies and commits per week. It keeps no file names, no contents and no commit messages. Folders such as node_modules, builds, virtual environments and design references are not counted.",
    missing: (names) => `The script found no folder for ${names}, so nothing is shown there.`,
    showTable: "Show as table",
    hideTable: "Hide table",
    families: {
      typescript: "TypeScript",
      javascript: "JavaScript",
      python: "Python",
      rust: "Rust",
      sql: "SQL",
      web: "HTML and CSS",
      other: "Shell and Swift",
    },
    testKinds: {
      js: "TS/JS test cases",
      rust: "Rust tests",
      python: "Python tests",
      pgtap: "Database checks (pgTAP)",
    },
    lines: {
      title: "Where the lines live",
      guide: "Each ray is a project: the longer it is, the more non-blank lines of code. The fill shows the language.",
      describe:
        "Fan chart with one ray per project. Its length is the number of non-blank lines of code, split by language. Markdown documentation is counted separately. The table below holds every number.",
      project: "Project",
      total: "Lines of code",
      files: "Files",
      docs: "Lines of documentation",
      deps: "Dependencies",
      noManifest: "no manifest found",
      scale: "lines",
      legend: "Languages",
      linesUnit: "lines",
      filesUnit: "files",
      noCode: "no code found",
    },
    timeline: {
      title: "When the work happened",
      guide:
        "March to October 2026 along the arc, one track per project, earliest at the top. A dot is a week with commits, bigger means more.",
      describe:
        "Timeline shaped as an arc. One track per project. Projects with git show commits per week as dots; projects without git show a thin band based on file dates.",
      project: "Project",
      source: "Source",
      sourceGit: "git commits",
      sourceFiles: "based on file dates",
      fileBand: "Thin band: based on file dates",
      weeks: "Weeks with commits",
      commits: "Commits",
      total: "Total",
      period: "First and last day",
      noCommits: "no git, so no commits",
      outside: (n) => `${n} outside March to October`,
      dotKey: "Dot: commits in that week",
      weekOf: (date) => `week of ${date}`,
      commitsN: (n, one) => `${n} ${one ? "commit" : "commits"}`,
      filesSpan: (from, to) => (from === to ? `${from}, based on file dates` : `${from} to ${to}, based on file dates`),
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    },
    tests: {
      title: "What gets checked",
      guide: "Automated test cases per project, counted in the test files themselves.",
      describe:
        "Horizontal bars with the number of test cases per project, split by kind. Projects without tests are listed too, at zero.",
      project: "Project",
      total: "Test cases",
      none: "no tests found",
      legend: "Kind of test",
      kind: "Kind",
    },
    stack: {
      title: "Shared building blocks",
      guide: "Technologies that return in at least two projects. A dot: it is in that project's stack.",
      describe:
        "Matrix with technologies as rows and projects as columns. A dot means the technology is in that project's stack.",
      tech: "Technology",
      used: "Used in",
      count: "Count",
      yes: "yes",
      no: "no",
      alone: (name) => `${name} shares none of these building blocks.`,
      uses: (project, tech) => `${project} uses ${tech}`,
    },
  },
};
