import { test as base, expect, type Locator, type Page, type TestInfo } from "@playwright/test";

/**
 * Shared helpers for the end-to-end suite of the multi-page site.
 *
 * Hydration signal: the command palette (TerminalHost) and the easter eggs
 * (Toaster) are client-only dynamic components that render a closed
 * <dialog> and a manual popover once the chrome has hydrated and its lazy
 * chunks loaded. When both exist, every client effect of the chrome (global
 * keyboard shortcuts included) has run.
 */

export const test = base.extend({
  page: async ({ page }, provide) => {
    // `next dev` only: its overlay badge sits bottom-left over the thumb bar and
    // swallows clicks. Hidden through the CSSOM (not subject to the CSP); a
    // production build has no overlay, so this does nothing there.
    await page.addInitScript(() => {
      const hide = () =>
        document.querySelectorAll<HTMLElement>("nextjs-portal").forEach((el) => el.style.setProperty("display", "none", "important"));
      new MutationObserver(hide).observe(document, { childList: true, subtree: true });
    });
    await provide(page);
  },
});
export { expect };

/** Collects console errors and page errors from now on. */
export function trackErrors(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text().slice(0, 300)}`);
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

/** The six projects that belong on the site (CapCraft and PaletteForge are gone). */
export const SLUGS = ["exact-online", "teamsync", "offerte-pdf-generator", "wordpress-koppeling", "strength-tracker", "belhulp", "kdp-kleurboek", "solana-forensics"] as const;

/** Every page path below /<lang> (home is the empty path). */
export const PAGES = ["", "/werk", "/over", "/lab", "/contact"] as const;

/** The header navigation is shown from 64rem (1024px); below it the thumb bar takes over. */
export function isWide(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) >= 1024;
}

/** Navigates and waits until the client chrome has hydrated. */
export async function gotoReady(page: Page, path: string) {
  const response = await page.goto(path);
  await waitForChrome(page);
  return response;
}

/** Waits for the hydrated chrome (after a goto or a client navigation). */
export async function waitForChrome(page: Page) {
  await page.waitForFunction(
    () => document.querySelector("dialog[aria-labelledby][aria-describedby]") !== null && document.querySelector("section[popover]") !== null,
    undefined,
    { timeout: 30_000 },
  );
}

/** The one visible match among duplicated controls (desktop header vs mobile sheet). */
export function visible(locator: Locator): Locator {
  return locator.filter({ visible: true }).first();
}

/** Walks the page top to bottom so scroll-mounted content loads, then returns to the top. */
export async function walkPage(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(400, (page.viewportSize()?.height ?? 800) - 100);
  for (let y = 0; y < height; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

/** Opens the command palette with Ctrl+K (Cmd+K on macOS). */
export async function openPalette(page: Page): Promise<Locator> {
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "Snel naar" });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Opens the palette and switches to its terminal tab. */
export async function openTerminal(page: Page): Promise<{ dialog: Locator; input: Locator; log: Locator }> {
  const dialog = await openPalette(page);
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

/** The origin of the server under test (for same-origin API calls). */
export function originOf(info: TestInfo): string {
  return new URL(info.project.use.baseURL ?? "http://localhost:3100").origin;
}
