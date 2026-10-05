import { describe, expect, it, vi } from "vitest";
import {
  arcPath,
  axisT,
  countWord,
  formatMeasured,
  formatPeriod,
  isoToDay,
  monthAxis,
  packLanes,
  parseMeasured,
  periodDays,
  polar,
  spanOf,
  tToDeg,
} from "@/components/about/logic";
import { aboutCopy, measureSelection } from "@/components/about/copy";
import { getProject, projects } from "@/content/projects";
import { interests } from "@/content/person";

const months = aboutCopy.timeline.months;

describe("timeline geometry", () => {
  const axis = monthAxis("2026-03", "2026-10");

  it("spans March 1 through October 31", () => {
    expect(axis.end - axis.start).toBe(245);
    expect(axisT(axis, isoToDay("2026-03-01"))).toBe(0);
    expect(axisT(axis, isoToDay("2026-11-01"))).toBe(1);
  });

  it("maps the axis onto the upper semicircle", () => {
    expect(tToDeg(0)).toBe(180);
    expect(tToDeg(1)).toBe(0);
    expect(polar(0, 0, 10, 90)).toEqual({ x: 0, y: -10 });
    expect(arcPath(0, 0, 10, 180, 0)).toBe("M -10 0 A 10 10 0 0 1 10 0");
  });

  it("keeps every project inside the axis", () => {
    for (const p of projects) {
      const span = spanOf(p.slug, p.period);
      expect(span.from).toBeGreaterThanOrEqual(axis.start);
      expect(span.to).toBeLessThanOrEqual(axis.end);
    }
  });

  it("packs overlapping or close spans into separate lanes", () => {
    const lanes = packLanes(
      [
        { slug: "a", from: 0, to: 3 },
        { slug: "b", from: 2, to: 40 },
        { slug: "c", from: 20, to: 21 },
        { slug: "d", from: 24, to: 25 },
      ],
      8,
    );
    expect(lanes).toEqual({ a: 0, b: 1, c: 0, d: 2 });
  });

  it("separates CapCraft and Solana Forensics, one day apart", () => {
    const lanes = packLanes(projects.map((p) => spanOf(p.slug, p.period)), 8);
    expect(lanes.capcraft).not.toBe(lanes["solana-forensics"]);
    expect(lanes.belhulp).not.toBe(lanes["kdp-kleurboek"]);
  });
});

describe("periods", () => {
  it("formats single days, same-month and cross-month ranges", () => {
    expect(formatPeriod({ from: "2026-08-22", to: "2026-08-22" }, months.nl, "tot")).toBe("22 augustus 2026");
    expect(formatPeriod({ from: "2026-09-07", to: "2026-09-12" }, months.nl, "tot")).toBe("7 tot 12 september 2026");
    expect(formatPeriod({ from: "2026-03-22", to: "2026-07-28" }, months.en, "to")).toBe("22 March to 28 July 2026");
  });

  it("counts inclusive days", () => {
    expect(periodDays({ from: "2026-09-07", to: "2026-09-12" })).toBe(6);
    expect(periodDays({ from: "2026-08-22", to: "2026-08-22" })).toBe(1);
  });

  it("writes small counts as words", () => {
    expect(countWord(8, "nl")).toBe("acht");
    expect(countWord(8, "en")).toBe("eight");
    expect(countWord(40, "nl")).toBe("40");
  });
});

describe("measured values", () => {
  it("parses prefixes, decimals and units per locale", () => {
    expect(parseMeasured("$3,85", "nl")).toMatchObject({ prefix: "$", value: 3.85, decimals: 2, suffix: "" });
    expect(parseMeasured("9.6%", "en")).toMatchObject({ value: 9.6, decimals: 1, suffix: "%" });
    expect(parseMeasured("6 dagen", "nl")).toMatchObject({ value: 6, decimals: 0, suffix: " dagen" });
    expect(parseMeasured("3.097", "nl")).toBeNull();
    expect(parseMeasured("geen", "nl")).toBeNull();
  });

  it("formats counting values back in the same shape", () => {
    const m = parseMeasured("$3,85", "nl")!;
    expect(formatMeasured(m, 3.85, "nl")).toBe("$3,85");
    expect(formatMeasured(m, 1.2, "nl")).toBe("$1,20");
    const e = parseMeasured("9.6%", "en")!;
    expect(formatMeasured(e, 9.6, "en")).toBe("9.6%");
  });

  it("finds every selected metric in projects.ts and can count it", () => {
    for (const pick of measureSelection) {
      const metric = getProject(pick.slug)?.metrics.find((m) => m.label.en === pick.metric);
      expect(metric, `${pick.slug} / ${pick.metric}`).toBeDefined();
      for (const lang of ["nl", "en"] as const) {
        const parsed = parseMeasured(metric!.value[lang], lang);
        expect(parsed).not.toBeNull();
        expect(formatMeasured(parsed!, parsed!.value, lang)).toBe(metric!.value[lang]);
      }
    }
  });
});

describe("content links", () => {
  it("links every interest to an existing project", () => {
    expect(interests).toHaveLength(6);
    for (const interest of interests) expect(getProject(interest.evidence)).toBeDefined();
  });

  it("never uses an em dash or en dash in the copy", () => {
    const dashes = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
    expect(JSON.stringify({ aboutCopy, measureSelection })).not.toMatch(dashes);
  });
});

describe("server render", () => {
  it("ships the final measured values, the sources and every project link in the HTML", async () => {
    vi.doMock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }), usePathname: () => "/nl" }));
    const { createElement } = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { AboutPlate } = await import("@/components/plates/AboutPlate");
    for (const lang of ["nl", "en"] as const) {
      const html = renderToString(createElement(AboutPlate, { lang }));
      expect(html).toContain('id="about"');
      for (const pick of measureSelection) {
        const metric = getProject(pick.slug)?.metrics.find((m) => m.label.en === pick.metric);
        const shown = metric!.value[lang].replace(/^(\D*[\d.,]+)\s.*$/, "$1");
        expect(html).toContain(shown);
      }
      for (const project of projects) expect(html).toContain(`href="/${lang}/werk/${project.slug}"`);
      expect(html).toContain("src/content/projects.ts");
      expect(html).not.toMatch(/[\u2013\u2014]/);
    }
  });
});
