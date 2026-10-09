import base from "./playwright.config";
import { defineConfig, devices } from "@playwright/test";
const launchOptions = { executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" };
export default defineConfig({
  ...base,
  reporter: [["line"]],
  use: { ...base.use, channel: undefined, launchOptions },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions } },
  ],
});
