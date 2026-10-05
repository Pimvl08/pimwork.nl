import { describe, expect, it } from "vitest";
import { escapeHtml, headerSafe, stripLineBreaks } from "@/lib/escape";

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe("&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
  });

  it("escapes an ampersand only once per pass and leaves plain text alone", () => {
    expect(escapeHtml("&amp;")).toBe("&amp;amp;");
    expect(escapeHtml("Hallo Pim, mooi werk.")).toBe("Hallo Pim, mooi werk.");
  });

  it("neutralises a script payload", () => {
    const out = escapeHtml("<script>alert(1)</script>");
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
  });
});

describe("stripLineBreaks and headerSafe", () => {
  it("removes CR and LF so no header line can be injected", () => {
    const out = stripLineBreaks("Pim\r\nBcc: victim@example.com\nX-Evil: 1");
    expect(out).not.toMatch(/[\r\n]/);
    expect(out).toBe("Pim Bcc: victim@example.com X-Evil: 1");
  });

  it("removes other control characters and collapses whitespace", () => {
    expect(stripLineBreaks("  a\u0000\u0007b\t\tc  ")).toBe("a b c");
  });

  it("caps the length", () => {
    expect(headerSafe("x".repeat(500), 80)).toHaveLength(80);
    expect(headerSafe("Naam\r\nmet regel")).toBe("Naam met regel");
  });
});
