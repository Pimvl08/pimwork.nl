import { describe, expect, it } from "vitest";
import { project, shellSilhouette, STAGE_ASPECT, viewSetup } from "@/components/hero/camera";
import { heroCopy, introPhrases, introSentence } from "@/components/hero/copy";
import {
  creaseLineColor,
  needsRebuild,
  nextIndex,
  pointerToPose,
  springSettled,
  springStep,
} from "@/components/hero/logic";
import { getProject } from "@/content/projects";

describe("critically damped spring", () => {
  it("converges on the target without overshoot", () => {
    let s = { x: 0, v: 0 };
    let max = 0;
    for (let i = 0; i < 240; i++) {
      s = springStep(s, 1, 6, 1 / 60);
      max = Math.max(max, s.x);
    }
    expect(max).toBeLessThanOrEqual(1 + 1e-9);
    expect(springSettled(s, 1)).toBe(true);
  });

  it("is stable for large time steps", () => {
    const s = springStep({ x: 0, v: 0 }, 1, 6, 10);
    expect(Number.isFinite(s.x)).toBe(true);
    expect(Math.abs(s.x - 1)).toBeLessThan(1e-6);
  });

  it("does nothing for a zero step", () => {
    expect(springStep({ x: 0.3, v: 2 }, 1, 6, 0)).toEqual({ x: 0.3, v: 2 });
  });

  it("matches the result of many small steps", () => {
    const one = springStep({ x: 0, v: 0.5 }, 1, 5, 0.5);
    let many = { x: 0, v: 0.5 };
    for (let i = 0; i < 50; i++) many = springStep(many, 1, 5, 0.01);
    expect(many.x).toBeCloseTo(one.x, 9);
    expect(many.v).toBeCloseTo(one.v, 9);
  });
});

describe("phrase cycling", () => {
  it("wraps forwards and backwards", () => {
    expect(nextIndex(0, 5)).toBe(1);
    expect(nextIndex(4, 5)).toBe(0);
    expect(nextIndex(0, 5, -1)).toBe(4);
    expect(nextIndex(3, 0)).toBe(0);
  });

  it("only names real projects", () => {
    for (const phrase of introPhrases) expect(getProject(phrase.slug)).toBeDefined();
  });

  it("builds the spoken sentence in the first person", () => {
    expect(introSentence(introPhrases[0], "nl")).toBe(
      "Ik bouw software die werk uit handen neemt, zoals een trainingsapp die ik elke week gebruik.",
    );
    expect(introSentence(introPhrases[0], "en")).toBe(
      "I build software that takes work off your hands, like a training app I use every week.",
    );
  });

  it("starts every example with an article, so each sentence stays grammatical", () => {
    for (const phrase of introPhrases) {
      expect(phrase.label.nl).toMatch(/^een /);
      expect(phrase.label.en).toMatch(/^an? /);
      expect(phrase.label.nl).not.toMatch(/[.,]$/);
      expect(phrase.label.en).not.toMatch(/[.,]$/);
    }
  });
});

describe("pointer to pose", () => {
  it("maps x to the fold range and y to the twist range", () => {
    expect(pointerToPose(0, 0)).toEqual({ fold: 0.25, twist: -0.35 });
    expect(pointerToPose(1, 1)).toEqual({ fold: 1, twist: 0.35 });
    const mid = pointerToPose(0.5, 0.5);
    expect(mid.fold).toBeCloseTo(0.625);
    expect(mid.twist).toBeCloseTo(0);
  });

  it("clamps outside the cover", () => {
    expect(pointerToPose(-2, 3)).toEqual({ fold: 0.25, twist: 0.35 });
  });

  it("rebuilds only for meaningful changes", () => {
    expect(needsRebuild(null, { fold: 0.5, twist: 0 })).toBe(true);
    expect(needsRebuild({ fold: 0.5, twist: 0 }, { fold: 0.5015, twist: 0.001 })).toBe(false);
    expect(needsRebuild({ fold: 0.5, twist: 0 }, { fold: 0.503, twist: 0 })).toBe(true);
  });
});

describe("hero copy", () => {
  it("never uses an em or en dash, and never mentions tools or the old intro", () => {
    const text = JSON.stringify([heroCopy, introPhrases]);
    expect(text).not.toMatch(/[\u2013\u2014]/);
    expect(text).not.toMatch(/Claude|digitale wereld|digital world/i);
  });
});

describe("shell rendering helpers", () => {
  it("picks a crease line colour that contrasts with the sheet", () => {
    const night = creaseLineColor([0.86, 0.83, 0.78], [0.925, 0.902, 0.855], [0.071, 0.071, 0.067]);
    expect(night[0]).toBeLessThan(0.4);
    const day = creaseLineColor([0.965, 0.955, 0.93], [0.11, 0.11, 0.11], [0.949, 0.937, 0.902]);
    expect(day).toEqual([0.11, 0.11, 0.11]);
  });

  it("projects the shell inside the stage", () => {
    const { matrix } = viewSetup(STAGE_ASPECT);
    for (const [x, y, z] of [[0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0.3, 0.3, 0.9]]) {
      const [nx, ny] = project(matrix, x, y, z);
      expect(Math.abs(nx)).toBeLessThan(1);
      expect(Math.abs(ny)).toBeLessThan(1);
    }
  });

  it("draws a closed silhouette with a crease", () => {
    const s = shellSilhouette();
    expect(s.viewBox).toBe("0 0 1000 900");
    expect(s.rim.startsWith("M")).toBe(true);
    expect(s.rim.endsWith("Z")).toBe(true);
    expect(s.crease.length).toBeGreaterThan(10);
  });
});
