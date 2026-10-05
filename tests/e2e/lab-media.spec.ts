import { expect, gotoReady, jumpTo, test } from "./fixtures";

test.describe("lab", () => {
  test("tabs switch with the arrow keys and the selected panel mounts", async ({ page }) => {
    await gotoReady(page, "/nl");
    await jumpTo(page, "lab");
    const tablist = page.getByRole("tablist", { name: "Proeven" });
    const tabs = tablist.getByRole("tab");
    await expect(tabs).toHaveCount(5);

    const first = tabs.nth(0);
    const second = tabs.nth(1);
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(first).toHaveAttribute("tabindex", "0");
    await expect(second).toHaveAttribute("tabindex", "-1");

    // The first experiment mounts once the stage is near the viewport.
    const panel1 = page.locator("#lab-panel-01");
    await expect(panel1).toBeVisible();
    await expect(panel1.locator("canvas").first()).toBeAttached({ timeout: 15_000 });

    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expect(second).toBeFocused();
    await expect(first).toHaveAttribute("aria-selected", "false");
    await expect(panel1).toBeHidden();

    const panel2 = page.locator("#lab-panel-02");
    await expect(panel2).toBeVisible();
    await expect(panel2).toHaveAttribute("aria-labelledby", "lab-02");
    // Mounted: the experiment replaced the lazy-load placeholder with its own surface.
    await expect(panel2.locator('[role="status"]')).toHaveCount(0, { timeout: 15_000 });
    await expect(panel2).not.toContainText("De proef start zodra je hier bent");
    await expect(panel2.locator("*").first()).toBeVisible();

    // Wraps around: Home goes to the first, End to the last.
    await page.keyboard.press("End");
    await expect(tabs.nth(4)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(page).toHaveURL(/#lab-01$/);
  });
});

test.describe("media", () => {
  test("a gallery image opens the lightbox, ArrowRight moves on, Escape closes", async ({ page }) => {
    await gotoReady(page, "/nl");
    await jumpTo(page, "media");
    const trigger = page.locator("#media figure button[aria-haspopup='dialog']").first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const lightbox = page.getByRole("dialog", { name: "Beeldweergave" });
    await expect(lightbox).toBeVisible();
    const counter = lightbox.getByText(/^\d+ \/ \d+$/);
    await expect(counter).toHaveText(/^1 \/ \d+$/);

    await page.keyboard.press("ArrowRight");
    await expect(counter).toHaveText(/^2 \/ \d+$/);
    await page.keyboard.press("ArrowLeft");
    await expect(counter).toHaveText(/^1 \/ \d+$/);

    await page.keyboard.press("Escape");
    await expect(lightbox).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("the video player has a play control and a position slider", async ({ page }) => {
    await gotoReady(page, "/nl");
    await jumpTo(page, "media");
    const player = page.getByRole("group", { name: /^Videospeler: / }).first();
    await player.scrollIntoViewIfNeeded();
    await expect(player).toBeVisible();
    await expect(player.getByRole("button", { name: "Afspelen" }).first()).toBeAttached();
    const slider = player.getByRole("slider", { name: "Afspeelpositie" });
    await expect(slider).toBeAttached();
    await expect(slider).toHaveAttribute("aria-valuemin", "0");
    await expect(slider).toHaveAttribute("aria-valuetext", /van/);
    await expect(player.locator("video")).toHaveAttribute("poster", /\/media\//);
  });
});
