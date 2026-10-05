/**
 * Local answer engine: no language model. It scores real sentences from
 * projects.ts and person.ts by keyword overlap with the question and composes
 * an answer from the best ones, plus links. Everything it says is a sentence
 * that already stands on this site.
 */
import type { Locale } from "@/i18n/config";
import { facts, interests, person } from "@/content/person";
import { projects } from "@/content/projects";

const STOPWORDS = new Set(
  (
    "de het een en of van in op aan met voor door bij naar uit over als dan dat die dit wat wie waar hoe welke welk " +
    "is zijn was waren wordt worden werd heeft hebben had kan kun kunt wil wilt doet doen deed ik jij je jouw hij zij ze " +
    "wij we ons zijn haar hem er niet geen wel ook nog al maar om te tot zo heel veel meer meest iets alles " +
    "the a an and or of in on at to for by with from about as than that this these those what who whom where how which why " +
    "is are was were be been being has have had do does did can could would should will i you he she it we they his her its " +
    "their our my your me him them not no yes also still but so very much more most some any all there here " +
    "pim pims project projects projecten use uses used using gebruikt gebruik gebruiken doet does make makes maakt tell vertel"
  ).split(/\s+/),
);

/** Extra words per fact id, so everyday questions find the right fact. */
const FACT_WORDS: Record<string, string> = {
  tool: "tool tools gereedschap claude ai werkt works daily dagelijks",
  machine: "machine laptop computer mac macbook hardware",
  projects: "hoeveel many count aantal",
  github: "github code source broncode",
  study: "study studie opleiding school studeert studies education student",
  place: "place woonplaats based live lives woont wonen city stad",
  next: "next volgende plan plans future toekomst",
};

const SUFFIXES = ["ingen", "heden", "ings", "ing", "tjes", "jes", "eden", "ers", "ies", "es", "ed", "en", "er", "ly", "s", "e"];

/** Lowercases and strips accents, so "één" matches "een". */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** A deliberately simple Dutch/English stemmer: strips one common suffix. */
export function stem(word: string): string {
  for (const suffix of SUFFIXES) {
    if (word.length - suffix.length >= 3 && word.endsWith(suffix)) {
      let base = word.slice(0, -suffix.length);
      // Dutch doubled consonant: "projecten" -> "project", "apps" -> "app", "bellen" -> "bel".
      if (base.length > 3 && base[base.length - 1] === base[base.length - 2] && !/[aeiou]/.test(base[base.length - 1])) base = base.slice(0, -1);
      return base;
    }
  }
  return word;
}

