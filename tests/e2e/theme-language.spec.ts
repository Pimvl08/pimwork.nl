import { expect, gotoReady, isWide, test, trackErrors, visible } from "./fixtures";
import type { Page } from "@playwright/test";

/** The visible theme toggle: in the header on wide screens, in the menu sheet on narrow ones. */
async function themeToggle(page: Page) {
  if (!isWide(page)) {
    await page.getByRole("button", { name: "Menu openen" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
  }
  return visible(page.getByRole("button", { name: /^(Licht|Donker) thema$/ }));
}

test("the theme toggle flips the paper, sets the cookie and survives a reload", async ({ page, context }) => {
  await gotoReady(page, "/nl");
  const html = page.locator("html");
  const before = await html.getAttribute("data-theme");
  expect(["dark", "light"]).toContain(before);
  const after = before === "dark" ? "light" : "dark";

  const toggle = await themeToggle(page);
  await expect(toggle).toHaveAccessibleName(before === "dark" ? "Licht thema" : "Donker thema");
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", after);
  await expect(toggle).toHaveAccessibleName(after === "dark" ? "Licht thema" : "Donker thema");

  await expect.poll(async () => (await context.cookies()).find((c) => c.name === "pim-theme")?.value).toBe(after);

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", after);
});

test("the language switch keeps the page and sets html lang", async ({ page }) => {
  await gotoReady(page, "/nl/over");
  await expect(page.locator("html")).toHaveAttribute("lang", "nl-NL");
  const group = visible(page.getByRole("group", { name: "Taal" }));
  await expect(group.getByRole("link", { name: /NL/ })).toHaveAttribute("aria-current", "true");
  await group.getByRole("link", { name: /EN/ }).click();
  await expect(page).toHaveURL(/\/en\/over$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
  await expect(page.getByRole("heading", { level: 1, name: "About me" })).toBeVisible();
});

test("the language switch on a project page keeps the project", async ({ page }) => {
  const problems = trackErrors(page);
  await gotoReady(page, "/nl/werk/teamsync");
  await visible(page.getByRole("group", { name: "Taal" })).getByRole("link", { name: /EN/ }).click();
  await expect(page).toHaveURL(/\/en\/werk\/teamsync$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
  await expect(page.getByRole("heading", { name: "The problem" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Het probleem" })).toHaveCount(0);
  expect(problems).toEqual([]);
});
