import { describe, expect, it } from "vitest";
import { clampPreview, decimal, formatPeriod, neighbours, numeralFor, periodYear, polar, toRoman } from "@/components/work/lib";
import { projects } from "@/content/projects";

describe("toRoman", () => {
  it("writes the eight plate numerals", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8].map(toRoman)).toEqual(["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]);
  });
  it("handles subtractive pairs and larger values", () => {
    expect(toRoman(9)).toBe("IX");
    expect(toRoman(14)).toBe("XIV");
    expect(toRoman(40)).toBe("XL");
    expect(toRoman(1994)).toBe("MCMXCIV");
    expect(toRoman(2026)).toBe("MMXXVI");
  });
  it("rejects values a plate can never have", () => {
    expect(() => toRoman(0)).toThrow(RangeError);
    expect(() => toRoman(-3)).toThrow(RangeError);
    expect(() => toRoman(2.5)).toThrow(RangeError);
    expect(() => toRoman(4000)).toThrow(RangeError);
  });
});

describe("numeralFor", () => {
  it("follows the display order of projects.ts", () => {
    expect(numeralFor(projects[0].slug, projects)).toBe("I");
    expect(numeralFor(projects[7].slug, projects)).toBe("VIII");
    expect(numeralFor("does-not-exist", projects)).toBe("");
  });
});

describe("neighbours", () => {
  const list = [{ slug: "a" }, { slug: "b" }, { slug: "c" }];
  it("returns the plates on either side", () => {
    expect(neighbours("b", list)).toEqual({ prev: { slug: "a" }, next: { slug: "c" } });
  });
  it("wraps around at both ends", () => {
    expect(neighbours("a", list)?.prev.slug).toBe("c");
    expect(neighbours("c", list)?.next.slug).toBe("a");
  });
  it("returns null for unknown slugs or a single item", () => {
    expect(neighbours("x", list)).toBeNull();
    expect(neighbours("a", [{ slug: "a" }])).toBeNull();
  });
  it("covers every real project", () => {
    for (const project of projects) {
      const pair = neighbours(project.slug, projects);
      expect(pair).not.toBeNull();
      expect(pair?.prev.slug).not.toBe(project.slug);
      expect(pair?.next.slug).not.toBe(project.slug);
    }
  });
});

describe("formatPeriod", () => {
  it("writes a single day", () => {
    expect(formatPeriod({ from: "2026-08-22", to: "2026-08-22" }, "nl")).toBe("22 aug 2026");
    expect(formatPeriod({ from: "2026-08-22", to: "2026-08-22" }, "en")).toBe("22 Aug 2026");
  });
  it("writes a range inside one month", () => {
    expect(formatPeriod({ from: "2026-09-07", to: "2026-09-12" }, "nl")).toBe("7 tot 12 sep 2026");
    expect(formatPeriod({ from: "2026-09-07", to: "2026-09-12" }, "en")).toBe("7 to 12 Sep 2026");
  });
  it("writes a range across months and years", () => {
    expect(formatPeriod({ from: "2026-03-22", to: "2026-07-28" }, "nl")).toBe("22 mrt tot 28 jul 2026");
    expect(formatPeriod({ from: "2025-11-02", to: "2026-01-15" }, "en")).toBe("Nov 2025 to Jan 2026");
  });
  it("throws on malformed dates", () => {
    expect(() => formatPeriod({ from: "2026-9-7", to: "2026-09-12" }, "nl")).toThrow(RangeError);
  });
  it("formats every real project period", () => {
    for (const project of projects) {
      expect(formatPeriod(project.period, "nl")).toMatch(/\d{4}$/);
    }
  });
});

describe("small formatters", () => {
  it("periodYear collapses equal years", () => {
    expect(periodYear({ from: "2026-03-20", to: "2026-03-22" }, "nl")).toBe("2026");
    expect(periodYear({ from: "2025-03-20", to: "2026-03-22" }, "en")).toBe("2025 to 2026");
  });
  it("decimal uses a comma in Dutch", () => {
    expect(decimal(2.5, "nl")).toBe("2,5");
    expect(decimal(2.5, "en")).toBe("2.5");
  });
  it("polar measures clockwise from twelve o'clock", () => {
    expect(polar(0, 0, 10, 0)).toEqual([0, -10]);
    expect(polar(0, 0, 10, 90)).toEqual([10, 0]);
    expect(polar(0, 0, 10, 180)).toEqual([0, 10]);
  });
  it("clampPreview keeps the figure inside the list", () => {
    expect(clampPreview(-40, 10, 100, 80, 500, 0, 400)).toEqual([0, 10]);
    expect(clampPreview(480, 390, 100, 80, 500, 0, 400)).toEqual([400, 320]);
    expect(clampPreview(200, -50, 100, 80, 500, -20, 400)).toEqual([200, -20]);
  });
});
