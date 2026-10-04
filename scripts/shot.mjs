#!/usr/bin/env node
/**
 * Screenshot helper for visual QA (uses the installed Google Chrome).
 *
 *   node scripts/shot.mjs --url http://localhost:3100/nl --out shot.png
 *     [--width 1440] [--height 900] [--theme dark|light] [--reduced]
 *     [--selector "#lab"] [--full] [--wait 1500] [--mobile] [--click "selector"]
 *
 * Prints console errors and failed requests so problems are visible too.
 */
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const get = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const has = (name) => args.includes(`--${name}`);

const url = get("url", "http://localhost:3100/nl");
const out = get("out", "shot.png");
const mobile = has("mobile");
const width = Number(get("width", mobile ? 390 : 1440));
const height = Number(get("height", mobile ? 844 : 900));
const theme = get("theme", "dark");
const selector = get("selector", null);
const wait = Number(get("wait", 1200));
const click = get("click", null);

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: mobile ? 2 : 1,
  isMobile: mobile,
  hasTouch: mobile,
  reducedMotion: has("reduced") ? "reduce" : "no-preference",
  colorScheme: theme === "light" ? "light" : "dark",
});
await context.addCookies([{ name: "pim-theme", value: theme, url: new URL(url).origin }]);
// Skip the first-visit preloader and intro during QA unless asked for.
if (!has("intro")) await context.addInitScript(() => { try { sessionStorage.setItem("pim-preloaded", "1"); } catch {} });
const page = await context.newPage();
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log(`[console.${m.type()}] ${m.text()}`); });
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => console.log(`[requestfailed] ${r.url()} ${r.failure()?.errorText ?? ""}`));
await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
if (selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: "start" }), selector);
}
if (click) await page.locator(click).first().click();
await page.waitForTimeout(wait);
await page.screenshot({ path: out, fullPage: has("full") });
console.log(`saved ${out} (${width}x${height}, ${theme})`);
await browser.close();
