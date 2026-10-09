import { LAB_SLUGS, PAGES, SERVICE_SLUGS, SLUGS, expect, gotoReady, test, trackErrors, walkPage } from "./fixtures";

const LANGS = ["nl", "en"] as const;
const ALL_PATHS = LANGS.flatMap((lang) => [
  ...PAGES.map((p) => `/${lang}${p}`),
  ...SLUGS.map((slug) => `/${lang}/werk/${slug}`),
  ...LAB_SLUGS.map((slug) => `/${lang}/lab/${slug}`),
  ...SERVICE_SLUGS.map((slug) => `/${lang}/diensten/${slug}`),
]);

test.describe("smoke: routes", () => {
  for (const path of ALL_PATHS) {
    test(`${path} returns 200`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/html");
    });
  }

  for (const slug of LAB_SLUGS) {
    test(`/nl/werk/${slug} moved permanently to the lab`, async ({ request }) => {
      const response = await request.get(`/nl/werk/${slug}`, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      expect(new URL(response.headers()["location"], "http://x").pathname).toBe(`/nl/lab/${slug}`);
    });
  }

  for (const slug of ["capcraft", "paletteforge"]) {
    test(`/nl/werk/${slug} is gone (404)`, async ({ request }) => {
      const response = await request.get(`/nl/werk/${slug}`, { maxRedirects: 0 });
      expect(response.status()).toBe(404);
    });
  }

  test("an unknown page returns 404", async ({ request }) => {
    const response = await request.get("/nl/bestaat-niet", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });

  test("/ redirects permanently to /nl", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0, headers: { "accept-language": "nl-NL,nl;q=0.9" } });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers()["location"], "http://x").pathname).toBe("/nl");
  });

  test("/ redirects to /nl for an English browser too, so the redirect can be cached", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0, headers: { "accept-language": "en-GB,en;q=0.9" } });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers()["location"], "http://x").pathname).toBe("/nl");
  });

  test("/api/ask no longer exists (404)", async ({ request }) => {
    expect((await request.get("/api/ask")).status()).toBe(404);
    const post = await request.post("/api/ask", { data: { question: "Hoi", lang: "nl" } });
    expect(post.status()).toBe(404);
  });

  test("robots, sitemap, manifest and icons load", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toMatch(/sitemap/i);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain("<urlset");
    expect(xml).toContain("/nl/over");
    expect(xml).not.toMatch(/capcraft|paletteforge/i);

    const manifest = await request.get("/manifest.webmanifest");
    expect(manifest.status()).toBe(200);
    const parsed = (await manifest.json()) as { name?: string; icons?: unknown[] };
    expect(parsed.name).toBeTruthy();
    expect(parsed.icons?.length).toBeGreaterThan(0);

    const icon = await request.get("/icon.svg");
    expect(icon.status()).toBe(200);
    expect(icon.headers()["content-type"]).toContain("image/svg+xml");

    const apple = await request.get("/apple-icon");
    expect(apple.status()).toBe(200);
    expect(apple.headers()["content-type"]).toContain("image/png");
  });

  for (const lang of LANGS) {
    test(`portfolio PDF (${lang}) loads`, async ({ request }) => {
      const pdf = await request.get(`/portfolio-pim-${lang}.pdf`);
      expect(pdf.status()).toBe(200);
      expect(pdf.headers()["content-type"]).toContain("application/pdf");
      expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
    });
  }
});

test.describe("smoke: headers", () => {
  test("pages carry a nonce CSP and the nonce is on the scripts", async ({ request }) => {
    const response = await request.get("/nl/over");
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
    // Inline scripts (no src) only run with the nonce.
    const inlineWithout = scripts.filter((tag) => !/\ssrc=/.test(tag) && !tag.includes(`nonce="${nonce}"`) && !/type="application\/(ld\+)?json"/.test(tag));
    expect(inlineWithout).toEqual([]);
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
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});

test.describe("smoke: no console errors", () => {
  for (const path of ALL_PATHS) {
    test(`${path} loads without console errors or page errors`, async ({ page }) => {
      const problems = trackErrors(page);

      await gotoReady(page, path);
      await expect(page.locator("h1").first()).toBeVisible();
      await walkPage(page);
      await page.waitForLoadState("networkidle");
      expect(problems).toEqual([]);
    });
  }
});
