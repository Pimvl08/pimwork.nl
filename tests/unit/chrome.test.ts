import { describe, expect, it } from "vitest";
import {
  PRELOAD_MAX,
  PRELOAD_MIN,
  cursorModeFor,
  followFactor,
  isHomePath,
  lerpAngle,
  preloadDone,
  preloadTarget,
  railArcOffset,
  shortcutFor,
  type KeyInput,
} from "@/components/chrome/logic";

const key = (k: string, extra: Partial<KeyInput> = {}): KeyInput => ({
  key: k,
  ctrl: false,
  meta: false,
  alt: false,
  typing: false,
  terminalOpen: false,
  modalOpen: false,
  ...extra,
});

describe("shortcutFor", () => {
  it("opens the terminal with Ctrl or Cmd+K, even while typing", () => {
    expect(shortcutFor(key("k", { ctrl: true }))).toEqual({ type: "terminal" });
    expect(shortcutFor(key("K", { meta: true, typing: true }))).toEqual({ type: "terminal" });
  });
  it("leaves Ctrl+K and Escape to an open terminal", () => {
    expect(shortcutFor(key("k", { ctrl: true, terminalOpen: true }))).toBeNull();
    expect(shortcutFor(key("Escape", { terminalOpen: true }))).toBeNull();
  });
  it("maps single keys", () => {
    expect(shortcutFor(key("?"))).toEqual({ type: "sheet" });
    expect(shortcutFor(key("t"))).toEqual({ type: "theme" });
    expect(shortcutFor(key("l"))).toEqual({ type: "lang" });
    expect(shortcutFor(key("0"))).toEqual({ type: "plate", id: "cover" });
    expect(shortcutFor(key("7"))).toEqual({ type: "plate", id: "contact" });
    expect(shortcutFor(key("8"))).toBeNull();
  });
  it("ignores single keys while typing, with modifiers, in a modal or while composing", () => {
    expect(shortcutFor(key("t", { typing: true }))).toBeNull();
    expect(shortcutFor(key("t", { ctrl: true }))).toBeNull();
    expect(shortcutFor(key("2", { modalOpen: true }))).toBeNull();
    expect(shortcutFor(key("t", { composing: true }))).toBeNull();
  });
});

describe("cursorModeFor", () => {
  const defaults = { view: "Bekijk", drag: "Sleep", play: "Speel" };
  it("maps known kinds", () => {
    expect(cursorModeFor("link", null, defaults)).toEqual({ mode: "link", label: "" });
    expect(cursorModeFor("text", null, defaults)).toEqual({ mode: "text", label: "" });
    expect(cursorModeFor("drag", null, defaults)).toEqual({ mode: "disc", label: "Sleep" });
    expect(cursorModeFor("play", "Start", defaults)).toEqual({ mode: "disc", label: "Start" });
  });
  it("treats an unknown value as the disc label (ArchButton passes its label)", () => {
    expect(cursorModeFor("Open", null, defaults)).toEqual({ mode: "disc", label: "Open" });
  });
  it("falls back to the default cursor", () => {
    expect(cursorModeFor(null, null, defaults).mode).toBe("default");
    expect(cursorModeFor("none", null, defaults).mode).toBe("default");
  });
});

describe("motion helpers", () => {
  it("followFactor is frame-rate independent", () => {
    const oneFrame = followFactor(0.2, 1000 / 60);
    expect(oneFrame).toBeCloseTo(0.2, 5);
    const twoFrames = followFactor(0.2, 2000 / 60);
    expect(twoFrames).toBeCloseTo(1 - 0.8 * 0.8, 5);
  });
  it("lerpAngle takes the short way round", () => {
    expect(lerpAngle(170, -170, 1)).toBeCloseTo(190, 5);
    expect(lerpAngle(-170, 170, 0.5)).toBeCloseTo(-180, 5);
    expect(lerpAngle(720, 10, 1)).toBeCloseTo(730, 5);
  });
});

describe("preloader progress", () => {
  it("never reaches 100 before the minimum time", () => {
    expect(preloadTarget(0, true, true)).toBe(0);
    expect(preloadTarget(PRELOAD_MIN / 2, true, true)).toBeCloseTo(50, 5);
    expect(preloadDone(PRELOAD_MIN - 1, true, true)).toBe(false);
    expect(preloadDone(PRELOAD_MIN, true, true)).toBe(true);
  });
  it("follows real milestones and finishes by the maximum", () => {
    expect(preloadTarget(PRELOAD_MIN, false, false)).toBe(34);
    expect(preloadTarget(PRELOAD_MIN, true, false)).toBe(67);
    expect(preloadTarget(PRELOAD_MAX, false, false)).toBe(100);
    expect(preloadDone(PRELOAD_MAX, false, false)).toBe(true);
  });
});

describe("layout helpers", () => {
  it("puts rail dots on a symmetric arc", () => {
    expect(railArcOffset(0, 8, 9)).toBe(0);
    expect(railArcOffset(7, 8, 9)).toBe(0);
    expect(railArcOffset(3, 8, 9)).toBe(railArcOffset(4, 8, 9));
    expect(railArcOffset(3, 8, 9)).toBeGreaterThan(railArcOffset(1, 8, 9));
  });
  it("recognises the home page", () => {
    expect(isHomePath("/nl", "nl")).toBe(true);
    expect(isHomePath("/nl/", "nl")).toBe(true);
    expect(isHomePath("/nl/colofon", "nl")).toBe(false);
    expect(isHomePath(null, "nl")).toBe(false);
  });
});
