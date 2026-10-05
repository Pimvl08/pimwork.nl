import AxeBuilder from "@axe-core/playwright";
import { expect, gotoReady, test } from "./fixtures";

const PAGES: { path: string; theme: "dark" | "light" }[] = [
  { path: "/nl", theme: "dark" },
  { path: "/en", theme: "dark" },
  { path: "/nl/werk/teamsync", theme: "dark" },
  // Contrast must hold on cotton paper too.
  { path: "/nl", theme: "light" },
];
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("accessibility (axe)", () => {
  for (const { path, theme } of PAGES) {
    test(`${path} (${theme}) has no serious or critical violations`, async ({ page, context, baseURL }) => {
      await context.addCookies([{ name: "pim-theme", value: theme, url: baseURL ?? "http://localhost:3100" }]);
      await gotoReady(page, path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      // Walk the page once so lazily mounted plates (lab, media, data) are audited too.
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 900) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
        await page.waitForTimeout(100);
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      // Let entrance transitions settle so contrast is measured on the final colours.
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(800);

      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const serious = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => ({
          rule: v.id,
          impact: v.impact,
          targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
          count: v.nodes.length,
        }));
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
});
