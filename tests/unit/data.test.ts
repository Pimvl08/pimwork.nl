import { describe, expect, it } from "vitest";
import snapshot from "@/content/generated/stats.json";
import { projects } from "@/content/projects";
import {
  codeFiles,
  codeLines,
  dotRadius,
  familySlices,
  familyTotals,
  formatInt,
  isoWeekKey,
  maxWeekCommits,
  mondayOf,
  monthTicks,
  niceMax,
  normaliseTech,
  parseStats,
  segmentRuns,
  sharedTech,
  testRows,
  timelineRows,
  weekPosition,
  weeksBetween,
  type ProjectStats,
} from "@/components/data/stats";

const base: ProjectStats = {
  slug: "x",
  languages: {},
  docsLines: 0,
  tests: 0,
  dependencies: null,
  commitsByWeek: {},
  firstDate: null,
  lastDate: null,
  dateSource: "files",
};

describe("ISO weeks", () => {
  it("matches ISO 8601 week numbers, including year edges", () => {
    expect(isoWeekKey("2026-03-22")).toBe("2026-W12");
    expect(isoWeekKey("2026-09-07")).toBe("2026-W37");
    expect(isoWeekKey("2026-01-01")).toBe("2026-W01");
    expect(isoWeekKey("2027-01-01")).toBe("2026-W53");
    expect(isoWeekKey("2024-12-30")).toBe("2025-W01");
  });

  it("finds the Monday of a week", () => {
    expect(mondayOf("2026-03-01")).toBe("2026-02-23");
    expect(mondayOf("2026-02-23")).toBe("2026-02-23");
  });

  it("lists every week that touches March to October 2026", () => {
    const weeks = weeksBetween("2026-03-01", "2026-10-31");
    expect(weeks[0].key).toBe("2026-W09");
    expect(weeks.at(-1)?.key).toBe("2026-W44");
    expect(weeks).toHaveLength(36);
    expect(weeks.every((w, i) => w.index === i)).toBe(true);
  });

  it("places dates and month starts on the week axis", () => {
    const weeks = weeksBetween("2026-03-01", "2026-10-31");
    expect(weekPosition("2026-02-23", weeks)).toBe(0);
    expect(weekPosition("2026-03-02", weeks)).toBe(1);
    const ticks = monthTicks(weeks);
    expect(ticks[0]).toMatchObject({ month: 2, year: 2026 });
    expect(ticks[0].pos).toBeCloseTo(6 / 7, 5);
    expect(ticks.map((t) => t.month)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe("lines of code", () => {
  const p = {
    languages: {
      ts: { files: 2, lines: 100 },
      tsx: { files: 1, lines: 50 },
      css: { files: 1, lines: 10 },
      html: { files: 1, lines: 5 },
      sh: { files: 1, lines: 0 },
    },
  };

  it("groups languages into families in fixed legend order", () => {
    const slices = familySlices(p);
    expect(slices.map((s) => s.family)).toEqual(["typescript", "web"]);
    expect(slices[0]).toMatchObject({ lines: 150, files: 3, fill: "solid" });
    expect(slices[1].parts.map((x) => x.lang)).toEqual(["css", "html"]);
  });

  it("totals lines and files", () => {
    expect(codeLines(p)).toBe(165);
    expect(codeFiles(p)).toBe(6);
    expect(codeLines({ languages: {} })).toBe(0);
  });

  it("sums families across projects and leaves absent ones out", () => {
    const totals = familyTotals([p, { languages: { py: { files: 1, lines: 7 } } }]);
    expect(totals.map((t) => [t.family, t.lines])).toEqual([
      ["typescript", 150],
      ["python", 7],
      ["web", 15],
    ]);
  });

  it("rounds the scale up to clean steps", () => {
    expect(niceMax(21762)).toBe(25000);
    expect(niceMax(5000)).toBe(5000);
    expect(niceMax(0)).toBe(5000);
    expect(niceMax(168, 50)).toBe(200);
  });

  it("splits a bar into runs with a constant surface gap", () => {
    const runs = segmentRuns([3, 1], 0, 100, 2);
    expect(runs[0]).toEqual({ from: 0, to: 74 });
    expect(runs[1]).toEqual({ from: 76, to: 100 });
    expect(segmentRuns([], 0, 100, 2)).toEqual([]);
    expect(segmentRuns([0, 0], 0, 100, 2)).toEqual([]);
    // A tiny slice keeps a hairline instead of vanishing.
    const tiny = segmentRuns([1000, 1], 0, 100, 2);
    expect(tiny[1].to - tiny[1].from).toBeGreaterThan(0);
  });
});

describe("timeline rows", () => {
  const weeks = weeksBetween("2026-03-01", "2026-10-31");
  const rows = timelineRows(
    [
      { ...base, slug: "late-git", dateSource: "git", firstDate: "2026-09-07", lastDate: "2026-09-12", commitsByWeek: { "2026-W37": 45 } },
      {
        ...base,
        slug: "early-git",
        dateSource: "git",
        firstDate: "2026-01-05",
        lastDate: "2026-03-22",
        commitsByWeek: { "2026-W02": 3, "2026-W12": 1 },
      },
      { ...base, slug: "files", firstDate: "2026-09-23", lastDate: "2026-09-25" },
      { ...base, slug: "undated" },
    ],
    weeks,
  );

  it("sorts earliest first and keeps undated projects last", () => {
    expect(rows.map((r) => r.slug)).toEqual(["early-git", "late-git", "files", "undated"]);
  });

  it("keeps commits outside the range visible as a count", () => {
    const early = rows[0];
    expect(early.commits).toEqual([{ key: "2026-W12", index: 3, n: 1 }]);
    expect(early.commitsOutside).toBe(3);
    expect(early.totalCommits).toBe(4);
    expect(maxWeekCommits(rows)).toBe(45);
  });

  it("draws file-dated projects as a band, never as commits", () => {
    const files = rows[2];
    expect(files.commits).toEqual([]);
    expect(files.band).not.toBeNull();
    expect(files.band!.to).toBeGreaterThan(files.band!.from);
    expect(rows[3].band).toBeNull();
  });

  it("sizes dots by area", () => {
    expect(dotRadius(0, 45, 3, 15)).toBe(0);
    expect(dotRadius(45, 45, 3, 15)).toBe(15);
    expect(dotRadius(45 / 4, 45, 3, 15)).toBe(9);
  });
});

describe("tests and stack", () => {
  it("splits test counts by kind and keeps zero rows", () => {
    const rows = testRows([
      { ...base, slug: "a", tests: 10, testsByKind: { js: 6, rust: 4, python: 0, pgtap: 0 } },
      { ...base, slug: "b", tests: 0 },
    ]);
    expect(rows[0].parts.map((p) => [p.kind, p.n])).toEqual([
      ["js", 6],
      ["rust", 4],
    ]);
    expect(rows[1]).toEqual({ slug: "b", total: 0, parts: [] });
  });

  it("normalises stack names", () => {
    expect(normaliseTech("React 19")).toBe("React");
    expect(normaliseTech("Vite 8")).toBe("Vite");
    expect(normaliseTech("Tailwind CSS 4")).toBe("Tailwind CSS");
    expect(normaliseTech("TypeScript strict")).toBe("TypeScript");
    expect(normaliseTech("Supabase Auth")).toBe("Supabase");
    expect(normaliseTech("Node.js 24 (ESM)")).toBe("Node.js");
    expect(normaliseTech("Stripe (testmodus)")).toBe("Stripe");
    expect(normaliseTech("Three.js")).toBe("Three.js");
  });

  it("keeps only shared technologies, most shared first, in project order", () => {
    const rows = sharedTech([
      { slug: "a", stack: ["React 19", "Vite 8", "Rust"] },
      { slug: "b", stack: ["React 18", "Python"] },
      { slug: "c", stack: ["Vite", "React"] },
    ]);
    expect(rows).toEqual([
      { tech: "React", slugs: ["a", "b", "c"] },
      { tech: "Vite", slugs: ["a", "c"] },
    ]);
  });
});

describe("snapshot", () => {
  const stats = parseStats(snapshot);

  it("parses defensively", () => {
    const bad = parseStats({ projects: [{ slug: "z", tests: -3, dateSource: "nope", firstDate: "yesterday", commitsByWeek: { x: 2, "2026-W10": "3" } }] });
    expect(bad.projects[0]).toMatchObject({ tests: 0, dateSource: "files", firstDate: null, commitsByWeek: {} });
    expect(parseStats(null).projects).toEqual([]);
  });

  it("covers every project on the site with a known slug", () => {
    const slugs = projects.map((p) => p.slug);
    for (const p of stats.projects) expect(slugs).toContain(p.slug);
  });

  it("totals agree with the per-project numbers", () => {
    const lines = stats.projects.reduce((s, p) => s + codeLines(p), 0);
    const tests = stats.projects.reduce((s, p) => s + p.tests, 0);
    const commits = stats.projects.reduce((s, p) => s + Object.values(p.commitsByWeek).reduce((a, b) => a + b, 0), 0);
    expect(stats.totals.lines).toBe(lines);
    expect(stats.totals.tests).toBe(tests);
    expect(stats.totals.commits).toBe(commits);
  });

  it("holds no paths, names or emails", () => {
    const raw = JSON.stringify(snapshot);
    expect(raw).not.toMatch(/\/Users\/|\\\\|@[a-z0-9-]+\.[a-z]{2,}|\.env|node_modules/i);
  });

  it("formats numbers per language", () => {
    expect(formatInt(21762, "nl")).toBe("21.762");
    expect(formatInt(21762, "en")).toBe("21,762");
  });
});
