import { expect, gotoReady, openTerminal, run, test } from "./fixtures";

test.describe("easter eggs", () => {
  test("the Konami code shows a toast", async ({ page }) => {
    await gotoReady(page, "/nl");
    for (const key of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) {
      await page.keyboard.press(key);
    }
    const toaster = page.getByRole("region", { name: "Meldingen" });
    await expect(toaster).toContainText(/Origami/);
  });

  test("the secret command leads to the hidden page", async ({ page }) => {
    await gotoReady(page, "/nl");
    const { input } = await openTerminal(page);
    await run(input, "secret");
    await expect(page).toHaveURL(/\/nl\/geheim$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
