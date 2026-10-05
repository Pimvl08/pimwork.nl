import { describe, expect, it } from "vitest";
import { labCopy } from "@/components/lab/copy";
import { createDust, particleCount, sampleTargets, sanitizeWord, setTargets, stepDust } from "@/components/lab/dust";
import { REST, letterTargets, settle } from "@/components/lab/letters";
import { arcPlacement, hashToIndex, indexToAnchor, mulberry32, nextTabIndex } from "@/components/lab/logic";
import { drawingToSvg, elementLength, generateDrawing, newSeed, totalLength } from "@/components/lab/passer";

describe("lab tabs", () => {
  it("parses deep links #lab-01 to #lab-05 only", () => {
    expect(hashToIndex("#lab-01")).toBe(0);
    expect(hashToIndex("#lab-05")).toBe(4);
    expect(hashToIndex("#lab-06")).toBeNull();
    expect(hashToIndex("#lab")).toBeNull();
    expect(hashToIndex("")).toBeNull();
    expect(indexToAnchor(2)).toBe("lab-03");
  });

  it("follows the WAI-ARIA tabs keys with wrap-around", () => {
    expect(nextTabIndex(0, "ArrowRight")).toBe(1);
    expect(nextTabIndex(4, "ArrowRight")).toBe(0);
    expect(nextTabIndex(0, "ArrowLeft")).toBe(4);
    expect(nextTabIndex(2, "Home")).toBe(0);
    expect(nextTabIndex(2, "End")).toBe(4);
    expect(nextTabIndex(2, "Enter")).toBeNull();
  });

  it("places the tabs on a symmetric arc with the crown in the middle", () => {
    const places = [0, 1, 2, 3, 4].map((i) => arcPlacement(i));
    expect(places[2]).toEqual({ y: 0, rotate: 0 });
    expect(places[0].y).toBeCloseTo(places[4].y);
    expect(places[0].y).toBeGreaterThan(places[1].y);
    expect(places[0].rotate).toBe(-places[4].rotate);
  });

  it("has five experiments in both languages, without long dashes", () => {
    expect(labCopy.experiments.nl).toHaveLength(5);
    expect(labCopy.experiments.en).toHaveLength(5);
    const text = JSON.stringify(labCopy);
    expect(text).not.toMatch(new RegExp(String.fromCharCode(91, 0x2013, 0x2014, 93)));
    for (const e of labCopy.experiments.nl) expect(e.question.startsWith("Wat gebeurt er als")).toBe(true);
  });
});