export function tokenize(text: string): string[] {
  return fold(text)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

type Role = "short" | "summary" | "detail" | "metric" | "fact";

export interface Sentence {
  text: string;
  /** Project slug this sentence belongs to, if any. */
  slug?: string;
  role: Role;
  tokens: Set<string>;
}

/** When a project is named, its overview sentences come first. */
const ROLE_BOOST: Record<Role, number> = { short: 3, summary: 2, detail: 1, metric: 0.5, fact: 0 };

/** Splits a paragraph into sentences without breaking on "v0.3" or "Next.js". */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function buildCorpus(lang: Locale): Sentence[] {
  const out: Sentence[] = [];
  const add = (role: Role, text: string, slug?: string, extra = "") => out.push({ text, slug, role, tokens: new Set(tokenize(`${text} ${extra}`)) });

  for (const p of projects) {
    const tag = `${p.name} ${p.slug}`;
    add("short", `${p.name}: ${p.short[lang]}`, p.slug, p.category[lang]);
    for (const s of splitSentences(p.summary[lang])) add("summary", s, p.slug, p.name);
    for (const s of splitSentences(p.problem[lang])) add("detail", s, p.slug, p.name);
    for (const h of p.highlights[lang]) add("detail", h, p.slug, tag);
    for (const h of p.hardProblems[lang]) add("detail", h, p.slug, tag);
    for (const m of p.metrics) add("metric", `${p.name}, ${m.label[lang]}: ${m.value[lang]}.`, p.slug);
    add(
      "detail",
      lang === "nl" ? `${p.name} is gebouwd met ${p.stack.join(", ")}.` : `${p.name} is built with ${p.stack.join(", ")}.`,
      p.slug,
      lang === "nl" ? "techniek stack taal gebouwd" : "technology stack language built",
    );
  }
  for (const f of facts) {
    const value = f.value ? f.value[lang] : lang === "nl" ? "staat nog niet op deze site" : "is not on this site yet";
    add("fact", `${f.label[lang]}: ${value}.`, undefined, `${f.id} ${FACT_WORDS[f.id] ?? ""}`);
  }
  for (const i of interests) add("fact", `${i.title[lang]}: ${i.body[lang]}`, i.evidence, "interesse hobby interest");
  add(
    "fact",
    lang === "nl" ? `Pim staat op GitHub als ${person.github.handle}.` : `Pim is on GitHub as ${person.github.handle}.`,
    undefined,
    "contact github bereik reach",
  );
  return out;
}

const corpusCache: Partial<Record<Locale, Sentence[]>> = {};
function corpus(lang: Locale): Sentence[] {
  return (corpusCache[lang] ??= buildCorpus(lang));
}

export interface LocalAnswer {
  /** Real sentences from the site, best first. Empty when nothing matched. */
  sentences: string[];
  links: { label: string; href: string }[];
  matched: boolean;
  /** The full answer as plain text. */
  text: string;
}

const NO_MATCH = {
  nl: "Daar staat niets over op deze site. Vraag bijvoorbeeld naar een project (TeamSync, Belhulp, CapCraft), naar de techniek die Pim gebruikt of naar wat hij met AI doet.",
  en: "This site says nothing about that. Ask for example about a project (TeamSync, Belhulp, CapCraft), the technology Pim uses or what he does with AI.",
};

/** Answers a question from the site's own sentences. Deterministic. */
export function localAnswer(question: string, lang: Locale, max = 3): LocalAnswer {
  const sentences = corpus(lang);
  const q = tokenize(question.slice(0, 400));
  const qSet = new Set(q);
  const folded = fold(question);

  // Projects named in the question (by name or slug), in either language.
  const named = new Set(
    projects
      .filter((p) => {
        const name = fold(p.name);
        const compact = name.replace(/[^a-z0-9]/g, "");
        return folded.includes(name) || folded.replace(/[^a-z0-9]/g, "").includes(compact) || folded.includes(p.slug);
      })
      .map((p) => p.slug),
  );

  // Inverse document frequency, so rare words weigh more than common ones.
  const df = new Map<string, number>();
  for (const s of sentences) for (const tok of s.tokens) if (qSet.has(tok)) df.set(tok, (df.get(tok) ?? 0) + 1);
  const n = sentences.length;
  const avgLength = sentences.reduce((sum, s) => sum + s.tokens.size, 0) / Math.max(1, n);

  const scored = sentences
    .map((s, index) => {
      let score = 0;
      for (const tok of qSet) if (s.tokens.has(tok)) score += Math.log(1 + n / (df.get(tok) ?? 1));
      // Length normalisation (as in BM25): a short fact that matches beats a long paragraph that merely mentions the word.
      score /= 0.5 + (0.5 * s.tokens.size) / avgLength;
      if (s.slug && named.has(s.slug)) score += ROLE_BOOST[s.role] + (score > 0 ? 2 : 0);
      return { s, index, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const best: { s: Sentence; index: number }[] = [];
  const seen = new Set<string>();
  for (const r of scored) {
    if (seen.has(r.s.text)) continue;
    seen.add(r.s.text);
    best.push(r);
    if (best.length >= max) break;
  }
  // Read in the order the site tells it: overview before detail.
  const picked: Sentence[] = best.sort((a, b) => a.index - b.index).map((r) => r.s);

  // "Wie is Pim?" holds only stopwords: answer with the filled-in facts about him.
  if (!picked.length && /\bpim\b/.test(folded)) {
    const known = new Set(facts.filter((f) => f.value).map((f) => `${f.label[lang]}: ${f.value?.[lang]}.`));
    picked.push(...sentences.filter((s) => known.has(s.text)).slice(0, max));
  }

  if (!picked.length) return { sentences: [], links: [], matched: false, text: NO_MATCH[lang] };

  const slugs = [...new Set(picked.map((s) => s.slug).filter((s): s is string => Boolean(s)))];
  const links = slugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is (typeof projects)[number] => Boolean(p))
    .map((p) => ({ label: p.name, href: `/${lang}/werk/${p.slug}` }));

  const texts = picked.map((s) => s.text);
  return { sentences: texts, links, matched: true, text: texts.join(" ") };
}
