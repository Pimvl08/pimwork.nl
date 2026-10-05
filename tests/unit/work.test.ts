import { describe, expect, it } from "vitest";
import { diagramCopy } from "@/components/work/copy";
import { clampPreview, featuredFirst, neighbours, numeralFor, polar, toRoman } from "@/components/work/lib";
import { featuredProjects, projects } from "@/content/projects";

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
    expect(numeralFor(projects[projects.length - 1].slug, projects)).toBe(toRoman(projects.length));
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

describe("featuredFirst", () => {
  it("puts featured items first and keeps each group's order", () => {
    const list = [
      { slug: "a", featured: false },
      { slug: "b", featured: true },
      { slug: "c", featured: false },
      { slug: "d", featured: true },
    ];
    expect(featuredFirst(list).map((item) => item.slug)).toEqual(["b", "d", "a", "c"]);
  });
  it("starts the real work index with the featured projects", () => {
    const order = featuredFirst(projects);
    expect(order).toHaveLength(projects.length);
    expect(order.slice(0, featuredProjects.length)).toEqual(featuredProjects);
  });
});

describe("work content", () => {
  const banned = /[\u2013\u2014]/;
  it("only draws diagrams for real projects", () => {
    const slugs = new Set(projects.map((project) => project.slug));
    for (const slug of Object.keys(diagramCopy)) expect(slugs.has(slug)).toBe(true);
  });
  it("keeps dates, money and dashes out of the diagrams", () => {
    const text = JSON.stringify(diagramCopy);
    expect(banned.test(text)).toBe(false);
    expect(text).not.toMatch(/[$\u20AC]|\b20\d\d\b|budget/i);
    expect(text).not.toMatch(/capcraft|paletteforge/i);
  });
});

describe("small formatters", () => {
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
