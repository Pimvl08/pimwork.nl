import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import {
  complete,
  filterPalette,
  findPage,
  fuzzyScore,
  levenshtein,
  paletteItems,
  parseInput,
  runCommand,
  suggestCommand,
  VIRTUAL_FILES,
  type CommandContext,
  type Line,
} from "@/components/terminal/engine";
import { COMMANDS, commandHelp, termCopy } from "@/components/terminal/copy";
import { KONAMI, createClickCounter, createSequence } from "@/components/easter/eggs";

const ctx = (over: Partial<CommandContext> = {}): CommandContext => ({ lang: "nl", theme: "dark", history: [], ...over });
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
  it("has exactly the navigation commands, with bilingual help", () => {
    expect([...COMMANDS].sort()).toEqual(
      ["help", "projects", "open", "goto", "theme", "lang", "contact", "whoami", "ls", "cat", "clear", "history", "echo", "matrix", "secret", "sudo"].sort(),
    );
    for (const c of COMMANDS) {
      expect(commandHelp[c].nl.text.length).toBeGreaterThan(3);
      expect(commandHelp[c].en.text.length).toBeGreaterThan(3);
    }
    expect(text(runCommand("help", ctx({ lang: "en" })).lines)).toContain("goto <work|about|lab|contact|home>");
  });

  it("knows nothing about asking an AI", () => {
    expect(runCommand("ask wat bouw je?", ctx()).command).toBeNull();
    const everything = JSON.stringify([commandHelp, termCopy.nl, termCopy.en.whoami, termCopy.en.files]);
    expect(everything).not.toMatch(/api\/ask|machine|Claude/i);
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

  it("goes to pages by Dutch path, English name and number, in the current language", () => {
    expect(runCommand("goto werk", ctx()).actions).toEqual([{ type: "goto", href: "/nl/werk" }]);
    expect(runCommand("goto work", ctx({ lang: "en" })).actions).toEqual([{ type: "goto", href: "/en/werk" }]);
    expect(runCommand("goto over", ctx()).actions).toEqual([{ type: "goto", href: "/nl/over" }]);
    expect(runCommand("goto about", ctx()).actions).toEqual([{ type: "goto", href: "/nl/over" }]);
    expect(runCommand("goto lab", ctx()).actions).toEqual([{ type: "goto", href: "/nl/lab" }]);
    expect(runCommand("goto contact", ctx()).actions).toEqual([{ type: "goto", href: "/nl/contact" }]);
    expect(runCommand("goto home", ctx()).actions).toEqual([{ type: "goto", href: "/nl" }]);
    expect(runCommand("goto 4", ctx()).actions).toEqual([{ type: "goto", href: "/nl/contact" }]);
    expect(runCommand("goto nergens", ctx()).actions).toEqual([]);
    expect(findPage("Over mij")?.id).toBe("about");
  });

  it("emits typed actions for theme, lang, clear, matrix and secret", () => {
    expect(runCommand("theme toggle", ctx()).actions).toEqual([{ type: "theme", theme: "toggle" }]);
    expect(runCommand("theme purple", ctx()).actions).toEqual([]);
    expect(runCommand("lang en", ctx()).actions).toEqual([{ type: "lang", lang: "en" }]);
    expect(runCommand("lang nl", ctx()).actions).toEqual([]);
    expect(runCommand("clear", ctx()).actions).toEqual([{ type: "clear" }]);
    expect(runCommand("matrix", ctx()).actions.map((a) => a.type)).toContain("matrix");
    expect(runCommand("secret", ctx()).actions).toEqual([{ type: "secret" }]);
  });

  it("answers whoami in the first person", () => {
    const nl = text(runCommand("whoami", ctx()).lines);
    expect(nl).toMatch(/Ik ben Pim/);
    expect(text(runCommand("whoami", ctx({ lang: "en" })).lines)).toMatch(/I am Pim/);
  });

  it("refuses sudo politely", () => {
    expect(text(runCommand("sudo rm -rf /", ctx()).lines)).toBe("Toegang geweigerd. Netjes geprobeerd.");
  });

  it("echoes text as text, never as markup", () => {
    const result = runCommand('echo <img src=x onerror="alert(1)">', ctx());
    expect(result.lines).toEqual([{ kind: "text", text: '<img src=x onerror="alert(1)">' }]);
  });

  it("reads virtual files built from the content, without dates or costs", () => {
    const md = text(runCommand("cat projecten.md", ctx({ lang: "en" })).lines);
    for (const p of projects) expect(md).toContain(p.name);
    expect(text(runCommand("cat over.txt", ctx()).lines)).toContain("Ik ben Pim");
    expect(text(runCommand("cat diensten.md", ctx()).lines)).toContain("Web-apps die mensen echt gebruiken");
    expect(runCommand("cat nope.txt", ctx()).lines[0].kind).toBe("error");
    expect(text(runCommand("ls -a", ctx()).lines)).toContain(".geheim");
    for (const file of VIRTUAL_FILES) {
      for (const lang of ["nl", "en"] as const) {
        const body = text(runCommand(`cat ${file}`, ctx({ lang })).lines);
        expect(body).not.toMatch(/\b20\d\d\b|€|\$\s?\d|euro|nog in te vullen/i);
      }
    }
  });

  it("lists history", () => {
    expect(text(runCommand("history", ctx({ history: ["help", "whoami"] })).lines)).toContain("whoami");
    expect(runCommand("history", ctx()).lines[0].kind).toBe("muted");
  });

  it("never produces lines containing em or en dashes", () => {
    for (const c of COMMANDS) {
      for (const lang of ["nl", "en"] as const) {
        expect(text(runCommand(c, ctx({ lang })).lines)).not.toMatch(/[–—]/);
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
    expect(complete("goto co").value).toBe("goto contact");
    expect(complete("s").options).toEqual(expect.arrayContaining(["secret", "sudo"]));
  });

  it("fuzzy-matches pages, projects and commands", () => {
    expect(fuzzyScore("tsync", "TeamSync")).toBeGreaterThan(0);
    expect(fuzzyScore("zz", "TeamSync")).toBe(-1);
    const items = paletteItems("nl");
    expect(filterPalette(items, "teamsync")[0].command).toBe("open teamsync");
    expect(filterPalette(items, "contact")[0].command).toBe("goto contact");
    expect(filterPalette(items, "over mij")[0].command).toBe("goto over");
    expect(filterPalette(items, "").length).toBe(items.length);
    expect(items.some((i) => /machine|ask/i.test(i.command))).toBe(false);
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
