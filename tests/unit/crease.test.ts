import { describe, expect, it } from "vitest";
import { buildShell, creaseLine, creaseStates, defaultCrease, foldPoint, mixCrease } from "@/lib/crease";

describe("curved crease geometry", () => {
  it("keeps the base side flat on the ground", () => {
    const [x, y, z, d] = foldPoint(-0.6, -0.6, defaultCrease);
    expect(d).toBeLessThan(0);
    expect([x, y, z]).toEqual([-0.6, -0.6, 0]);
  });

  it("lifts the flap and preserves its distance to the crease (paper does not stretch)", () => {
    const p = { ...defaultCrease, fold: 1 };
    const [cx, cy] = p.center;
    const u = 0.5;
    const v = 0.5;
    const distFlat = Math.hypot(u - cx, v - cy) - p.radius;
    const [x, y, z, d] = foldPoint(u, v, p);
    expect(d).toBeCloseTo(distFlat, 6);
    expect(z).toBeGreaterThan(0);
    // Distance from the folded point to its crease foot stays d.
    const n = Math.hypot(u - cx, v - cy);
    const qx = cx + ((u - cx) / n) * p.radius;
    const qy = cy + ((v - cy) / n) * p.radius;
    expect(Math.hypot(x - qx, y - qy, z)).toBeCloseTo(d, 6);
  });

  it("is completely flat at fold 0", () => {
    const mesh = buildShell(creaseStates.flat, 8, 24);
    for (let i = 2; i < mesh.positions.length; i += 3) expect(Math.abs(mesh.positions[i])).toBeLessThan(1e-9);
  });

  it("builds a closed indexed mesh with unit normals", () => {
    const mesh = buildShell(defaultCrease, 12, 40);
    expect(mesh.vertexCount).toBe(1 + 12 * 40);
    expect(mesh.indices.length % 3).toBe(0);
    for (let i = 0; i < mesh.indices.length; i++) expect(mesh.indices[i]).toBeLessThan(mesh.vertexCount);
    for (let v = 0; v < mesh.vertexCount; v++) {
      const len = Math.hypot(mesh.normals[v * 3], mesh.normals[v * 3 + 1], mesh.normals[v * 3 + 2]);
      expect(len).toBeCloseTo(1, 4);
    }
  });

  it("returns crease points that lie inside the disc", () => {
    const line = creaseLine(defaultCrease);
    expect(line.length).toBeGreaterThan(6);
    for (let i = 0; i < line.length; i += 3) expect(Math.hypot(line[i], line[i + 1])).toBeLessThanOrEqual(1.001);
  });

  it("mixes two states continuously", () => {
    const mid = mixCrease(creaseStates.flat, creaseStates.stable, 0.5);
    expect(mid.fold).toBeCloseTo((creaseStates.flat.fold + creaseStates.stable.fold) / 2);
  });
});
