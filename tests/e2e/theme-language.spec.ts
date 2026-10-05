import { expect, gotoReady, test, visible } from "./fixtures";

/** Client navigations on the dev server may compile the target route first. */
const NAV = { timeout: 20_000 };

test.describe("theme", () => {
  test("the toggle flips data-theme, sets the cookie and survives a reload", async ({ page, context }) => {
    await gotoReady(page, "/nl");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    const toggle = visible(page.getByRole("button", { name: "Licht thema" }));
    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(visible(page.getByRole("button", { name: "Donker thema" }))).toBeVisible();

    await expect
      .poll(async () => (await context.cookies()).find((c) => c.name === "pim-theme")?.value)
      .toBe("light");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "light");

    // And back.
    await page.waitForFunction(() => window.__pimReady === true);
    await visible(page.getByRole("button", { name: "Donker thema" })).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect
      .poll(async () => (await context.cookies()).find((c) => c.name === "pim-theme")?.value)
      .toBe("dark");
  });

  test('the "t" key toggles the theme', async ({ page }) => {
    await gotoReady(page, "/nl");
    await page.locator("body").press("t");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});

test.describe("language", () => {
  test("switching goes to /en with English headings and back to /nl", async ({ page }) => {
    await gotoReady(page, "/nl");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "nl-NL");
    await expect(page.locator("#work-title")).toContainText("Werk");

    const switcher = visible(page.getByRole("group", { name: "Taal" }));
    await switcher.getByRole("link", { name: /EN/ }).click();
    await expect(page).toHaveURL(/\/en(#.*)?$/, NAV);
    await expect(html).toHaveAttribute("lang", "en-GB", NAV);
    await expect(page.locator("#work-title")).toContainText("Work");
    await expect(page.locator("#contact-title")).toContainText("Contact");

    const back = visible(page.getByRole("group", { name: "Language" }));
    await back.getByRole("link", { name: /NL/ }).click();
    await expect(page).toHaveURL(/\/nl(#.*)?$/, NAV);
    await expect(html).toHaveAttribute("lang", "nl-NL", NAV);
    await expect(page.locator("#work-title")).toContainText("Werk");
  });

  test("the language switch keeps the project page", async ({ page }) => {
    await gotoReady(page, "/nl/werk/teamsync");
    await visible(page.getByRole("group", { name: "Taal" })).getByRole("link", { name: /EN/ }).click();
    await expect(page).toHaveURL(/\/en\/werk\/teamsync$/, NAV);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-GB", NAV);
  });
});
