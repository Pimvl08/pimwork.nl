import { describe, expect, it, vi } from "vitest";
import { aboutCopy } from "@/components/about/copy";
import { figureNumeral, visibleFacts } from "@/components/about/logic";
import { contactCopy } from "@/components/contact/copy";
import { labCopy } from "@/components/lab/copy";
import { about, facts, person, type Fact } from "@/content/person";

const DASHES = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);

describe("visibleFacts", () => {
  const list: Fact[] = [
    { id: "a", label: { nl: "Bouwt", en: "Builds" }, value: { nl: "Apps", en: "Apps" } },
    { id: "b", label: { nl: "Opleiding", en: "Education" }, value: null },
    { id: "c", label: { nl: "Leeg", en: "Empty" }, value: { nl: "  ", en: "" } },
    { id: "d", label: { nl: "Voor", en: "For" }, value: { nl: " Mac ", en: "Mac" } },
  ];

  it("keeps only facts with a value, in order, trimmed", () => {
    expect(visibleFacts(list, "nl")).toEqual([
      { id: "a", label: "Bouwt", value: "Apps" },
      { id: "d", label: "Voor", value: "Mac" },
    ]);
    expect(visibleFacts(list, "en").map((f) => f.id)).toEqual(["a", "d"]);
  });

  it("never shows a fact from person.ts that is still null", () => {
    const hidden = facts.filter((f) => f.value === null).map((f) => f.id);
    const shown = visibleFacts(facts, "nl").map((f) => f.id);
    for (const id of hidden) expect(shown).not.toContain(id);
  });
});

describe("figureNumeral", () => {
  it("numbers the principles in roman figures", () => {
    expect(about.howIWork.principles.map((_, i) => figureNumeral(i))).toEqual(["I", "II", "III", "IV"]);
    expect(figureNumeral(12)).toBe("13");
  });
});

describe("copy", () => {
  const all = JSON.stringify({ aboutCopy, contactCopy, labCopy, about });

  it("never uses an em dash or en dash", () => {
    expect(all).not.toMatch(DASHES);
  });

  it("never names the tools behind the work (Pim, 2026-10-06)", () => {
    expect(JSON.stringify({ aboutCopy, contactCopy, labCopy, about })).not.toMatch(/claude|AI-tool|AI tool/i);
  });

  it("speaks in the first person on the contact page", () => {
    expect(JSON.stringify(contactCopy)).not.toMatch(/\bPim\b/);
    expect(contactCopy.offline.heading.nl).toMatch(/nog geen berichten/);
  });
});

describe("server render of the about page", () => {
  it("shows the intro, the known facts and how I work, without empty slots or dates", async () => {
    vi.doMock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }), usePathname: () => "/nl/over" }));
    const { createElement } = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { AboutPage } = await import("@/components/about/AboutPage");
    for (const lang of ["nl", "en"] as const) {
      const html = renderToString(createElement(AboutPage, { lang }));
      expect(html).toContain(`<h1`);
      expect(html).toContain(aboutCopy.title[lang]);
      expect(html).toContain(about.howIWork.title[lang]);
      for (const p of about.howIWork.principles) expect(html).toContain(p.title[lang]);
      for (const fact of visibleFacts(facts, lang)) expect(html).toContain(fact.value);
      for (const fact of facts.filter((f) => f.value === null)) expect(html).not.toContain(`>${fact.label[lang]}<`);
      expect(html).toContain(`href="/${lang}/werk"`);
      expect(html).toContain(`href="/${lang}/contact"`);
      expect(html).not.toMatch(/Nog in te vullen|To be filled in/i);
      expect(html).not.toMatch(/\b20\d\d\b/);
      expect(html).not.toMatch(DASHES);
      if (!person.portrait) expect(html).not.toContain("<img");
    }
  });
});
