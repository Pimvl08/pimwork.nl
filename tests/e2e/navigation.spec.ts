import { expect, gotoReady, test } from "./fixtures";

test.describe("navigation: desktop", () => {
  test.skip(({ isMobile }) => isMobile, "header nav and plate rail only show from 1024px with a fine pointer");

  test("header nav scrolls to the plate and focuses its heading", async ({ page }) => {
    await gotoReady(page, "/nl");
    const nav = page.getByRole("navigation", { name: "Hoofdmenu" });
    await expect(nav).toBeVisible();

    await nav.getByRole("link", { name: "Lab" }).click();
    const heading = page.locator("#lab-title");
    await expect(heading).toBeInViewport();
    await expect(heading).toBeFocused();
    await expect(page).toHaveURL(/\/nl#lab$/);
  });

  test("plate rail scrolls to the plate and marks it current", async ({ page }) => {
    await gotoReady(page, "/nl");
    const rail = page.getByRole("navigation", { name: "Platen" });
    await expect(rail).toBeVisible();

    const link = rail.getByRole("link", { name: "05 Data" });
    await link.click();
    await expect(page.locator("#data-title")).toBeInViewport();
    await expect(link).toHaveAttribute("aria-current", "location");
  });
});

test.describe("navigation: keyboard", () => {
  test('the "2" key jumps to the work plate', async ({ page }) => {
    await gotoReady(page, "/nl");
    await page.locator("body").press("2");
    await expect(page.locator("#work-title")).toBeInViewport();
    await expect(page).toHaveURL(/#work$/);
  });

  test('"?" opens the shortcut sheet and Escape closes it', async ({ page }) => {
    await gotoReady(page, "/nl");
    await page.locator("body").press("?");
    const sheet = page.getByRole("dialog", { name: "Sneltoetsen" });
    await expect(sheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });
});

test.describe("navigation: mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "the menu button lives in the thumb bar below 1024px");

  test("opens as a dialog, lists the plates, closes with Escape and returns focus", async ({ page }) => {
    await gotoReady(page, "/nl");
    const trigger = page.getByRole("button", { name: "Menu openen" });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Alle platen" });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const links = dialog.getByRole("navigation", { name: "Platen" }).getByRole("link");
    await expect(links).toHaveCount(8);
    await expect(links.first()).toContainText("Omslag");
    await expect(links.last()).toContainText("Contact");
    await expect(dialog.getByRole("button", { name: "Menu sluiten" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("choosing a plate closes the menu and scrolls to it", async ({ page }) => {
    await gotoReady(page, "/nl");
    await page.getByRole("button", { name: "Menu openen" }).click();
    const dialog = page.getByRole("dialog", { name: "Alle platen" });
    await dialog.getByRole("link", { name: /Contact/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator("#contact-title")).toBeInViewport();
  });
});
