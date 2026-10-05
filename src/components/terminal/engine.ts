/**
 * The terminal's command engine. Pure TypeScript: input in, typed lines and
 * typed actions out. It never produces HTML, so whatever a visitor types is
 * only ever rendered as text (XSS-safe by construction). The UI executes the
 * actions (theme, language, scrolling, navigation).
 */
import type { Locale } from "@/i18n/config";
import { facts, interests, person } from "@/content/person";
import { projects, statusLabel } from "@/content/projects";
import { sections } from "@/content/sections";
import { labCopy } from "@/components/lab/copy";
import { COMMANDS, commandHelp, termCopy, type CommandName } from "./copy";

export const MAX_INPUT = 200;

export type Line =
  | { kind: "text"; text: string }
  | { kind: "muted"; text: string }
  | { kind: "error"; text: string }
  | { kind: "link"; text: string; href: string; external?: boolean }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "table"; head?: string[]; rows: string[][] };

export type Action =
  | { type: "theme"; theme: "dark" | "light" | "toggle" }
  | { type: "lang"; lang: Locale }
  | { type: "goto"; id: string }
  | { type: "open"; slug: string }
  | { type: "clear" }
  | { type: "matrix" }
  | { type: "secret" }
  | { type: "sound"; on: boolean }
  | { type: "egg"; id: string };

export interface CommandContext {
  lang: Locale;
  theme: "dark" | "light";
  soundOn: boolean;
  /** Earlier inputs, oldest first. */
  history: string[];
  now?: Date;
}

export interface CommandResult {
  /** The command that ran, or null for empty, unknown or rejected input. */
  command: CommandName | null;
  lines: Line[];
  actions: Action[];
}

export const VIRTUAL_FILES = ["about.txt", "projects.md", "colofon.md"] as const;

/** Technologies this site itself is built with (from package.json). */
export const SITE_STACK = [
  "Next.js 16.3 (App Router)",
  "React 19.2",
  "TypeScript (strict)",
  "Tailwind CSS 4",
  "motion",
  "Lenis",
  "three.js",
  "zod",
  "Anthropic SDK",
  "Bodoni Moda + Fragment Mono",
];

/* ------------------------------------------------------------------ */
/* Parsing helpers                                                     */
/* ------------------------------------------------------------------ */

export interface Parsed {
  name: string;
  args: string[];
  /** Everything after the command name, spacing preserved (for echo). */
  rest: string;
}

