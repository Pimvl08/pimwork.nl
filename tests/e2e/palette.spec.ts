import { expect, gotoReady, openPalette, openTerminal, run, test } from "./fixtures";

test.describe("command palette", () => {
  test("Ctrl/Cmd+K opens it, Escape closes it and focus returns", async ({ page }) => {
    await gotoReady(page, "/nl");
    const dialog = await openPalette(page);
    await expect(dialog.getByRole("combobox", { name: "Zoek pagina's, projecten en commando's" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("choosing a page in the search goes there", async ({ page }) => {
    await gotoReady(page, "/nl");
    const dialog = await openPalette(page);
    await dialog.getByRole("combobox").fill("lab");
    const option = dialog.getByRole("option").filter({ hasText: "Pagina" }).filter({ hasText: "Lab" }).first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(page).toHaveURL(/\/nl\/lab$/);
    await expect(dialog).toBeHidden();
  });

  test("help lists the commands, without ask or AI", async ({ page }) => {
    await gotoReady(page, "/nl");
    const { log, input } = await openTerminal(page);
    await run(input, "help");
    for (const command of ["projects", "open", "goto", "theme", "lang", "echo", "secret"]) {
      await expect(log).toContainText(command);
    }
    const text = await log.innerText();
    expect(text).not.toMatch(/\bask\b/i);
    expect(text).not.toMatch(/\bAI\b/);
  });

  test("goto over navigates to the about page", async ({ page }) => {
    await gotoReady(page, "/nl");
    const { dialog, input } = await openTerminal(page);
    await run(input, "goto over");
    await expect(page).toHaveURL(/\/nl\/over$/);
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("heading", { level: 1, name: "Over mij" })).toBeVisible();
  });

  test("an unknown command suggests the closest one", async ({ page }) => {
    await gotoReady(page, "/nl");
    const { log, input } = await openTerminal(page);
    await run(input, "hepl");
    await expect(log).toContainText("Onbekend commando: hepl.");
    await expect(log).toContainText("Bedoelde je help?");
  });

  test("ask is not a command", async ({ page }) => {
    await gotoReady(page, "/nl");
    const { dialog, log, input } = await openTerminal(page);
    await run(input, "ask wat bouw je?");
    await expect(log).toContainText("Onbekend commando: ask.");
    // Nor is there anything to ask in the palette.
    await dialog.getByRole("tab", { name: "Zoeken" }).click();
    await dialog.getByRole("combobox").fill("ask");
    await expect(dialog.getByRole("option", { name: /^Commando\s*ask\b/ })).toHaveCount(0);
  });

  test("echo renders markup as text and creates no element", async ({ page }) => {
    let alerted = false;
    page.on("dialog", async (d) => {
      alerted = true;
      await d.dismiss();
    });
    await gotoReady(page, "/nl");
    const { dialog, log, input } = await openTerminal(page);
    const payload = "<img src=x onerror=alert(1)>";
    await run(input, `echo ${payload}`);
    await expect(log).toContainText(payload);
    await expect(dialog.locator("img")).toHaveCount(0);
    await expect(page.locator('img[src="x"]')).toHaveCount(0);
    expect(alerted).toBe(false);
  });
});
