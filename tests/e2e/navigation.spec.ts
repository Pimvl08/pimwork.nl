import { expect, gotoReady, isWide, test, waitForChrome } from "./fixtures";

const NAV = [
  { name: "Werk", path: "/nl/werk", key: "1" },
  { name: "Over mij", path: "/nl/over", key: "2" },
  { name: "Lab", path: "/nl/lab", key: "3" },
  { name: "Contact", path: "/nl/contact", key: "4" },
] as const;

const urlFor = (path: string) => new RegExp(`${path.replace(/\//g, "\\/")}$`);

test.describe("header navigation (wide screens)", () => {
  test.beforeEach(({ page }) => {
    test.skip(!isWide(page), "The header menu is shown from 1024px; narrow screens use the thumb bar.");
  });

  for (const item of NAV) {
    test(`"${item.name}" goes to ${item.path} and is marked current`, async ({ page }) => {
      await gotoReady(page, "/nl");
      const nav = page.getByRole("navigation", { name: "Hoofdmenu" });
      await expect(nav).toBeVisible();
      await nav.getByRole("link", { name: item.name, exact: true }).click();
      await expect(page).toHaveURL(urlFor(item.path));
      await expect(nav.getByRole("link", { name: item.name, exact: true })).toHaveAttribute("aria-current", "page");
      // Only one link is current.
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    });
  }
});

test("the logo leads home and is current there", async ({ page }) => {
  await gotoReady(page, "/nl/over");
  const logo = page.getByRole("link", { name: "PimWork, naar de homepagina" });
  await expect(logo).not.toHaveAttribute("aria-current", "page");
  await logo.click();
  await expect(page).toHaveURL(/\/nl$/);
  await expect(logo).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 1, name: "PimWork" })).toBeVisible();
});

test.describe("keyboard shortcuts", () => {
  for (const item of NAV) {
    test(`key ${item.key} opens ${item.path}`, async ({ page }) => {
      await gotoReady(page, "/nl");
      await page.keyboard.press(item.key);
      await expect(page).toHaveURL(urlFor(item.path));
    });
  }

  test("0 goes home and ? opens the shortcut sheet", async ({ page }) => {
    await gotoReady(page, "/nl/lab");
    await page.keyboard.press("0");
    await expect(page).toHaveURL(/\/nl$/);
    await waitForChrome(page);
    await page.keyboard.press("?");
    const sheet = page.getByRole("dialog", { name: "Sneltoetsen" });
    await expect(sheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });
});

test.describe("thumb bar and menu sheet (narrow screens)", () => {
  test.beforeEach(({ page }) => {
    test.skip(isWide(page), "The thumb bar is only shown below 1024px.");
  });

  for (const item of NAV) {
    test(`bar link "${item.name}" goes to ${item.path}`, async ({ page }) => {
      await gotoReady(page, "/nl");
      const bar = page.getByRole("navigation", { name: "Pagina's" });
      await expect(bar).toBeVisible();
      await bar.getByRole("link", { name: item.name, exact: true }).click();
      await expect(page).toHaveURL(urlFor(item.path));
      await expect(bar.getByRole("link", { name: item.name, exact: true })).toHaveAttribute("aria-current", "page");
    });
  }

  test("the menu sheet is a dialog, Escape closes it and focus returns", async ({ page }) => {
    await gotoReady(page, "/nl");
    const button = page.getByRole("button", { name: "Menu openen" });
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(sheet.getByRole("button", { name: "Sluiten" })).toBeFocused();
    // Every page, home included, is in the sheet.
    for (const name of ["Home", "Werk", "Over mij", "Lab", "Contact"]) {
      await expect(sheet.getByRole("link", { name, exact: true })).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("a link in the menu sheet navigates and closes it", async ({ page }) => {
    await gotoReady(page, "/nl");
    await page.getByRole("button", { name: "Menu openen" }).click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await sheet.getByRole("link", { name: "Over mij", exact: true }).click();
    await expect(page).toHaveURL(/\/nl\/over$/);
    await expect(sheet).toBeHidden();
  });
});

test("the 404 page offers a way home", async ({ page }) => {
  const response = await page.goto("/nl/bestaat-niet");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Deze pagina bestaat niet." })).toBeVisible();
  const home = page.getByRole("main").getByRole("link", { name: /Naar de homepagina/ });
  await expect(home).toBeVisible();
  await home.click();
  // The link goes to /, which picks the language from the cookie or the browser.
  await expect(page).toHaveURL(/\/(nl|en)$/);
  await expect(page.getByRole("heading", { level: 1, name: "PimWork" })).toBeVisible();
});
