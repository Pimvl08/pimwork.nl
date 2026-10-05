import { test as base, expect, type Locator, type Page } from "@playwright/test";

/**
 * Shared helpers for the end-to-end suite.
 *
 * Hydration signal: the Preloader dispatches `pim:preloaded` on window from a
 * client effect, so the event only fires once the chrome has hydrated. An
 * init script records it as `window.__pimReady`. The same script marks the
 * preloader as already seen for this session, so the first-visit overlay
 * never covers the page under test (the preloader itself is not under test).
 */

declare global {
  interface Window {
    __pimReady?: boolean;
  }
}

export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addInitScript(() => {
      try {
        window.sessionStorage.setItem("pim-preloaded", "1");
      } catch {
        // Storage blocked: the preloader then skips itself anyway.
      }
      window.addEventListener("pim:preloaded", () => {
        window.__pimReady = true;
      });
    });
    await provide(page);
  },
});

export { expect };

/** Navigates and waits until the client chrome has hydrated. */
export async function gotoReady(page: Page, path: string) {
  const response = await page.goto(path);
  await page.waitForFunction(() => window.__pimReady === true, undefined, { timeout: 20_000 });
  return response;
}

/** The one visible match among duplicated controls (desktop header vs mobile pill bar). */
export function visible(locator: Locator): Locator {
  return locator.filter({ visible: true }).first();
}

/** Scrolls a plate into view without smooth scrolling, so lazy content mounts. */
export async function jumpTo(page: Page, id: string) {
  await page.evaluate((target) => {
    document.getElementById(target)?.scrollIntoView({ block: "start", behavior: "instant" });
  }, id);
  await expect(page.locator(`#${id}`)).toBeInViewport();
}

/** Opens the global terminal with Ctrl+K (Cmd+K on macOS) and switches to the terminal tab. */
export async function openTerminal(page: Page): Promise<{ dialog: Locator; input: Locator; log: Locator }> {
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "Terminal" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("tab", { name: "Terminal" }).click();
  const input = dialog.getByRole("textbox", { name: "Commando" });
  await expect(input).toBeFocused();
  const log = dialog.getByRole("log", { name: "Uitvoer van de terminal" });
  return { dialog, input, log };
}

/** Types one command into the terminal input and runs it. */
export async function run(input: Locator, command: string) {
  await input.fill(command);
  await input.press("Enter");
}

/** A random private address, so each API test gets its own rate-limit bucket. */
export function testIp(): string {
  const n = () => Math.floor(Math.random() * 250) + 1;
  return `10.${n()}.${n()}.${n()}`;
}
