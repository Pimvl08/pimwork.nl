import { expect, gotoReady, test } from "./fixtures";

const WIDTHS = [360, 390, 768, 1280, 1440];

test.describe("responsive", () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px and the name is visible`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoReady(page, "/nl");
      await expect(page.locator("h1")).toBeVisible();

      // Walk the page so lazily mounted plates are measured too.
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 1200) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));

      const metrics = await page.evaluate(() => {
        const de = document.documentElement;
        // Name the widest unclipped culprits so a failure says where to look.
        const culprits: string[] = [];
        for (const el of Array.from(document.querySelectorAll<Element>("body *"))) {
          const r = el.getBoundingClientRect();
          if (!r.width || r.right <= de.clientWidth + 1) continue;
          if (getComputedStyle(el).position === "fixed") continue;
          let clipped = false;
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const style = getComputedStyle(a);
            if (style.overflowX !== "visible" || style.position === "fixed") {
              clipped = true;
              break;
            }
          }
          if (clipped) continue;
          const section = el.closest("section, header, footer");
          const cls = typeof el.className === "string" ? el.className : (el.className as SVGAnimatedString).baseVal;
          culprits.push(`#${section?.id || section?.tagName.toLowerCase() || "?"} ${el.tagName.toLowerCase()}.${cls.split(" ")[0]} right=${Math.round(r.right)}`);
        }
        return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, culprits: culprits.slice(0, 6) };
      });
      expect(metrics.scrollWidth, `overflow at ${width}px: ${metrics.culprits.join(", ")}`).toBeLessThanOrEqual(metrics.clientWidth + 1);
    });
  }
});
