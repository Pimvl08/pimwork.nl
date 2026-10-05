import { expect, gotoReady, jumpTo, openTerminal, run, test, visible } from "./fixtures";

test.describe("terminal", () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, "/nl");
  });

  test("Ctrl/Cmd+K opens the terminal dialog in palette mode", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.getByRole("dialog", { name: "Terminal" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("tab", { name: "Zoeken" })).toHaveAttribute("aria-selected", "true");
    await expect(dialog.getByRole("combobox", { name: /Zoek commando/ })).toBeFocused();
    // Ctrl/Cmd+K again closes it.
    await page.keyboard.press("ControlOrMeta+k");
    await expect(dialog).toBeHidden();
  });

  test('"help" lists the commands', async ({ page }) => {
    const { input, log } = await openTerminal(page);
    await run(input, "help");
    await expect(log).toContainText("Commando's (een / ervoor mag ook):");
    for (const command of ["goto", "theme", "echo", "projects"]) {
      await expect(log).toContainText(command);
    }
  });

  test('"theme light" switches to cotton paper', async ({ page }) => {
    const { input, log } = await openTerminal(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await run(input, "theme light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(log).toContainText("Katoenpapier.");
  });

  test('"goto lab" closes the terminal and scrolls to the lab', async ({ page }) => {
    const { dialog, input } = await openTerminal(page);
    await run(input, "goto lab");
    await expect(dialog).toBeHidden();
    await expect(page.locator("#lab-title")).toBeInViewport();
    await expect(page).toHaveURL(/#lab$/);
  });

  test("an unknown command suggests the closest one", async ({ page }) => {
    const { input, log } = await openTerminal(page);
    await run(input, "thme");
    await expect(log).toContainText("Onbekend commando: thme.");
    await expect(log).toContainText("Bedoelde je theme?");
  });

  test("echo renders markup as literal text", async ({ page }) => {
    const alerts: string[] = [];
    page.on("dialog", async (dialog) => {
      alerts.push(dialog.message());
      await dialog.dismiss();
    });
    const { dialog, input, log } = await openTerminal(page);
    const payload = "<img src=x onerror=alert(1)>";
    await run(input, `echo ${payload}`);
    await expect(log).toContainText(payload);
    await expect(dialog.locator("img")).toHaveCount(0);
    await expect(page.locator('img[src="x"]')).toHaveCount(0);
    expect(alerts).toEqual([]);
  });

  test("Escape closes the terminal and focus returns to the opener", async ({ page }) => {
    const opener = visible(page.getByRole("button", { name: "Terminal openen (Ctrl K)" }));
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Terminal" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });
});

test.describe("machine plate", () => {
  test("the inline chips run commands in the plate's own terminal", async ({ page }) => {
    await gotoReady(page, "/nl");
    await jumpTo(page, "machine");
    const plate = page.locator("#machine");
    const log = plate.getByRole("log", { name: "Uitvoer van de machine" });
    const chips = plate.getByRole("group", { name: "Snelle commando's" });
    await expect(chips.getByRole("button")).toHaveCount(5);

    await chips.getByRole("button", { name: "/help" }).click();
    await expect(log).toContainText("Commando's (een / ervoor mag ook):");

    await chips.getByRole("button", { name: "/projects" }).click();
    await expect(log).toContainText("TeamSync");
    // The inline terminal never opens the global one.
    await expect(page.getByRole("dialog", { name: "Terminal" })).toBeHidden();
  });
});
