import { expect, gotoReady, openTerminal, run, test } from "./fixtures";

test.describe("easter eggs", () => {
  test("the Konami code shows the origami toast", async ({ page }) => {
    await gotoReady(page, "/nl");
    // The eggs load lazily (next/dynamic); their toaster region marks that the listeners are attached.
    const toasts = page.getByRole("region", { name: "Meldingen", includeHidden: true });
    await expect(toasts).toBeAttached({ timeout: 20_000 });
    const body = page.locator("body");
    for (const key of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) {
      await body.press(key);
    }
    await expect(toasts.getByText("Origami-modus ontgrendeld")).toBeVisible();
  });

  test('terminal "secret" goes to the hidden plate', async ({ page }) => {
    await gotoReady(page, "/nl");
    const { dialog, input } = await openTerminal(page);
    await run(input, "secret");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/nl\/geheim$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Het verborgen blad");
  });
});
