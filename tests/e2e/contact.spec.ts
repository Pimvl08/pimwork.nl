import type { APIRequestContext } from "@playwright/test";
import { expect, gotoReady, jumpTo, test, testIp } from "./fixtures";

/** The server refuses forms submitted faster than this after render (MIN_FILL_MS + margin). */
const FILL_WAIT_MS = 3_500;

test.describe("contact form", () => {
  test("submitting empty shows field errors and an error summary", async ({ page }) => {
    await gotoReady(page, "/nl");
    await jumpTo(page, "contact");
    const form = page.getByRole("form", { name: "Contactformulier" });
    await form.getByRole("button", { name: "Verstuur" }).click();

    const summaryTitle = page.locator("#contact-summary-title");
    await expect(summaryTitle).toHaveText("3 velden vragen nog aandacht");
    await expect(page.locator("#contact-name-error")).toContainText("Vul je naam in.");
    await expect(page.locator("#contact-email-error")).toContainText("Vul je e-mailadres in.");
    await expect(page.locator("#contact-message-error")).toContainText("Schrijf een bericht.");
    for (const field of ["name", "email", "message"]) {
      await expect(page.locator(`#contact-${field}`)).toHaveAttribute("aria-invalid", "true");
    }
    // The summary links jump to the fields.
    await expect(form.getByRole("link", { name: /Naam: Vul je naam in\./ })).toHaveAttribute("href", "#contact-name");
  });

  test("valid input shows the honest not-configured notice", async ({ page }) => {
    // Own rate-limit bucket, so reruns and the API tests never collide with this one.
    const ip = testIp();
    await page.route("**/api/contact", (route) =>
      route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": ip } }),
    );
    await gotoReady(page, "/nl");
    const loadedAt = Date.now();
    await jumpTo(page, "contact");

    await page.locator("#contact-name").fill("Testlezer");
    await page.locator("#contact-email").fill("lezer@voorbeeld.nl");
    await page.locator("#contact-message").fill("Een testbericht van de end-to-end suite.");

    // The timing rule: a human needs a few seconds. Wait only for what is left.
    const left = FILL_WAIT_MS - (Date.now() - loadedAt);
    if (left > 0) await page.waitForTimeout(left);

    const response = page.waitForResponse("**/api/contact");
    await page.getByRole("button", { name: "Verstuur" }).click();
    expect((await response).status()).toBe(503);

    await expect(page.getByText("Verzenden staat nog uit", { exact: true })).toBeVisible();
    await expect(page.getByText(/Je bericht is niet verstuurd/)).toBeVisible();
    // The message stays in the field so nothing is lost.
    await expect(page.locator("#contact-message")).toHaveValue("Een testbericht van de end-to-end suite.");
  });
});

test.describe("contact and ask API", () => {
  const valid = () => ({
    name: "Testlezer",
    email: "lezer@voorbeeld.nl",
    message: "Een testbericht van de end-to-end suite.",
    website: "",
    renderedAt: Date.now() - 10_000,
  });

  function post(request: APIRequestContext, url: string, init: { origin?: string; type?: string; body: string }) {
    const origin = init.origin ?? new URL(test.info().project.use.baseURL ?? "http://localhost:3100").origin;
    return request.post(url, {
      headers: {
        origin,
        "content-type": init.type ?? "application/json",
        "x-forwarded-for": testIp(),
      },
      data: init.body,
    });
  }

  test("a foreign Origin is refused with 403", async ({ request }) => {
    const res = await post(request, "/api/contact", { origin: "https://evil.example", body: JSON.stringify(valid()) });
    expect(res.status()).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
  });

  test("a wrong content type is refused with 415", async ({ request }) => {
    const res = await post(request, "/api/contact", { type: "text/plain", body: JSON.stringify(valid()) });
    expect(res.status()).toBe(415);
  });

  test("an oversized body is refused with 413", async ({ request }) => {
    const res = await post(request, "/api/contact", { body: JSON.stringify({ ...valid(), message: "x".repeat(9000) }) });
    expect(res.status()).toBe(413);
  });

  test("invalid fields give 400 with codes, never the input", async ({ request }) => {
    const res = await post(request, "/api/contact", {
      body: JSON.stringify({ name: "", email: "geen-adres", message: "kort", renderedAt: Date.now() }),
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string; fields: Record<string, string> };
    expect(body.error).toBe("invalid");
    expect(body.fields).toMatchObject({ name: "required", email: "invalid", message: "too_short" });
    expect(JSON.stringify(body)).not.toContain("geen-adres");
  });

  test("a filled honeypot gets a quiet 200", async ({ request }) => {
    const res = await post(request, "/api/contact", { body: JSON.stringify({ ...valid(), website: "https://spam.example" }) });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("API responses are locked down", async ({ request }) => {
    const res = await post(request, "/api/contact", { origin: "https://evil.example", body: "{}" });
    expect(res.headers()["cache-control"]).toContain("no-store");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("/api/ask without a key answers 503 not_configured", async ({ request }) => {
    const res = await post(request, "/api/ask", { body: JSON.stringify({ question: "Wat bouwt Pim?", lang: "nl" }) });
    expect(res.status()).toBe(503);
    expect(await res.json()).toMatchObject({ error: "not_configured" });
  });

  test("/api/ask refuses a foreign Origin", async ({ request }) => {
    const res = await post(request, "/api/ask", { origin: "https://evil.example", body: JSON.stringify({ question: "Hoi", lang: "nl" }) });
    expect(res.status()).toBe(403);
  });

  for (const url of ["/api/contact", "/api/ask"]) {
    test(`GET ${url} gives 405`, async ({ request }) => {
      const res = await request.get(url);
      expect(res.status()).toBe(405);
    });
  }
});
