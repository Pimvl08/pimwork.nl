#!/usr/bin/env node
/**
 * Collects code statistics for Pim's projects, read-only, from his own disk.
 *
 * Output: src/content/generated/stats.json (committed as a snapshot; the site
 * imports the JSON and never reads the disk at runtime).
 *
 * Privacy: the output holds only counts, ISO week buckets and dates. No file
 * paths, file names, file contents, commit messages, authors or emails.
 * .env files, keys and spreadsheets are never opened or counted.
 *
 * Usage: node scripts/collect-stats.mjs [--verbose]
 * --verbose prints a per-folder breakdown to the console (never to the JSON).
 */
import { execFileSync } from "node:child_process";
import { lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync, realpathSync } from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "src", "content", "generated", "stats.json");
const VERBOSE = process.argv.includes("--verbose");

const CC = "/Users/pimvanleeuwen/Documents/claude code";
/** Folder to slug, in the display order of src/content/projects.ts. */
const PROJECTS = [
  { slug: "teamsync", dir: join(CC, "teamsync") },
  { slug: "strength-tracker", dir: join(CC, "strength-tracker") },
  { slug: "belhulp", dir: "/Users/pimvanleeuwen/Documents/Belhulp" },
  { slug: "capcraft", dir: join(CC, "capcraft") },
  { slug: "kdp-kleurboek", dir: "/Users/pimvanleeuwen/Projects/KDP-kleurboek" },
  { slug: "solana-forensics", dir: join(CC, "solana-forensics") },
  { slug: "offerte-pdf-generator", dir: join(CC, "offerte-pdf-generator") },
  { slug: "paletteforge", dir: join(CC, "paletteforge") },
];

const SKIP_DIRS = new Set([
  "node_modules", "dist", "build", ".next", "out", "coverage", "target", "venv", ".venv",
  "__pycache__", ".git", "wachtrij", "raw", "clean", "interior", "cover", "proef", "archief",
  "certs", ".vercel", ".netlify", ".turbo", ".cache",
  // Design references and handoff prototypes made with design tools, not product code.
  "design-handoff", "reference",
]);
/** Skipped by relative path (posix style). */
const SKIP_REL = new Set(["data/cache", "data/reports"]);

/** Extension to language key. md is docs, not code. */
const LANG_BY_EXT = {
  ".ts": "ts", ".tsx": "tsx", ".js": "js", ".mjs": "js", ".cjs": "js", ".py": "py", ".rs": "rs",
  ".swift": "swift", ".sql": "sql", ".css": "css", ".html": "html", ".sh": "sh",
};
const DOC_EXT = ".md";
const MAX_BYTES = 1024 * 1024;

/** Never open these, whatever their extension. */
function isForbidden(name) {
  const lower = name.toLowerCase();
  if (lower.startsWith(".env")) return true;
  if (/\.(pem|key|p12|pfx|crt|cer|der|keystore|jks|xlsx|xls|xlsm|ods|numbers|csv|tsv)$/.test(lower)) return true;
  if (/(^|[._-])(secret|secrets|credentials?|private[-_]?key|id_rsa|id_ed25519)([._-]|$)/.test(lower)) return true;
  if (/(^|[.-])lock(\.|$)|-lock\.|\.lock$|lockfile/.test(lower)) return true;
  if (/\.min\.(js|css|mjs)$/.test(lower)) return true;
  return false;
}

/** Recursively yields { abs, rel, name, size, mtimeMs } for regular files, skipping links. */
function* walk(root) {
  const stack = [""];
  while (stack.length) {
    const relDir = stack.pop();
    let entries;
    try {
      entries = readdirSync(join(root, relDir), { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const rel = relDir ? `${relDir}/${e.name}` : e.name;
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name) || SKIP_REL.has(rel)) continue;
        stack.push(rel);
      } else if (e.isFile()) {
        if (isForbidden(e.name)) continue;
        const abs = join(root, rel);
        let st;
        try {
          st = lstatSync(abs);
        } catch {
          continue;
        }
        yield { abs, rel, name: e.name, size: st.size, mtimeMs: st.mtimeMs };
      }
    }
  }
}

function countLines(text) {
  let n = 0;
  for (const line of text.split(/\r?\n/)) if (line.trim() !== "") n++;
  return n;
}

function looksBinary(buf) {
  const len = Math.min(buf.length, 4096);
  for (let i = 0; i < len; i++) if (buf[i] === 0) return true;
  return false;
}

/** Test cases in one file, by kind. */
function countTests(rel, name, text) {
  const out = { js: 0, rust: 0, python: 0, pgtap: 0 };
  const ext = extname(name);
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(name)) {
    const m = text.match(/(?<![\w.$])(?:it|test)(?:\.(?:only|skip|todo|concurrent|each\([^)]*\)))?\s*\(/g);
    out.js += m ? m.length : 0;
  }
  if (ext === ".rs") {
    const m = text.match(/#\[(?:tokio::)?test(?:\([^)]*\))?\]/g);
    out.rust += m ? m.length : 0;
  }
  if (ext === ".py") {
    const m = text.match(/^\s*(?:async\s+)?def\s+test_/gm);
    out.python += m ? m.length : 0;
  }
  if (ext === ".sql" && /(^|\/)supabase\/tests\//.test(rel)) {
    for (const m of text.matchAll(/\bplan\s*\(\s*(\d+)\s*\)/gi)) out.pgtap += Number(m[1]);
  }
  return out;
}

function depsFromPackageJson(text) {
  try {
    const pkg = JSON.parse(text);
    return [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
  } catch {
    return [];
  }
}

function depsFromRequirements(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*/, "").trim())
    .filter((l) => l && !l.startsWith("-"))
    .map((l) => l.split(/[<>=!~;\[\s]/)[0].toLowerCase());
}

