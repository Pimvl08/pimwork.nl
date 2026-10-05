import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import {
  advance,
  allSleeping,
  createBody,
  createWorld,
  endDrag,
  FIXED_DT,
  flipGravity,
  isInside,
  layoutBodies,
  makeBowl,
  moveDrag,
  radialImpulse,
  settle,
  shake,
  startDrag,
  step,
  totalEnergy,
  type World,
} from "@/components/lab/physics-engine";
import { countTechnologies, fitLabel, normaliseTech, radiusFor, scaleFor } from "@/components/lab/physics-data";

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function jar(count = 30, width = 10, height = 8): World {
  const rand = seeded(7);
  const bodies = Array.from({ length: count }, (_, i) => createBody(i, 0, 0, 0.35 + rand() * 0.4));
  const world = createWorld(width, height, bodies);
  layoutBodies(world, 3);
  return world;
}

describe("container", () => {
  it("bowl arc meets both wall feet and touches the bottom in the middle", () => {
    const { cx, cy, R } = makeBowl(10, 8);
    expect(cx).toBe(5);
    expect(cy + R).toBeCloseTo(8, 6);
    const footY = cy + Math.sqrt(R * R - 25);
    expect(footY).toBeLessThan(8);
    expect(footY).toBeGreaterThan(8 - 0.16 * 10 - 1e-6);
  });

  it("keeps every body inside while falling, shaking and flipping gravity", () => {
    const world = jar();
    const rand = seeded(11);
    for (let i = 0; i < 120 * 4; i++) {
      step(world);
      if (i === 120) shake(world, 8, rand);
      if (i === 240) flipGravity(world);
      if (i === 300) shake(world, 8, rand);
      for (const b of world.bodies) expect(isInside(world, b, 0.06)).toBe(true);
    }
  });

  it("layout places bodies inside without overlap", () => {
    const world = jar();
    for (const b of world.bodies) expect(isInside(world, b)).toBe(true);
    for (let i = 0; i < world.bodies.length; i++) {
      for (let k = i + 1; k < world.bodies.length; k++) {
        const a = world.bodies[i];
        const b = world.bodies[k];
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(a.r + b.r - 1e-6);
      }
    }
  });
});

describe("dynamics", () => {
  it("energy does not grow: it only drains while the jar settles", () => {
    const world = jar();
    const start = totalEnergy(world);
    let previousMax = start;
    for (let second = 0; second < 6; second++) {
      for (let i = 0; i < 120; i++) step(world);
      const e = totalEnergy(world);
      expect(Number.isFinite(e)).toBe(true);
      // Small slack for positional correction, never a blow up.
      expect(e).toBeLessThanOrEqual(previousMax + Math.abs(start) * 0.02);
      previousMax = Math.max(e, previousMax);
    }
    for (const b of world.bodies) expect(Math.hypot(b.vx, b.vy)).toBeLessThan(2);
  });

  it("separates two overlapping circles", () => {
    const a = createBody(1, 5, 3, 0.5);
    const b = createBody(2, 5.3, 3, 0.5);
    const world = createWorld(10, 8, [a, b]);
    world.gravity = { x: 0, y: 0 };
    for (let i = 0; i < 60; i++) step(world);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(1 - 0.01);
    // Symmetric bodies move apart symmetrically.
    expect(a.x + b.x).toBeCloseTo(10.3, 3);
  });

  it("comes to rest and falls asleep", () => {
    const world = jar(20);
    const t = settle(world, 30);
    expect(t).toBeLessThan(30);
    expect(allSleeping(world)).toBe(true);
  });

  it("uses a fixed timestep through the accumulator", () => {
    const world = jar(5);
    expect(advance(world, FIXED_DT * 2.5)).toBe(2);
    expect(world.accumulator).toBeCloseTo(FIXED_DT * 0.5, 9);
    expect(advance(world, FIXED_DT * 0.6)).toBe(1);
  });

  it("drags a body with a spring and throws it on release", () => {
    const world = jar(6);
    settle(world);
    const body = world.bodies[0];
    startDrag(world, body, body.x, body.y);
    moveDrag(world, 5, 2);
    for (let i = 0; i < 120; i++) step(world);
    expect(Math.hypot(body.x - 5, body.y - 2)).toBeLessThan(0.6);
    endDrag(world, 100, 0, 14);
    expect(world.drag).toBeNull();
    expect(body.vx).toBeCloseTo(14, 6);
  });

  it("radial impulse pushes nearby bodies away and wakes the jar", () => {
    const world = jar(10);
    settle(world);
    const target = world.bodies[0];
    const hit = radialImpulse(world, target.x - 0.2, target.y, 2, 5);
    expect(hit).toBeGreaterThan(0);
    expect(target.vx).toBeGreaterThan(0);
    expect(allSleeping(world)).toBe(false);
  });
});

describe("technologies from projects.ts", () => {
  const techs = countTechnologies(projects);

  it("normalises versions and notes", () => {
    expect(normaliseTech("React 19")).toBe("React");
    expect(normaliseTech("React 18")).toBe("React");
    expect(normaliseTech("Tailwind CSS 4")).toBe("Tailwind CSS");
    expect(normaliseTech("TypeScript strict")).toBe("TypeScript");
    expect(normaliseTech("Node.js 24 (ESM)")).toBe("Node.js");
    expect(normaliseTech("Stripe (testmodus)")).toBe("Stripe");
    expect(normaliseTech("Supabase Auth")).toBe("Supabase");
    expect(normaliseTech("Three.js")).toBe("Three.js");
  });

  it("counts every project a technology appears in, once per project", () => {
    const expected = new Map<string, number>();
    for (const p of projects) {
      for (const name of new Set(p.stack.map(normaliseTech))) expected.set(name, (expected.get(name) ?? 0) + 1);
    }
    expect(techs.length).toBe(expected.size);
    for (const t of techs) {
      expect(t.count).toBe(expected.get(t.name));
      expect(t.projects.length).toBe(t.count);
    }
    const total = projects.reduce((n, p) => n + new Set(p.stack.map(normaliseTech)).size, 0);
    expect(techs.reduce((n, t) => n + t.count, 0)).toBe(total);
  });

  it("merges versions of the same tool", () => {
    const react = techs.find((t) => t.name === "React");
    const reactUsers = projects.filter((p) => p.stack.some((s) => /^React( \d+)?$/.test(s)));
    expect(react?.count).toBe(reactUsers.length);
    expect(techs.some((t) => /\d$/.test(t.name))).toBe(false);
    expect(techs[0].count).toBeGreaterThanOrEqual(techs[techs.length - 1].count);
  });

  it("sizes discs by use and fits the jar", () => {
    expect(radiusFor(3)).toBeGreaterThan(radiusFor(1));
    const radii = techs.map((t) => radiusFor(t.count));
    const s = scaleFor(400, 300, radii, 0.36);
    const area = radii.reduce((sum, r) => sum + Math.PI * (r * s) ** 2, 0);
    expect(area / (400 * 300)).toBeCloseTo(0.36, 6);
  });

  it("splits long labels to allow larger type", () => {
    const measure = (text: string) => text.length * 0.5;
    expect(fitLabel("React", measure).lines).toEqual(["React"]);
    const long = fitLabel("vite-plugin-singlefile", measure);
    expect(long.lines.length).toBeGreaterThan(1);
    expect(long.lines.join("")).toBe("vite-plugin-singlefile");
  });
});
