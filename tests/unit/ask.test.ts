import { afterEach, describe, expect, it, vi } from "vitest";
import { facts } from "@/content/person";
import { projects } from "@/content/projects";
import { localAnswer, stem, tokenize } from "@/lib/ai/local";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { parseAsk } from "@/lib/ai/schema";

describe("ask validation", () => {
  it("accepts a trimmed question and a supported language", () => {
    expect(parseAsk({ question: "  Wat is TeamSync?  ", lang: "nl" })).toEqual({ ok: true, data: { question: "Wat is TeamSync?", lang: "nl" } });
  });

  it("rejects short, long, missing and wrong fields with field errors", () => {
    const short = parseAsk({ question: " a ", lang: "nl" });
    expect(short.ok).toBe(false);
    if (!short.ok) expect(short.fields.question).toBeDefined();
    const long = parseAsk({ question: "x".repeat(401), lang: "en" });
    expect(long.ok).toBe(false);
    const lang = parseAsk({ question: "Hello there", lang: "de" });
    expect(lang.ok).toBe(false);
    if (!lang.ok) expect(lang.fields.lang).toBeDefined();
    expect(parseAsk(null).ok).toBe(false);
  });
});

describe("system prompt", () => {
  it("is deterministic", () => {
    expect(buildSystemPrompt()).toBe(buildSystemPrompt());
  });

  it("contains every project name and the rules", () => {
    const prompt = buildSystemPrompt();
    for (const p of projects) expect(prompt).toContain(p.name);
    expect(prompt).toContain("120 words");
    expect(prompt).toMatch(/plain text/i);
    for (const f of facts.filter((x) => !x.value)) expect(prompt).toContain(`${f.label.en}: unknown`);
  });

  it("never contains an em or en dash, and no date of today", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).not.toMatch(/[\u2013\u2014]/);
    expect(prompt).not.toContain(new Date().toISOString().slice(0, 10));
  });
});

describe("local engine", () => {
  it("tokenises with simple Dutch and English stemming", () => {
    expect(stem("projecten")).toBe("project");
    expect(stem("projects")).toBe("project");
    expect(tokenize("Wat is de Één app?")).toEqual(["app"]);
  });

  it("answers from real sentences about a named project, with a link", () => {
    const answer = localAnswer("Wat is TeamSync?", "nl");
    expect(answer.matched).toBe(true);
    expect(answer.text).toContain("TeamSync");
    expect(answer.links).toContainEqual({ label: "TeamSync", href: "/nl/werk/teamsync" });
    const corpus = projects.flatMap((p) => [p.summary.nl, p.short.nl, p.problem.nl, ...p.highlights.nl, ...p.hardProblems.nl]).join(" ");
    for (const s of answer.sentences) {
      const core = s.replace(/^TeamSync: /, "").replace(/\.$/, "");
      expect(corpus.includes(core) || s.includes("TeamSync")).toBe(true);
    }
  });

  it("finds projects by technology in English", () => {
    const answer = localAnswer("Which project uses Rust?", "en");
    expect(answer.matched).toBe(true);
    expect(answer.links.map((l) => l.label)).toContain("TeamSync");
  });

  it("says plainly when the site does not know", () => {
    const answer = localAnswer("zxqv wobble", "nl");
    expect(answer.matched).toBe(false);
    expect(answer.text).toContain("niets");
  });

  it("is honest about open facts", () => {
    const answer = localAnswer("Where is Pim based?", "en");
    expect(answer.text.toLowerCase()).toContain("not on this site");
  });

  it("is deterministic", () => {
    expect(localAnswer("Hoe werkt Belhulp?", "nl")).toEqual(localAnswer("Hoe werkt Belhulp?", "nl"));
  });
});

describe("POST /api/ask", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const request = (body: unknown, headers: Record<string, string> = {}) =>
    new Request("http://localhost:3100/api/ask", {
      method: "POST",
      headers: { origin: "http://localhost:3100", host: "localhost:3100", "content-type": "application/json", "x-forwarded-for": "10.0.0.1", ...headers },
      body: JSON.stringify(body),
    });

  it("rejects other origins, bad bodies and other methods", async () => {
    const route = await import("@/app/api/ask/route");
    expect((await route.POST(request({ question: "Hoi daar", lang: "nl" }, { origin: "https://evil.example" }))).status).toBe(403);
    const bad = await route.POST(request({ question: "x", lang: "nl" }, { "x-forwarded-for": "10.0.0.2" }));
    expect(bad.status).toBe(400);
    expect(((await bad.json()) as { fields: Record<string, string[]> }).fields.question).toBeDefined();
    expect(route.GET().status).toBe(405);
  });

  it("answers 503 not_configured without a key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const route = await import("@/app/api/ask/route");
    const res = await route.POST(request({ question: "Wat is TeamSync?", lang: "nl" }, { "x-forwarded-for": "10.0.0.3" }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "not_configured" });
  });

  it("rate limits after eight questions", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const route = await import("@/app/api/ask/route");
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++) statuses.push((await route.POST(request({ question: "Wat is TeamSync?", lang: "nl" }, { "x-forwarded-for": "10.0.0.4" }))).status);
    expect(statuses.slice(0, 8).every((s) => s === 503)).toBe(true);
    expect(statuses[8]).toBe(429);
  });
});
