import { SLUGS, expect, gotoReady, test } from "./fixtures";

test.describe("about", () => {
  test('shows the "Hoe ik werk" block without naming the tools behind it', async ({ page }) => {
    await gotoReady(page, "/nl/over");
    await expect(page.getByRole("heading", { level: 1, name: "Over mij" })).toBeVisible();
    const how = page.getByRole("region", { name: "Hoe ik werk" });
    await expect(how).toBeVisible();
    await expect(how).toContainText("kleine, gecontroleerde stappen");
    expect(await page.locator("body").innerText()).not.toMatch(/Claude|AI-tool/);
  });

  test("only filled facts are shown", async ({ page }) => {
    await gotoReady(page, "/nl/over");
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/Nog in te vullen/i);
    const values = await page.locator("main dl dd").allInnerTexts();
    for (const value of values) expect(value.trim().length, "a fact without a value").toBeGreaterThan(0);
  });

  test("the portfolio download points at the PDF", async ({ page }) => {
    await gotoReady(page, "/nl/over");
    const link = page.getByRole("main").getByRole("link", { name: /portfolio/i });
    await expect(link).toHaveAttribute("href", "/portfolio-pim-nl.pdf");
  });

  const elsewhere = ["/nl", "/nl/werk", "/nl/lab", "/nl/contact", ...SLUGS.slice(0, 2).map((s) => `/nl/werk/${s}`)];
  for (const path of elsewhere) {
    test(`${path} never mentions Claude Code`, async ({ page }) => {
      await gotoReady(page, path);
      expect(await page.locator("body").innerText()).not.toContain("Claude Code");
    });
  }
});

test.describe("lab", () => {
  test("tabs switch with the arrow keys and the selected panel mounts", async ({ page }) => {
    await gotoReady(page, "/nl/lab");
    const tablist = page.getByRole("tablist", { name: "Proeven" });
    const tabs = tablist.getByRole("tab");
    await expect(tabs).toHaveCount(5);
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");

    const panel = (n: number) => page.locator(`#lab-panel-0${n}`);
    const mounted = async (n: number) => {
      await expect(panel(n)).toBeVisible();
      await expect(panel(n).locator('[class*="loading"]')).toHaveCount(0, { timeout: 20_000 });
      await expect(panel(n).locator("canvas, svg, button, input, [role=group], [tabindex]").first()).toBeAttached();
    };
    await mounted(1);

    await tabs.nth(0).focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "false");
    await expect(panel(1)).toBeHidden();
    await mounted(2);

    await page.keyboard.press("ArrowLeft");
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(tabs.nth(4)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.nth(4)).toBeFocused();
    await mounted(5);

    await page.keyboard.press("Home");
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(tabs.nth(4)).toHaveAttribute("aria-selected", "true");
    // Roving tabindex: only the selected tab is in the tab order.
    await expect(tablist.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
  });

  test("a deep link selects its experiment", async ({ page }) => {
    await gotoReady(page, "/nl/lab#lab-03");
    await expect(page.getByRole("tablist", { name: "Proeven" }).getByRole("tab").nth(2)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#lab-panel-03")).toBeVisible();
  });
});
