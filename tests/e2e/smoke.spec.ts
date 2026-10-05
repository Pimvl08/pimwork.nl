import { expect, gotoReady, test } from "./fixtures";

const SLUGS = [
  "teamsync",
  "strength-tracker",
  "belhulp",
  "capcraft",
  "kdp-kleurboek",
  "solana-forensics",
  "offerte-pdf-generator",
  "paletteforge",
];

test.describe("smoke: routes", () => {
  const ok = ["/nl", "/en", ...SLUGS.map((slug) => `/nl/werk/${slug}`), "/en/werk/teamsync", "/nl/geheim"];

  for (const path of ok) {
    test(`${path} returns 200`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/html");
    });
  }

  test("an unknown page returns 404", async ({ request }) => {
    const response = await request.get("/nl/xyz", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });

  test("an unknown project returns 404", async ({ request }) => {
    const response = await request.get("/nl/werk/bestaat-niet", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });

  test("/ redirects to /nl by default", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0, headers: { "accept-language": "nl-NL,nl;q=0.9" } });
    expect([307, 308]).toContain(response.status());
    expect(new URL(response.headers()["location"], "http://x").pathname).toBe("/nl");
  });

  test("/ redirects to /en for an English browser", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0, headers: { "accept-language": "en-GB,en;q=0.9" } });
    expect([307, 308]).toContain(response.status());
    expect(new URL(response.headers()["location"], "http://x").pathname).toBe("/en");
  });

  test("robots, sitemap, manifest and icon load", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toMatch(/sitemap/i);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");

    const manifest = await request.get("/manifest.webmanifest");
    expect(manifest.status()).toBe(200);
    const parsed = (await manifest.json()) as { name?: string; icons?: unknown[] };
    expect(parsed.name).toBeTruthy();

    const icon = await request.get("/icon.svg");
    expect(icon.status()).toBe(200);
    expect(icon.headers()["content-type"]).toContain("image/svg+xml");
  });
});

test.describe("smoke: headers", () => {
  test("pages carry a nonce CSP and the nonce is on the scripts", async ({ request }) => {
    const response = await request.get("/nl");
    const csp = response.headers()["content-security-policy"];
    expect(csp, "content-security-policy header").toBeTruthy();
    const match = csp.match(/'nonce-([^']+)'/);
    expect(match, "nonce in script-src").not.toBeNull();
    const nonce = match![1];
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");

    const html = await response.text();
    const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
    expect(scripts.length).toBeGreaterThan(0);
    const withNonce = scripts.filter((tag) => tag.includes(`nonce="${nonce}"`));
    expect(withNonce.length, "scripts with the response nonce").toBeGreaterThan(0);
    // No script may carry a different nonce than the one in the header.
    const foreign = scripts.filter((tag) => /nonce="/.test(tag) && !tag.includes(`nonce="${nonce}"`));
    expect(foreign).toEqual([]);
  });

  test("every request gets a fresh nonce", async ({ request }) => {
    const a = (await request.get("/nl")).headers()["content-security-policy"];
    const b = (await request.get("/nl")).headers()["content-security-policy"];
    expect(a.match(/'nonce-([^']+)'/)![1]).not.toBe(b.match(/'nonce-([^']+)'/)![1]);
  });

  test("security headers are present", async ({ request }) => {
    const headers = (await request.get("/nl")).headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBeTruthy();
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});

test.describe("smoke: browser", () => {
  test("/nl loads without console errors or page errors", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));

    await gotoReady(page, "/nl");
    await expect(page.locator("h1")).toBeVisible();
    // Walk the page once so lazily mounted plates (lab, media, data) load too.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 900) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await page.waitForTimeout(120);
    }
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
  });
});
