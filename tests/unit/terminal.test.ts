import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import {
  complete,
  countSkills,
  filterPalette,
  fuzzyScore,
  levenshtein,
  paletteItems,
  parseInput,
  runCommand,
  suggestCommand,
  type CommandContext,
  type Line,
} from "@/components/terminal/engine";
import { COMMANDS, commandHelp } from "@/components/terminal/copy";
import { KONAMI, createClickCounter, createSequence } from "@/components/easter/eggs";

const ctx = (over: Partial<CommandContext> = {}): CommandContext => ({ lang: "nl", theme: "dark", soundOn: false, history: [], ...over });
const text = (lines: Line[]) =>
  lines
    .map((l) => ("text" in l ? l.text : l.kind === "list" ? l.items.join(" ") : l.rows.map((r) => r.join(" ")).join("\n")))
    .join("\n");

describe("parsing", () => {
  it("trims and accepts a leading slash", () => {
    expect(parseInput("  /HELP  me ")).toEqual({ name: "help", args: ["me"], rest: "me" });
    expect(runCommand("/help", ctx()).command).toBe("help");
    expect(runCommand("help", ctx()).command).toBe("help");
  });

  it("rejects input over 200 characters", () => {
    const result = runCommand(`echo ${"x".repeat(200)}`, ctx());
    expect(result.command).toBeNull();
    expect(result.lines[0]).toMatchObject({ kind: "error" });
  });

  it("does nothing for empty input", () => {
    expect(runCommand("   ", ctx())).toEqual({ command: null, lines: [], actions: [] });
  });
});

describe("commands", () => {
  it("has bilingual help for every command", () => {
    for (const c of COMMANDS) {
      expect(commandHelp[c].nl.text.length).toBeGreaterThan(3);
      expect(commandHelp[c].en.text.length).toBeGreaterThan(3);
    }
    const help = runCommand("help", ctx({ lang: "en" }));
    expect(text(help.lines)).toContain("goto <plate|number>");
  });

  it("suggests the closest command for typos", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(suggestCommand("hlep")).toBe("help");
    expect(suggestCommand("projcts")).toBe("projects");
    expect(suggestCommand("qqqqqqqq")).toBeNull();
    const result = runCommand("thme dark", ctx());
    expect(result.command).toBeNull();
    expect(text(result.lines)).toContain("theme");
  });

  it("opens projects by number and slug", () => {
    expect(runCommand("open 1", ctx()).actions).toEqual([{ type: "open", slug: projects[0].slug }]);
    expect(runCommand("open teamsync", ctx()).actions).toEqual([{ type: "open", slug: "teamsync" }]);
    expect(runCommand("open 42", ctx()).lines[0].kind).toBe("error");
  });

  it("goes to plates by id, numeral and label in both languages", () => {
    expect(runCommand("goto work", ctx()).actions).toEqual([{ type: "goto", id: "work" }]);
    expect(runCommand("goto 06", ctx()).actions).toEqual([{ type: "goto", id: "machine" }]);
    expect(runCommand("goto werk", ctx()).actions).toEqual([{ type: "goto", id: "work" }]);
    expect(runCommand("goto nergens", ctx()).actions).toEqual([]);
  });

  it("emits typed actions for theme, lang, sound, clear, matrix and secret", () => {
    expect(runCommand("theme toggle", ctx()).actions).toEqual([{ type: "theme", theme: "toggle" }]);
    expect(runCommand("theme purple", ctx()).actions).toEqual([]);
    expect(runCommand("lang en", ctx()).actions).toEqual([{ type: "lang", lang: "en" }]);
    expect(runCommand("lang nl", ctx()).actions).toEqual([]);
    expect(runCommand("sound on", ctx()).actions).toEqual([{ type: "sound", on: true }]);
    expect(runCommand("clear", ctx()).actions).toEqual([{ type: "clear" }]);
    expect(runCommand("matrix", ctx()).actions.map((a) => a.type)).toContain("matrix");
    expect(runCommand("secret", ctx()).actions).toEqual([{ type: "secret" }]);
  });

  it("refuses sudo politely", () => {
    expect(text(runCommand("sudo rm -rf /", ctx()).lines)).toBe("Toegang geweigerd. Netjes geprobeerd.");
  });

  it("gives a konami hint without the code", () => {
    const out = text(runCommand("konami", ctx()).lines).toLowerCase();
    expect(out).not.toMatch(/arrowup|omhoog omhoog|b a/);
  });

  it("echoes text as text, never as markup", () => {
    const result = runCommand('echo <img src=x onerror="alert(1)">', ctx());
    expect(result.lines).toEqual([{ kind: "text", text: '<img src=x onerror="alert(1)">' }]);
  });

  it("reads virtual files generated from content", () => {
    const md = text(runCommand("cat projects.md", ctx({ lang: "en" })).lines);
    for (const p of projects) expect(md).toContain(p.name);
    expect(text(runCommand("cat about.txt", ctx()).lines)).toContain("nog in te vullen");
    expect(runCommand("cat nope.txt", ctx()).lines[0].kind).toBe("error");
    expect(text(runCommand("ls -a", ctx()).lines)).toContain(".geheim");
  });

  it("lists history and formats dates", () => {
    expect(text(runCommand("history", ctx({ history: ["help", "about"] })).lines)).toContain("about");
    expect(text(runCommand("date", ctx({ now: new Date(2026, 9, 5, 12, 0) })).lines)).toContain("2026");
  });

  it("counts normalised skills from the projects", () => {
    const skills = countSkills("en");
    const names = skills.map((s) => s.name);
    expect(names).toContain("React");
    expect(names).toContain("TypeScript");
    expect(names).not.toContain("React 19");
    expect(names).not.toContain("TypeScript strict");
    expect(skills[0].count).toBeGreaterThanOrEqual(skills[skills.length - 1].count);
    const react = skills.find((s) => s.name === "React")!;
    expect(react.count).toBe(projects.filter((p) => p.stack.some((t) => t.startsWith("React "))).length);
  });

  it("never produces lines containing em or en dashes", () => {
    for (const c of COMMANDS) {
      for (const lang of ["nl", "en"] as const) {
        expect(text(runCommand(c, ctx({ lang })).lines)).not.toMatch(/[\u2013\u2014]/);
      }
    }
  });
});

