import AxeBuilder from "@axe-core/playwright";
import { expect, gotoReady, test, walkPage } from "./fixtures";

const PAGES: { path: string; theme: "dark" | "light" }[] = [
  { path: "/nl", theme: "dark" },
  { path: "/nl/werk", theme: "dark" },
  { path: "/nl/werk/teamsync", theme: "dark" },
  { path: "/nl/over", theme: "dark" },
  { path: "/nl/lab", theme: "dark" },
  { path: "/nl/contact", theme: "dark" },
  { path: "/nl/diensten", theme: "dark" },
  { path: "/nl/diensten/website-laten-maken", theme: "dark" },
  { path: "/nl/lab/solana-forensics", theme: "dark" },
  { path: "/nl/diensten/software-op-maat", theme: "light" },
  // Contrast must hold on cotton paper too.
  { path: "/nl", theme: "light" },
  { path: "/nl/werk/strength-tracker", theme: "light" },
];
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("accessibility (axe)", () => {
  for (const { path, theme } of PAGES) {
    test(`${path} (${theme}) has no serious or critical violations`, async ({ page, context, baseURL }) => {
      await context.addCookies([{ name: "pim-theme", value: theme, url: baseURL ?? "http://localhost:3100" }]);
      await gotoReady(page, path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      // Walk the page once so scroll-mounted content is audited too.
      await walkPage(page);
      await page.evaluate(() => document.fonts.ready);
      // Let entrance transitions settle so contrast is measured on the final colours.
      await page.waitForFunction(() => document
            .getAnimations()
            .filter((a) => a.timeline === document.timeline && a.effect?.getTiming().iterations !== Infinity)
            .every((a) => a.playState !== "running"), undefined, {
        timeout: 5_000,
      }).catch(() => undefined);

      const results = await new AxeBuilder({ page })
        .withTags(TAGS)
        // Decorative canvases (aria-hidden, with a text alternative beside them) are not content.
        .exclude('canvas[aria-hidden="true"]')
        .analyze();
      const serious = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => ({
          rule: v.id,
          impact: v.impact,
          targets: v.nodes.slice(0, 6).map((n) => n.target.join(" ")),
          summary: v.nodes[0]?.failureSummary?.split("\n").slice(0, 3).join(" "),
          count: v.nodes.length,
        }));
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
});
