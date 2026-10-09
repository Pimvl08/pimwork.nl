import { describe, expect, it } from "vitest";
import { activePageId, isHomePath, shortcutFor, type KeyInput } from "@/components/chrome/logic";
import { chromeCopy } from "@/components/chrome/copy";

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
  it("opens the palette with Ctrl or Cmd+K, even while typing", () => {
    expect(shortcutFor(key("k", { ctrl: true }))).toEqual({ type: "terminal" });
    expect(shortcutFor(key("K", { meta: true, typing: true }))).toEqual({ type: "terminal" });
  });
  it("leaves Ctrl+K and Escape to an open palette", () => {
    expect(shortcutFor(key("k", { ctrl: true, terminalOpen: true }))).toBeNull();
    expect(shortcutFor(key("Escape", { terminalOpen: true }))).toBeNull();
    expect(shortcutFor(key("Escape"))).toEqual({ type: "escape" });
  });
  it("maps single keys to the sheet, theme, language and the six pages", () => {
    expect(shortcutFor(key("?"))).toEqual({ type: "sheet" });
    expect(shortcutFor(key("t"))).toEqual({ type: "theme" });
    expect(shortcutFor(key("L"))).toEqual({ type: "lang" });
    expect(shortcutFor(key("0"))).toEqual({ type: "page", id: "home" });
    expect(shortcutFor(key("1"))).toEqual({ type: "page", id: "work" });
    expect(shortcutFor(key("2"))).toEqual({ type: "page", id: "services" });
    expect(shortcutFor(key("3"))).toEqual({ type: "page", id: "about" });
    expect(shortcutFor(key("4"))).toEqual({ type: "page", id: "lab" });
    expect(shortcutFor(key("5"))).toEqual({ type: "page", id: "contact" });
    expect(shortcutFor(key("6"))).toBeNull();
  });
  it("ignores single keys while typing, with modifiers, in a modal or while composing", () => {
    expect(shortcutFor(key("t", { typing: true }))).toBeNull();
    expect(shortcutFor(key("t", { ctrl: true }))).toBeNull();
    expect(shortcutFor(key("2", { modalOpen: true }))).toBeNull();
    expect(shortcutFor(key("1", { terminalOpen: true }))).toBeNull();
    expect(shortcutFor(key("t", { composing: true }))).toBeNull();
  });
});

describe("activePageId", () => {
  it("finds the page from the pathname", () => {
    expect(activePageId("/nl", "nl")).toBe("home");
    expect(activePageId("/nl/", "nl")).toBe("home");
    expect(activePageId("/nl/werk", "nl")).toBe("work");
    expect(activePageId("/nl/werk/teamsync", "nl")).toBe("work");
    expect(activePageId("/en/over", "en")).toBe("about");
    expect(activePageId("/en/lab", "en")).toBe("lab");
    expect(activePageId("/nl/contact", "nl")).toBe("contact");
  });
  it("returns null outside the menu or for another language", () => {
    expect(activePageId("/nl/geheim", "nl")).toBeNull();
    expect(activePageId("/nl/werkplaats", "nl")).toBeNull();
    expect(activePageId("/en/werk", "nl")).toBeNull();
    expect(activePageId(null, "nl")).toBeNull();
  });
  it("recognises the home page", () => {
    expect(isHomePath("/nl", "nl")).toBe(true);
    expect(isHomePath("/nl/contact", "nl")).toBe(false);
    expect(isHomePath(undefined, "nl")).toBe(false);
  });
});

describe("chrome copy", () => {
  const text = JSON.stringify(chromeCopy);
  it("never uses an em or en dash", () => {
    expect(text).not.toMatch(/[–—]/);
  });
  it("does not credit tools in the footer", () => {
    expect(text).not.toMatch(/Claude|gebouwd met|built with/i);
  });
  it("has the footer line in both languages", () => {
    expect(chromeCopy.footer.nl.line).toBe("Software, automatisering en websites uit Aarle-Rixtel.");
    expect(chromeCopy.footer.en.line).toBe("Software, automation and websites from Aarle-Rixtel.");
  });
});
