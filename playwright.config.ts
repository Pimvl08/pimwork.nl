import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a production build (next build && next start)
 * so the strict CSP with nonces is exercised exactly as it ships.
 * Uses the installed Google Chrome, no browser download needed.
 */
const PORT = Number(process.env.E2E_PORT ?? 3200);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 } } },
    { name: "laptop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1280, height: 720 } } },
    { name: "tablet", use: { ...devices["iPad Mini"], browserName: "chromium", channel: "chrome" } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run start -- --port ${PORT}`,
        url: `${baseURL}/nl`,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