describe("completion and palette", () => {
  it("completes command names and arguments", () => {
    expect(complete("pro").value).toBe("projects ");
    expect(complete("/the").value).toBe("/theme ");
    expect(complete("theme d").value).toBe("theme dark");
    expect(complete("open team").value).toBe("open teamsync");
    const ambiguous = complete("s");
    expect(ambiguous.options).toEqual(expect.arrayContaining(["skills", "stack", "sound", "secret", "sudo"]));
  });

  it("fuzzy-matches commands, plates and projects", () => {
    expect(fuzzyScore("tsync", "TeamSync")).toBeGreaterThan(0);
    expect(fuzzyScore("zz", "TeamSync")).toBe(-1);
    const items = paletteItems("nl");
    expect(filterPalette(items, "teamsync")[0].command).toBe("open teamsync");
    expect(filterPalette(items, "machine")[0].command).toBe("goto machine");
    expect(filterPalette(items, "").length).toBe(items.length);
  });
});

describe("egg triggers", () => {
  it("matches the Konami code, also after an extra up", () => {
    const feed = createSequence(KONAMI);
    const keys = ["ArrowUp", ...KONAMI];
    const results = keys.map((k) => feed(k));
    expect(results.at(-1)).toBe(true);
    expect(results.slice(0, -1).every((r) => !r)).toBe(true);
  });

  it("counts five clicks within three seconds", () => {
    const click = createClickCounter(5, 3000);
    expect([0, 500, 1000, 1500].map(click).some(Boolean)).toBe(false);
    expect(click(2000)).toBe(true);
    const slow = createClickCounter(5, 3000);
    expect([0, 1000, 2000, 3000, 4000].map(slow).some(Boolean)).toBe(false);
  });
});