describe("mulberry32", () => {
  it("is deterministic and stays in [0, 1)", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe("graphite dust", () => {
  it("sanitises custom words to letters and digits, max 8", () => {
    expect(sanitizeWord("Pim")).toBe("Pim");
    expect(sanitizeWord("<b>hoi</b>")).toBe("bhoib");
    expect(sanitizeWord("één 2 drie!")).toBe("één2drie");
    expect(sanitizeWord("abcdefghijk")).toBe("abcdefgh");
    expect(sanitizeWord("  ")).toBe("");
  });

  it("keeps the particle count between 5,000 and 9,000", () => {
    expect(particleCount(1400, 800, 2, false)).toBe(9000);
    expect(particleCount(360, 400, 3, true)).toBe(5000);
    expect(particleCount(1400, 800, 1, false)).toBeLessThanOrEqual(7000);
  });

  it("samples targets only where the text was drawn", () => {
    const w = 20;
    const h = 10;
    const rgba = new Uint8ClampedArray(w * h * 4);
    for (let y = 2; y < 6; y++) for (let x = 4; x < 10; x++) rgba[(y * w + x) * 4 + 3] = 255;
    const t = sampleTargets(rgba, w, h, 200, mulberry32(3), 1);
    for (let i = 0; i < 200; i++) {
      expect(t[i * 2]).toBeGreaterThanOrEqual(3.5);
      expect(t[i * 2]).toBeLessThan(10.5);
      expect(t[i * 2 + 1]).toBeGreaterThanOrEqual(1.5);
      expect(t[i * 2 + 1]).toBeLessThan(6.5);
    }
  });

  it("springs particles back to their targets with damping", () => {
    const s = createDust(50, 400, 300, mulberry32(9));
    const targets = new Float32Array(100).fill(150);
    setTargets(s, targets, false);
    for (let i = 0; i < 400; i++) stepDust(s, { x: 0, y: 0, inside: false, holding: false }, [], 1 / 60);
    for (let i = 0; i < s.n; i++) {
      expect(Math.abs(s.px[i] - 150)).toBeLessThan(1);
      expect(Math.abs(s.py[i] - 150)).toBeLessThan(1);
    }
  });

  it("pushes particles away from the pointer", () => {
    const s = createDust(1, 100, 100, mulberry32(1));
    setTargets(s, new Float32Array([50, 50]), true);
    stepDust(s, { x: 40, y: 50, inside: true, holding: false }, [], 1 / 60);
    expect(s.px[0]).toBeGreaterThan(50);
  });
});

describe("passerwerk generator", () => {
  it("gives the same arcs for the same seed", () => {
    const a = generateDrawing(2817, { density: 5, symmetry: "none" });
    const b = generateDrawing(2817, { density: 5, symmetry: "none" });
    expect(a).toEqual(b);
    expect(drawingToSvg(a, { paper: "#fff", ink: "#000", mute: "#666" })).toBe(drawingToSvg(b, { paper: "#fff", ink: "#000", mute: "#666" }));
  });

  it("gives different drawings for different seeds", () => {
    const a = generateDrawing(2817, { density: 5, symmetry: "none" });
    const b = generateDrawing(2818, { density: 5, symmetry: "none" });
    expect(a.elements).not.toEqual(b.elements);
  });

  it("has exactly one crease line and arcs with a positive sweep", () => {
    for (const symmetry of ["none", "mirror", "rotational"] as const) {
      const d = generateDrawing(1234, { density: 7, symmetry });
      expect(d.elements.filter((e) => e.kind === "line")).toHaveLength(1);
      for (const e of d.elements) {
        if (e.kind === "arc") {
          expect(e.a1).toBeGreaterThan(e.a0);
          expect(e.r).toBeGreaterThan(0);
        }
        expect(elementLength(e)).toBeGreaterThan(0);
      }
    }
  });

  it("mirrors arcs across the vertical axis", () => {
    const d = generateDrawing(77, { density: 4, symmetry: "mirror", width: 1000, height: 625 });
    const arcs = d.elements.filter((e) => e.kind === "arc");
    expect(arcs.length % 2).toBe(0);
    for (let i = 0; i < arcs.length; i += 2) {
      const [a, b] = [arcs[i], arcs[i + 1]];
      if (a.kind !== "arc" || b.kind !== "arc") continue;
      expect(a.cx + b.cx).toBeCloseTo(1000, 1);
      expect(a.r).toBe(b.r);
    }
  });

  it("draws more with a higher density", () => {
    const sparse = generateDrawing(500, { density: 1, symmetry: "none" });
    const dense = generateDrawing(500, { density: 10, symmetry: "none" });
    expect(totalLength(dense)).toBeGreaterThan(totalLength(sparse));
  });

  it("serialises to SVG with a title and no script", () => {
    const svg = drawingToSvg(generateDrawing(2817, { density: 5, symmetry: "rotational" }), { paper: "#f2efe6", ink: "#111", mute: "#777" });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("<title>Passerwerk, plaat 2817</title>");
    expect(svg).not.toMatch(/<script/i);
    expect(svg).not.toMatch(/NaN|Infinity/);
  });

  it("makes four-digit plate numbers", () => {
    expect(newSeed(() => 0)).toBe(1000);
    expect(newSeed(() => 0.99999)).toBe(9999);
  });
});

describe("letters with mass", () => {
  it("is heaviest right under the pointer and at rest when it leaves", () => {
    const under = letterTargets({ dx: 0, dy: 0, inside: true, radius: 120, vx: 0, vy: 0, scrollV: 0, index: 0 });
    const far = letterTargets({ dx: 600, dy: 0, inside: true, radius: 120, vx: 0, vy: 0, scrollV: 0, index: 0 });
    const gone = letterTargets({ dx: 0, dy: 0, inside: false, radius: 120, vx: 0, vy: 0, scrollV: 0, index: 0 });
    expect(under.wght).toBeCloseTo(900);
    expect(far.wght).toBeLessThan(401);
    expect(gone).toEqual({ ...REST, skew: -0, tx: 0 });
  });

  it("leans with speed and stretches with scroll", () => {
    const fast = letterTargets({ dx: 10, dy: 0, inside: true, radius: 120, vx: 3, vy: 0, scrollV: 0, index: 0 });
    expect(fast.skew).toBeLessThan(-10);
    const scrolled = letterTargets({ dx: 0, dy: 0, inside: false, radius: 120, vx: 0, vy: 0, scrollV: 2, index: 1 });
    expect(scrolled.sy).toBeGreaterThan(1.1);
  });

  it("eases toward the target and reports when it has settled", () => {
    const s = { ...REST };
    const target = { ...REST, wght: 900 };
    let moving = true;
    let frames = 0;
    while (moving && frames < 600) {
      moving = settle(s, target, 1 / 60);
      frames++;
    }
    expect(moving).toBe(false);
    expect(s.wght).toBeGreaterThan(899);
  });
});
