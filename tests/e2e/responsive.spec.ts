import { expect, gotoReady, test, walkPage } from "./fixtures";

const PAGES = ["/nl", "/nl/werk", "/nl/diensten", "/nl/diensten/website-laten-maken", "/nl/over", "/nl/contact"];

/** Every width on desktop; the phone project covers the two phone widths with touch emulation. */
const WIDTHS: Record<string, number[]> = {
  desktop: [360, 390, 768, 1280, 1440],
  mobile: [360, 390],
};

test.describe("responsive: no horizontal overflow", () => {
  for (const width of [360, 390, 768, 1280, 1440]) {
    for (const path of PAGES) {
      test(`${path} at ${width}px`, async ({ page }, info) => {
        test.skip(!(WIDTHS[info.project.name] ?? []).includes(width), "Width covered by another project.");
        await page.setViewportSize({ width, height: 900 });
        await gotoReady(page, path);
        await walkPage(page);
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          const over = doc.scrollWidth - doc.clientWidth;
          const culprits: string[] = [];
          if (over > 1) {
            for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.right > doc.clientWidth + 1 && getComputedStyle(el).position !== "fixed") {
                culprits.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`);
                if (culprits.length >= 5) break;
              }
            }
          }
          return { over, culprits };
        });
        expect(overflow.over, `overflow at ${width}px: ${overflow.culprits.join(" | ")}`).toBeLessThanOrEqual(1);
      });
    }
  }
});