/** Trims, drops one leading slash and splits into name and arguments. */
export function parseInput(raw: string): Parsed {
  const trimmed = raw.trim().replace(/^\//, "").trimStart();
  const match = /^(\S*)\s*([\s\S]*)$/.exec(trimmed);
  const name = (match?.[1] ?? "").toLowerCase();
  const rest = match?.[2] ?? "";
  return { name, rest, args: rest.split(/\s+/).filter(Boolean) };
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** The closest command, or null when nothing is reasonably close. */
export function suggestCommand(input: string): CommandName | null {
  const word = input.toLowerCase().slice(0, 24);
  if (!word) return null;
  let best: CommandName | null = null;
  let bestDistance = Infinity;
  for (const cmd of COMMANDS) {
    const d = cmd.startsWith(word) ? 0.5 : levenshtein(word, cmd);
    if (d < bestDistance) {
      bestDistance = d;
      best = cmd;
    }
  }
  const allowed = Math.max(2, Math.floor(word.length / 2));
  return bestDistance <= allowed ? best : null;
}

const isCommand = (name: string): name is CommandName => (COMMANDS as readonly string[]).includes(name);

/* ------------------------------------------------------------------ */
/* Content helpers                                                     */
/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, "0");

export function findProject(arg: string) {
  const key = arg.trim().toLowerCase();
  if (!key) return undefined;
  if (/^\d{1,2}$/.test(key)) return projects[Number(key) - 1];
  return (
    projects.find((p) => p.slug === key) ??
    projects.find((p) => p.name.toLowerCase() === key) ??
    projects.find((p) => p.slug.startsWith(key) || p.name.toLowerCase().replace(/\s+/g, "").startsWith(key.replace(/\s+/g, "")))
  );
}

export function findSection(arg: string) {
  const key = arg.trim().toLowerCase().replace(/^#/, "");
  if (!key) return undefined;
  if (/^\d{1,2}$/.test(key)) return sections.find((s) => Number(s.numeral) === Number(key));
  return sections.find((s) => s.id === key || s.label.nl.toLowerCase() === key || s.label.en.toLowerCase() === key);
}

/** Normalises a stack entry into one or more technology names. */
export function normaliseTech(entry: string, lang: Locale): string[] {
  return entry
    .split(/\s+\+\s+/)
    .map((part) =>
      part
        .replace(/\s*\([^)]*\)\s*/g, " ")
        .replace(/\s+strict$/i, "")
        .replace(/\s+v?\d+(\.\d+)*$/i, "")
        .replace(/^Supabase Auth$/i, "Supabase")
        .replace(/^Chrome-extensie$/i, lang === "en" ? "Chrome extension" : "Chrome-extensie")
        .trim(),
    )
    .filter(Boolean);
}

/** Every technology in Pim's projects, counted per project, most used first. */
export function countSkills(lang: Locale): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    const seen = new Set<string>();
    for (const entry of project.stack) for (const tech of normaliseTech(entry, lang)) seen.add(tech);
    for (const tech of seen) counts.set(tech, (counts.get(tech) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function virtualFile(file: string, lang: Locale): string[] | null {
  const t = termCopy[lang];
  if (file === "about.txt") {
    return [
      `${person.name}`,
      t.aboutIntro,
      ...facts.map((f) => `  ${f.label[lang]}: ${f.value ? f.value[lang] : t.open}`),
      "",
      t.interests,
      ...interests.map((i) => `  ${i.title[lang]}: ${i.body[lang]}`),
    ];
  }
  if (file === "projects.md") {
    return [
      lang === "nl" ? "# Projecten" : "# Projects",
      "",
      ...projects.map((p, i) => `${pad(i + 1)}. ${p.name} (${statusLabel[p.status][lang]}, ${p.period.from.slice(0, 4)}): ${p.short[lang]}`),
    ];
  }
  if (file === "colofon.md") {
    return lang === "nl"
      ? [
          "# Colofon",
          "",
          "Wereld: Gevouwen Schaal. Eén lijn maakt de vorm.",
          "Letters: Bodoni Moda (tekst) en Fragment Mono (code en data).",
          `Gebouwd met: ${SITE_STACK.slice(0, 9).join(", ")}.`,
          "Gemaakt door Pim, met Claude Code als dagelijks gereedschap.",
          `Broncode en ander werk: ${person.github.href}`,
        ]
      : [
          "# Colophon",
          "",
          "World: Folded Shell. One line makes the form.",
          "Type: Bodoni Moda (text) and Fragment Mono (code and data).",
          `Built with: ${SITE_STACK.slice(0, 9).join(", ")}.`,
          "Made by Pim, with Claude Code as his daily tool.",
          `Source and other work: ${person.github.href}`,
        ];
  }
  return null;
}

function formatDate(now: Date, lang: Locale): string {
  return new Intl.DateTimeFormat(lang === "nl" ? "nl-NL" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
}

/* ------------------------------------------------------------------ */
/* The engine                                                          */
/* ------------------------------------------------------------------ */

const out = (command: CommandName | null, lines: Line[], actions: Action[] = []): CommandResult => ({ command, lines, actions });

export function runCommand(raw: string, ctx: CommandContext): CommandResult {
  const { lang } = ctx;
  const t = termCopy[lang];
  if (raw.length > MAX_INPUT || raw.trim().length > MAX_INPUT) return out(null, [{ kind: "error", text: t.tooLong }]);
  const { name, args, rest } = parseInput(raw);
  if (!name) return out(null, []);

  if (!isCommand(name)) {
    const suggestion = suggestCommand(name);
    return out(null, [
      { kind: "error", text: t.unknown(name.slice(0, 40)) },
      { kind: "muted", text: suggestion ? t.didYouMean(suggestion) : t.tryHelp },
    ]);
  }

  const arg = (args[0] ?? "").toLowerCase();

  switch (name) {
    case "help": {
      if (arg) {
        const target = arg.replace(/^\//, "");
        if (!isCommand(target)) return out(name, [{ kind: "error", text: t.noHelpFor(target.slice(0, 40)) }]);
        const h = commandHelp[target][lang];
        return out(name, [{ kind: "text", text: h.usage }, { kind: "muted", text: h.text }]);
      }
      return out(name, [
        { kind: "muted", text: t.helpTitle },
        { kind: "table", rows: COMMANDS.map((c) => [commandHelp[c][lang].usage, commandHelp[c][lang].text]) },
        { kind: "muted", text: t.helpFooter },
      ]);
    }

    case "about":
      return out(name, [
        { kind: "text", text: t.aboutIntro },
        { kind: "table", rows: facts.map((f) => [f.label[lang], f.value ? f.value[lang] : t.open]) },
        { kind: "muted", text: t.interests },
        { kind: "list", items: interests.map((i) => i.title[lang]) },
      ]);

    case "projects":
      return out(name, [
        { kind: "table", rows: projects.map((p, i) => [pad(i + 1), p.name, p.category[lang], statusLabel[p.status][lang]]) },
        { kind: "muted", text: t.projectsHint },
      ]);

    case "open": {
      if (!arg) return out(name, [{ kind: "muted", text: t.openUsage }]);
      const project = findProject(args.join(" "));
      if (!project) return out(name, [{ kind: "error", text: t.openUnknown(arg.slice(0, 40)) }, { kind: "muted", text: t.projectsHint }]);
      return out(
        name,
        [
          { kind: "text", text: t.opening(project.name) },
          { kind: "link", text: `/${lang}/werk/${project.slug}`, href: `/${lang}/werk/${project.slug}` },
        ],
        [{ type: "open", slug: project.slug }],
      );
    }

    case "experiments": {
      const list = labCopy.experiments[lang];
      return out(name, [
        { kind: "table", rows: list.map((e, i) => [pad(i + 1), e.name, e.kind]) },
        { kind: "muted", text: t.experimentsHint },
      ]);
    }

    case "skills": {
      const skills = countSkills(lang);
      return out(name, [
        { kind: "muted", text: t.skillsIntro(skills.length, projects.length) },
        { kind: "table", head: t.skillsCol, rows: skills.map((s) => [s.name, String(s.count)]) },
      ]);
    }

    case "stack":
      return out(name, [{ kind: "muted", text: t.stackIntro }, { kind: "list", items: SITE_STACK }, { kind: "muted", text: t.stackNote }]);

    case "contact":
      return out(name, [
        { kind: "text", text: t.contactIntro },
        { kind: "link", text: `github.com/${person.github.handle}`, href: person.github.href, external: true },
        { kind: "muted", text: t.contactPlate },
      ]);

    case "goto": {
      const plates: Line = { kind: "table", rows: sections.map((s) => [s.numeral, s.id, s.label[lang]]) };
      if (!arg) return out(name, [{ kind: "muted", text: t.gotoUsage }, plates]);
      const section = findSection(arg);
      if (!section) return out(name, [{ kind: "error", text: t.gotoUnknown(arg.slice(0, 40)) }, { kind: "muted", text: t.gotoUsage }, plates]);
      return out(name, [{ kind: "text", text: t.going(`${section.numeral} ${section.label[lang]}`) }], [{ type: "goto", id: section.id }]);
    }

    case "theme": {
      if (!arg) return out(name, [{ kind: "muted", text: t.themeNow(ctx.theme) }]);
      if (arg !== "dark" && arg !== "light" && arg !== "toggle") return out(name, [{ kind: "error", text: t.themeBad }]);
      const next = arg === "toggle" ? (ctx.theme === "dark" ? "light" : "dark") : arg;
      return out(name, [{ kind: "text", text: t.themeSet(next) }], [{ type: "theme", theme: arg }]);
    }

    case "lang": {
      if (!arg) return out(name, [{ kind: "muted", text: t.langNow }]);
      if (arg !== "nl" && arg !== "en") return out(name, [{ kind: "error", text: t.langBad }]);
      if (arg === lang) return out(name, [{ kind: "muted", text: t.langSet(arg) }]);
      return out(name, [{ kind: "text", text: t.langSet(arg) }], [{ type: "lang", lang: arg }]);
    }

    case "sound": {
      if (!arg) return out(name, [{ kind: "muted", text: t.soundNow(ctx.soundOn) }]);
      if (arg !== "on" && arg !== "off" && arg !== "aan" && arg !== "uit") return out(name, [{ kind: "error", text: t.soundBad }]);
      const on = arg === "on" || arg === "aan";
      return out(name, [{ kind: "text", text: t.soundSet(on) }], [{ type: "sound", on }]);
    }

    case "clear":
      return out(name, [], [{ type: "clear" }]);

    case "whoami":
      return out(name, [{ kind: "text", text: t.whoami[0] }, { kind: "muted", text: t.whoami[1] }]);

    case "ls": {
      const all = args.some((a) => /^-\w*a/.test(a));
      const files: string[] = [...VIRTUAL_FILES];
      if (all) files.unshift(".geheim");
      return out(name, [{ kind: "list", items: files }, ...(all ? [] : [{ kind: "muted", text: t.lsHidden } as Line])]);
    }

    case "cat": {
      if (!arg) return out(name, [{ kind: "muted", text: t.catUsage }]);
      if (arg === ".geheim") return out(name, [{ kind: "muted", text: t.catSecret }]);
      const body = virtualFile(arg, lang);
      if (!body) return out(name, [{ kind: "error", text: t.catUnknown(arg.slice(0, 40)) }]);
      return out(name, [{ kind: "text", text: body.join("\n") }]);
    }

    case "date":
      return out(name, [{ kind: "text", text: formatDate(ctx.now ?? new Date(), lang) }]);

    case "echo":
      return out(name, [{ kind: "text", text: rest.length ? rest : t.echoEmpty }]);

    case "history":
      if (!ctx.history.length) return out(name, [{ kind: "muted", text: t.historyEmpty }]);
      return out(name, [{ kind: "table", rows: ctx.history.map((h, i) => [String(i + 1).padStart(3, " "), h]) }]);

    case "matrix":
      return out(name, [{ kind: "muted", text: t.matrix }], [{ type: "matrix" }, { type: "egg", id: "rain" }]);

    case "secret":
      return out(name, [{ kind: "text", text: t.secret }], [{ type: "secret" }]);

    case "konami":
      return out(name, [{ kind: "muted", text: t.konami }]);

    case "sudo":
      return out(name, [{ kind: "error", text: t.sudo }], [{ type: "egg", id: "sudo" }]);
  }
}

/* ------------------------------------------------------------------ */
/* Tab completion                                                      */
/* ------------------------------------------------------------------ */

function argOptions(cmd: string): string[] {
  switch (cmd) {
    case "open":
      return projects.map((p) => p.slug);
    case "goto":
      return sections.map((s) => s.id);
    case "theme":
      return ["dark", "light", "toggle"];
    case "lang":
      return ["nl", "en"];
    case "sound":
      return ["on", "off"];
    case "cat":
      return [...VIRTUAL_FILES];
    case "help":
      return [...COMMANDS];
    default:
      return [];
  }
}

function commonPrefix(words: string[]): string {
  if (!words.length) return "";
  let prefix = words[0];
  for (const w of words) while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return prefix;
}

/** Completes the input. Returns the new value and, when ambiguous, the options. */
export function complete(input: string): { value: string; options: string[] } {
  const slash = input.trimStart().startsWith("/") ? "/" : "";
  const body = input.trimStart().replace(/^\//, "");
  const spaceAt = body.search(/\s/);
  if (spaceAt === -1) {
    const word = body.toLowerCase();
    const matches = COMMANDS.filter((c) => c.startsWith(word));
    if (matches.length === 1) return { value: `${slash}${matches[0]} `, options: [] };
    if (matches.length === 0) return { value: input, options: [] };
    const prefix = commonPrefix([...matches]);
    return { value: `${slash}${prefix.length > word.length ? prefix : body}`, options: matches.length < COMMANDS.length ? [...matches] : [] };
  }
  const cmd = body.slice(0, spaceAt).toLowerCase();
  const partial = body.slice(spaceAt).trimStart().toLowerCase();
  if (partial.includes(" ")) return { value: input, options: [] };
  const matches = argOptions(cmd).filter((o) => o.startsWith(partial));
  const head = `${slash}${body.slice(0, spaceAt)} `;
  if (matches.length === 1) return { value: `${head}${matches[0]}`, options: [] };
  if (matches.length === 0) return { value: input, options: [] };
  const prefix = commonPrefix(matches);
  return { value: `${head}${prefix.length > partial.length ? prefix : partial}`, options: matches };
}

/* ------------------------------------------------------------------ */
/* Command palette                                                     */
/* ------------------------------------------------------------------ */

export interface PaletteItem {
  id: string;
  group: "command" | "plate" | "project";
  label: string;
  hint: string;
  /** The terminal command this item runs. */
  command: string;
  /** Extra words that should match (other language, slug). */
  keywords: string;
}

export function paletteItems(lang: Locale): PaletteItem[] {
  const commands: PaletteItem[] = COMMANDS.filter((c) => c !== "sudo").map((c) => ({
    id: `cmd-${c}`,
    group: "command",
    label: `/${c}`,
    hint: commandHelp[c][lang].text,
    command: c,
    keywords: c,
  }));
  const plates: PaletteItem[] = sections.map((s) => ({
    id: `plate-${s.id}`,
    group: "plate",
    label: `${s.numeral} ${s.label[lang]}`,
    hint: `goto ${s.id}`,
    command: `goto ${s.id}`,
    keywords: `${s.id} ${s.label.nl} ${s.label.en}`,
  }));
  const work: PaletteItem[] = projects.map((p, i) => ({
    id: `project-${p.slug}`,
    group: "project",
    label: p.name,
    hint: p.category[lang],
    command: `open ${p.slug}`,
    keywords: `${pad(i + 1)} ${p.slug} ${p.stack.join(" ")}`,
  }));
  return [...plates, ...work, ...commands];
}

/**
 * Fuzzy score of `query` against `text`: every query character must appear in
 * order. Consecutive runs and word starts score higher. Returns -1 for no match.
 */
export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase().replace(/^\//, "").replace(/\s+/g, "");
  const s = text.toLowerCase();
  if (!q) return 0;
  const direct = s.indexOf(q);
  if (direct !== -1) return 100 - direct + (direct === 0 || /[\s/-]/.test(s[direct - 1]) ? 20 : 0);
  let score = 0;
  let pos = 0;
  let run = 0;
  for (const ch of q) {
    const found = s.indexOf(ch, pos);
    if (found === -1) return -1;
    run = found === pos ? run + 1 : 0;
    score += 1 + run * 2 + (found === 0 || /[\s/-]/.test(s[found - 1]) ? 3 : 0);
    pos = found + 1;
  }
  return score;
}

export function filterPalette(items: PaletteItem[], query: string): PaletteItem[] {
  if (!query.trim()) return items;
  return items
    .map((item, index) => ({ item, index, score: Math.max(fuzzyScore(query, item.label), fuzzyScore(query, item.keywords) - 5) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.item);
}
