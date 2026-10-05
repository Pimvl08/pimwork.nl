import type { APIRequestContext } from "@playwright/test";
import { expect, gotoReady, originOf, test, testIp } from "./fixtures";

/** The server refuses forms submitted faster than this after render (MIN_FILL_MS + margin). */
const FILL_WAIT_MS = 3_500;

test.describe("contact form", () => {
  test("submitting empty shows field errors and an error summary", async ({ page }) => {
    await gotoReady(page, "/nl/contact");
    const form = page.getByRole("form", { name: "Contactformulier" });
    await form.getByRole("button", { name: "Verstuur" }).click();

    await expect(page.locator("#contact-summary-title")).toHaveText("3 velden vragen nog aandacht");
    await expect(page.locator("#contact-name-error")).toContainText("Vul je naam in.");
    await expect(page.locator("#contact-email-error")).toContainText("Vul je e-mailadres in.");
    await expect(page.locator("#contact-message-error")).toContainText("Schrijf een bericht.");
    for (const field of ["Naam", "E-mail", "Bericht"]) {
      await expect(form.getByLabel(field, { exact: true })).toHaveAttribute("aria-invalid", "true");
    }
    // The summary links jump to the fields.
    await expect(form.getByRole("link", { name: /Naam: Vul je naam in\./ })).toHaveAttribute("href", "#contact-name");
  });

  test("valid input shows the honest not-configured notice", async ({ page }) => {
    // Own rate-limit bucket, so reruns and the API tests never collide with this one.
    const ip = testIp();
    await page.route("**/api/contact", (route) => route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": ip } }));
    await gotoReady(page, "/nl/contact");
    const loadedAt = Date.now();
    const form = page.getByRole("form", { name: "Contactformulier" });

    await form.getByLabel("Naam", { exact: true }).fill("Testlezer");
    await form.getByLabel("E-mail", { exact: true }).fill("lezer@voorbeeld.nl");
    await form.getByLabel("Bericht", { exact: true }).fill("Een testbericht van de end-to-end suite.");

    // The timing rule: a human needs a few seconds. Wait only for what is left.
    const left = FILL_WAIT_MS - (Date.now() - loadedAt);
    if (left > 0) await page.waitForTimeout(left);

    const response = page.waitForResponse("**/api/contact");
    await form.getByRole("button", { name: "Verstuur" }).click();
    expect((await response).status()).toBe(503);

    const notice = page.getByRole("alert").filter({ hasText: "Je bericht is niet verstuurd" });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("nog niet gekoppeld");
    // The message stays in the field so nothing is lost.
    await expect(form.getByLabel("Bericht", { exact: true })).toHaveValue("Een testbericht van de end-to-end suite.");
  });
});

test.describe("contact API", () => {
  const valid = () => ({
    name: "Testlezer",
    email: "lezer@voorbeeld.nl",
    message: "Een testbericht van de end-to-end suite.",
    website: "",
    renderedAt: Date.now() - 10_000,
  });

  function post(request: APIRequestContext, init: { origin?: string; type?: string; body: string }) {
    return request.post("/api/contact", {
      headers: {
        origin: init.origin ?? originOf(test.info()),
        "content-type": init.type ?? "application/json",
        "x-forwarded-for": testIp(),
      },
      data: init.body,
    });
  }

  test("a foreign Origin is refused with 403", async ({ request }) => {
    const res = await post(request, { origin: "https://evil.example", body: JSON.stringify(valid()) });
    expect(res.status()).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
  });

  test("a wrong content type is refused with 415", async ({ request }) => {
    const res = await post(request, { type: "text/plain", body: JSON.stringify(valid()) });
    expect(res.status()).toBe(415);
  });

  test("an oversized body is refused with 413", async ({ request }) => {
    const res = await post(request, { body: JSON.stringify({ ...valid(), message: "x".repeat(9000) }) });
    expect(res.status()).toBe(413);
  });

  test("invalid fields give 400 with codes, never the input", async ({ request }) => {
    const res = await post(request, { body: JSON.stringify({ name: "", email: "geen-adres", message: "kort", renderedAt: Date.now() }) });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string; fields: Record<string, string> };
    expect(body.error).toBe("invalid");
    expect(body.fields).toMatchObject({ name: "required", email: "invalid", message: "too_short" });
    expect(JSON.stringify(body)).not.toContain("geen-adres");
  });

  test("a filled honeypot gets a quiet 200", async ({ request }) => {
    const res = await post(request, { body: JSON.stringify({ ...valid(), website: "https://spam.example" }) });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("API responses are locked down", async ({ request }) => {
    const res = await post(request, { origin: "https://evil.example", body: "{}" });
    expect(res.headers()["cache-control"]).toContain("no-store");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("GET gives 405", async ({ request }) => {
    const res = await request.get("/api/contact");
    expect(res.status()).toBe(405);
    expect(res.headers()["allow"]).toBe("POST");
  });
});
