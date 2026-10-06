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

  test("a server error keeps the text and points to phone and email", async ({ page }) => {
    // Without mail settings (as in this test server) the API answers 500.
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
    expect((await response).status()).toBe(500);

    const notice = page.getByRole("alert").filter({ hasText: "Je bericht is niet verstuurd" });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("bel of mail me");
    await expect(notice.getByRole("link", { name: "Bel me" })).toHaveAttribute("href", /^tel:/);
    await expect(notice.getByRole("link", { name: "Mail me" })).toHaveAttribute("href", /^mailto:/);
    // The message stays in the field so nothing is lost.
    await expect(form.getByLabel("Bericht", { exact: true })).toHaveValue("Een testbericht van de end-to-end suite.");
  });

  test("a sent message shows the thanks, and the form comes back empty", async ({ page }) => {
    let sentAfter = 0;
    let loadedAt = 0;
    await page.route("**/api/contact", async (route) => {
      sentAfter = Date.now() - loadedAt;
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    // The server counts from its render, the form from when it appeared: both
    // are after this moment, so the request must come at least 3 s after it.
    loadedAt = Date.now();
    await gotoReady(page, "/nl/contact");
    const form = page.getByRole("form", { name: "Contactformulier" });
    await form.getByLabel("Naam", { exact: true }).fill("Testlezer");
    await form.getByLabel("E-mail", { exact: true }).fill("lezer@voorbeeld.nl");
    await form.getByLabel("Bericht", { exact: true }).fill("Een testbericht van de end-to-end suite.");

    // Sent right away: the form itself waits until a person could have typed it.
    const button = form.getByRole("button", { name: /Verstuur|Bezig met versturen/ });
    await button.click();
    await expect(button).toBeDisabled();
    await expect(button).toContainText("Bezig met versturen");

    const thanks = page.getByRole("status").filter({ hasText: "Bedankt, je bericht is verstuurd" });
    await expect(thanks).toBeVisible();
    await expect(thanks).toContainText("Ik reageer zo snel mogelijk");
    expect(sentAfter).toBeGreaterThanOrEqual(3_000);

    await thanks.getByRole("button", { name: "Nog een bericht" }).click();
    const again = page.getByRole("form", { name: "Contactformulier" });
    for (const field of ["Naam", "E-mail", "Bericht"]) {
      await expect(again.getByLabel(field, { exact: true })).toHaveValue("");
    }
  });

  test("phone and email stay beside the form", async ({ page }) => {
    await gotoReady(page, "/nl/contact");
    const aside = page.getByRole("complementary", { name: "Liever zonder formulier" });
    await expect(aside).toContainText("Je kunt me ook gewoon bellen of mailen.");
    await expect(aside.getByRole("link", { name: "Bel me" })).toBeVisible();
    await expect(aside.getByRole("link", { name: "Mail me" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("verstuurt nog geen berichten");
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

  test("a form sent within 3 seconds gets a quiet 200", async ({ request }) => {
    const res = await post(request, { body: JSON.stringify({ ...valid(), renderedAt: Date.now() }) });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
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