/** ISO 8601 week key ("2026-W12") for a calendar date (y, m 1..12, d). */
function isoWeekKey(y, m, d) {
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const year = date.getUTCFullYear();
  const yearStart = Date.UTC(year, 0, 1);
  const week = Math.ceil(((date.getTime() - yearStart) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function gitInfo(dir) {
  let top;
  try {
    top = execFileSync("git", ["-C", dir, "rev-parse", "--show-toplevel"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
  // Only a repository rooted at this folder counts, never a parent repository.
  if (realpathSync(top) !== realpathSync(dir)) return null;
  let log;
  try {
    log = execFileSync("git", ["-C", dir, "log", "--format=%aI"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 16 * 1024 * 1024 });
  } catch {
    return null;
  }
  const stamps = log.split("\n").map((s) => s.trim()).filter(Boolean);
  if (stamps.length === 0) return null;
  const commitsByWeek = {};
  const days = [];
  for (const s of stamps) {
    // The author's own calendar date (the offset is kept in %aI).
    const [y, m, d] = s.slice(0, 10).split("-").map(Number);
    const key = isoWeekKey(y, m, d);
    commitsByWeek[key] = (commitsByWeek[key] ?? 0) + 1;
    days.push(s.slice(0, 10));
  }
  days.sort();
  const sorted = Object.fromEntries(Object.entries(commitsByWeek).sort(([a], [b]) => a.localeCompare(b)));
  return { commitsByWeek: sorted, firstDate: days[0], lastDate: days[days.length - 1] };
}

function isoDay(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function collect({ slug, dir }) {
  const languages = {};
  let docsLines = 0;
  const testsByKind = { js: 0, rust: 0, python: 0, pgtap: 0 };
  const deps = new Set();
  let manifests = 0;
  let minM = Infinity;
  let maxM = -Infinity;
  const perFolder = {};

  for (const f of walk(dir)) {
    if (f.size > MAX_BYTES) continue;
    const ext = extname(f.name).toLowerCase();
    const lang = LANG_BY_EXT[ext];
    const isDoc = ext === DOC_EXT;
    const isPkg = f.name === "package.json";
    const isReq = f.name === "requirements.txt";
    if (!lang && !isDoc && !isPkg && !isReq) continue;

    const buf = readFileSync(f.abs);
    if (looksBinary(buf)) continue;
    const text = buf.toString("utf8");

    if (isPkg) {
      manifests += 1;
      for (const d of depsFromPackageJson(text)) deps.add(`npm:${d}`);
    }
    if (isReq) {
      manifests += 1;
      for (const d of depsFromRequirements(text)) deps.add(`py:${d}`);
    }
    if (isDoc) docsLines += countLines(text);
    if (lang) {
      const lines = countLines(text);
      const slot = (languages[lang] ??= { files: 0, lines: 0 });
      slot.files += 1;
      slot.lines += lines;
      minM = Math.min(minM, f.mtimeMs);
      maxM = Math.max(maxM, f.mtimeMs);
      const t = countTests(f.rel, f.name, text);
      for (const k of Object.keys(t)) testsByKind[k] += t[k];
      if (VERBOSE) {
        const top = f.rel.includes("/") ? f.rel.split("/")[0] + "/" : "(root)";
        perFolder[top] = (perFolder[top] ?? 0) + lines;
      }
    }
  }

  const git = gitInfo(dir);
  const ordered = Object.fromEntries(Object.entries(languages).sort(([, a], [, b]) => b.lines - a.lines));
  const tests = testsByKind.js + testsByKind.rust + testsByKind.python + testsByKind.pgtap;

  if (VERBOSE) {
    console.log(`\n${slug}`);
    for (const [k, v] of Object.entries(perFolder).sort(([, a], [, b]) => b - a)) console.log(`  ${k.padEnd(28)} ${v}`);
  }

  return {
    slug,
    languages: ordered,
    docsLines,
    tests,
    testsByKind,
    // null: no package.json or requirements.txt found, so the count is unknown.
    dependencies: manifests > 0 ? deps.size : null,
    commitsByWeek: git ? git.commitsByWeek : {},
    firstDate: git ? git.firstDate : Number.isFinite(minM) ? isoDay(minM) : null,
    lastDate: git ? git.lastDate : Number.isFinite(maxM) ? isoDay(maxM) : null,
    dateSource: git ? "git" : "files",
  };
}

function main() {
  const projects = [];
  for (const p of PROJECTS) {
    try {
      lstatSync(p.dir);
    } catch {
      console.warn(`skip ${p.slug}: folder not found`);
      continue;
    }
    projects.push(collect(p));
  }

  const totals = { projects: projects.length, files: 0, lines: 0, docsLines: 0, tests: 0, dependencies: 0, commits: 0, languages: {} };
  for (const p of projects) {
    for (const [lang, v] of Object.entries(p.languages)) {
      const slot = (totals.languages[lang] ??= { files: 0, lines: 0 });
      slot.files += v.files;
      slot.lines += v.lines;
      totals.files += v.files;
      totals.lines += v.lines;
    }
    totals.docsLines += p.docsLines;
    totals.tests += p.tests;
    totals.dependencies += p.dependencies ?? 0;
    totals.commits += Object.values(p.commitsByWeek).reduce((a, b) => a + b, 0);
  }
  totals.languages = Object.fromEntries(Object.entries(totals.languages).sort(([, a], [, b]) => b.lines - a.lines));

  const json = { generatedAt: new Date().toISOString(), projects, totals };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(json, null, 2) + "\n");
  console.log(`wrote ${relative(process.cwd(), OUT) || basename(OUT)}: ${projects.length} projects, ${totals.lines} lines, ${totals.tests} tests, ${totals.commits} commits`);
}

main();
