import { expect, gotoReady, jumpTo, test } from "./fixtures";

test.describe("intro", () => {
  test('"Ontdek" opens the intro, "Sla over" closes it and focuses the about heading', async ({ page }) => {
    await gotoReady(page, "/nl");
    await page.getByRole("link", { name: "Ontdek" }).click();

    const intro = page.getByRole("dialog", { name: "Introductie" });
    await expect(intro).toBeVisible();
    const skip = intro.getByRole("button", { name: "Sla over" });
    await expect(skip).toBeFocused();
    await skip.click();

    await expect(intro).toBeHidden();
    const heading = page.locator("#about-title");
    await expect(heading).toBeFocused();
    await expect(heading).toBeInViewport();
  });

  test("Escape also skips the intro", async ({ page }) => {
    await gotoReady(page, "/nl");
    await page.getByRole("link", { name: "Ontdek" }).click();
    const intro = page.getByRole("dialog", { name: "Introductie" });
    await expect(intro).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(intro).toBeHidden();
    await expect(page.locator("#about-title")).toBeFocused();
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("the intro is skipped and the about plate is reached directly", async ({ page }) => {
      await gotoReady(page, "/nl");
      await page.getByRole("link", { name: "Ontdek" }).click();
      const heading = page.locator("#about-title");
      await expect(heading).toBeFocused();
      await expect(heading).toBeInViewport();
      await expect(page.getByRole("dialog", { name: "Introductie" })).toHaveCount(0);
    });
  });
});

test.describe("work", () => {
  test("a project row opens the project sheet, Escape closes it", async ({ page }) => {
    await gotoReady(page, "/nl");
    await jumpTo(page, "work");
    const list = page.getByRole("list", { name: "Projecten" });
    await expect(list.getByRole("listitem")).toHaveCount(8);

    await list.getByRole("link", { name: /TeamSync/ }).click();
    const sheet = page.getByRole("dialog", { name: /TeamSync/ });
    await expect(sheet).toBeVisible();
    await expect(page).toHaveURL(/\/nl\/werk\/teamsync$/);
    await expect(sheet.getByRole("heading", { name: "Het probleem" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL(/\/nl(#work)?$/);
    await expect(page.locator("#work-title")).toBeAttached();
  });

  test("a direct visit renders the full project page", async ({ page }) => {
    const response = await gotoReady(page, "/nl/werk/belhulp");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("h1")).toContainText("Belhulp");
    for (const name of ["Het probleem", "Wat het doet", "Hoe het werkt", "Gereedschap", "Links"]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("navigation", { name: "Andere projecten" })).toBeVisible();
    await expect(page).toHaveTitle(/Belhulp/);
  });
});
