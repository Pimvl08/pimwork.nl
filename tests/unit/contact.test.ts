import { afterEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, POST } from "@/app/api/contact/route";
import {
  CONTACT_LIMITS,
  MAX_FORM_AGE_MS,
  MIN_FILL_MS,
  checkFormAge,
  parseContactRequest,
  validateContactFields,
} from "@/lib/contact-schema";
import { CONTACT_SUBJECT, RESEND_ENDPOINT, buildContactEmail, mailConfig, sendContactMail } from "@/lib/mail";

const valid = { name: "Sanne", email: "sanne@example.com", message: "Hallo Pim, mooi project!" };

describe("contact schema", () => {
  it("accepts valid fields and trims them", () => {
    expect(validateContactFields({ name: "  Sanne ", email: " sanne@example.com", message: valid.message })).toEqual({});
  });

  it("returns one short code per field, never the input", () => {
    expect(validateContactFields({ name: "", email: "", message: "" })).toEqual({ name: "required", email: "required", message: "required" });
    expect(validateContactFields({ name: "x".repeat(81), email: "geen-adres", message: "kort" })).toEqual({
      name: "too_long",
      email: "invalid",
      message: "too_short",
    });
    expect(validateContactFields({ ...valid, message: "x".repeat(CONTACT_LIMITS.message.max + 1) })).toEqual({ message: "too_long" });
    expect(validateContactFields({ ...valid, email: `${"a".repeat(115)}@ex.nl` })).toEqual({ email: "too_long" });
  });

  it("rejects control characters in single-line fields and odd addresses", () => {
    expect(validateContactFields({ ...valid, name: "Pim\r\nBcc: x@y.nl" })).toEqual({ name: "invalid" });
    for (const email of ["a@b", "a b@c.nl", "<a@b.nl>", "a@b.c", "a@@b.nl"]) {
      expect(validateContactFields({ ...valid, email }).email).toBe("invalid");
    }
    expect(validateContactFields({ ...valid, message: "Regel een\nregel twee\ttab" })).toEqual({});
  });

  it("parses a full request with honeypot default and render time", () => {
    const parsed = parseContactRequest({ ...valid, renderedAt: 1000 });
    expect(parsed).toEqual({ ok: true, data: { ...valid, website: "", renderedAt: 1000 } });
    const bad = parseContactRequest({ ...valid, renderedAt: "nu" });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.malformed).toBe(true);
    expect(parseContactRequest("tekst").ok).toBe(false);
  });

  it("checks the form age window", () => {
    const now = 10 * MAX_FORM_AGE_MS;
    expect(checkFormAge(now - 1000, now)).toBe("too_fast");
    expect(checkFormAge(now - MIN_FILL_MS, now)).toBe("ok");
    expect(checkFormAge(now - MAX_FORM_AGE_MS - 1, now)).toBe("expired");
  });
});

describe("mail", () => {
  const config = { apiKey: "re_test", to: "pim@example.com", from: "Site <site@example.com>" };

  it("needs all three settings", () => {
    expect(mailConfig({ RESEND_API_KEY: "k", CONTACT_TO_EMAIL: "t@x.nl" })).toBeNull();
    expect(mailConfig({ RESEND_API_KEY: "k", CONTACT_TO_EMAIL: "t@x.nl", CONTACT_FROM_EMAIL: "f@x.nl" })).toEqual({ apiKey: "k", to: "t@x.nl", from: "f@x.nl" });
  });

  it("escapes every visitor value in the HTML and keeps the subject fixed", () => {
    const mail = buildContactEmail({ name: "<b>Eve</b>", email: "eve@example.com", message: "<script>x</script> & 'q'" }, config);
    expect(mail.subject).toBe(CONTACT_SUBJECT);
    expect(mail.reply_to).toBe("eve@example.com");
    expect(mail.to).toEqual(["pim@example.com"]);
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("<b>Eve");
    expect(mail.html).toContain("&lt;script&gt;x&lt;/script&gt; &amp; &#39;q&#39;");
  });

  it("posts to Resend with a bearer token and reports failures without throwing", async () => {
    const ok = vi.fn(async () => new Response("{}", { status: 200 }));
    expect(await sendContactMail(valid, config, ok as unknown as typeof fetch)).toEqual({ ok: true });
    const [url, init] = ok.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(RESEND_ENDPOINT);
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer re_test");

    const down = vi.fn(async () => new Response("{}", { status: 500 }));
    expect(await sendContactMail(valid, config, down as unknown as typeof fetch)).toEqual({ ok: false, status: 500 });
    const offline = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    expect(await sendContactMail(valid, config, offline as unknown as typeof fetch)).toEqual({ ok: false, status: 0 });
  });
});

describe("POST /api/contact", () => {
  const ORIGIN = "http://localhost:3100";
  let ip = 0;

  /** Each request gets its own client address unless one is given, so the limiter stays out of the way. */
  function request(
    body: unknown,
    { origin = ORIGIN, type = "application/json", addr, raw }: { origin?: string | null; type?: string; addr?: string; raw?: string } = {},
  ): Request {
    const headers = new Headers({ host: "localhost:3100", "content-type": type, "x-forwarded-for": addr ?? `10.0.${Math.floor(++ip / 250)}.${ip % 250}` });
    if (origin) headers.set("origin", origin);
    return new Request(`${ORIGIN}/api/contact`, { method: "POST", headers, body: raw ?? JSON.stringify(body) });
  }

  const fresh = () => ({ ...valid, website: "", renderedAt: Date.now() - 10_000 });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("refuses other methods", async () => {
    expect(GET().status).toBe(405);
    expect(DELETE().status).toBe(405);
  });

  it("refuses a wrong or missing origin", async () => {
    expect((await POST(request(fresh(), { origin: "https://evil.example" }))).status).toBe(403);
    expect((await POST(request(fresh(), { origin: null }))).status).toBe(403);
  });

  it("refuses a wrong content type, an oversized body and broken JSON", async () => {
    expect((await POST(request(fresh(), { type: "text/plain" }))).status).toBe(415);
    expect((await POST(request({ ...fresh(), message: "x".repeat(9000) }))).status).toBe(413);
    const broken = await POST(request(null, { raw: "{nope" }));
    expect(broken.status).toBe(400);
    expect(await broken.json()).toEqual({ error: "invalid_json" });
  });

  it("returns per-field codes for invalid fields and never echoes input", async () => {
    const res = await POST(request({ ...fresh(), name: "<img src=x>\r\nBcc: a@b.nl", email: "geen", message: "kort" }));
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).not.toContain("img");
    expect(text).not.toContain("geen");
    expect(JSON.parse(text)).toEqual({ error: "invalid", fields: { name: "invalid", email: "invalid", message: "too_short" } });
  });

  it("silently drops a filled honeypot without sending", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_TO_EMAIL", "pim@example.com");
    vi.stubEnv("CONTACT_FROM_EMAIL", "site@example.com");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const res = await POST(request({ ...fresh(), website: "https://spam.example" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("refuses a form sent too fast or too late", async () => {
    const fast = await POST(request({ ...fresh(), renderedAt: Date.now() - 500 }));
    expect(fast.status).toBe(400);
    expect(await fast.json()).toEqual({ error: "too_fast" });
    const old = await POST(request({ ...fresh(), renderedAt: Date.now() - MAX_FORM_AGE_MS - 60_000 }));
    expect(old.status).toBe(400);
    expect(await old.json()).toEqual({ error: "expired" });
  });

  it("answers 503 not_configured when the mail settings are missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("CONTACT_TO_EMAIL", "");
    vi.stubEnv("CONTACT_FROM_EMAIL", "");
    const res = await POST(request(fresh()));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "not_configured" });
  });

  it("sends through Resend when configured, and maps provider failure to 502", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_TO_EMAIL", "pim@example.com");
    vi.stubEnv("CONTACT_FROM_EMAIL", "site@example.com");
    const fetcher = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    const res = await POST(request(fresh()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const payload = JSON.parse(String((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(payload).toMatchObject({ to: ["pim@example.com"], from: "site@example.com", reply_to: valid.email, subject: CONTACT_SUBJECT });

    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 500 })));
    const failed = await POST(request(fresh()));
    expect(failed.status).toBe(502);
    expect(await failed.json()).toEqual({ error: "delivery_failed" });
    const logged = errors.mock.calls.flat().join(" ");
    expect(logged).not.toContain(valid.email);
    expect(logged).not.toContain(valid.message);
  });

  it("rate limits after 5 requests from one client with a retry-after header", async () => {
    const addr = "192.0.2.77";
    for (let i = 0; i < 5; i++) {
      const res = await POST(request({ ...fresh(), renderedAt: Date.now() - 500 }, { addr }));
      expect(res.status).toBe(400);
    }
    const limited = await POST(request(fresh(), { addr }));
    expect(limited.status).toBe(429);
    const retry = Number(limited.headers.get("retry-after"));
    expect(retry).toBeGreaterThan(0);
    expect(retry).toBeLessThanOrEqual(600);
    expect(await limited.json()).toMatchObject({ error: "rate_limited" });
  });
});

describe("server render of the contact page", () => {
  it("says plainly that the form does not send yet and points to phone and email", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("CONTACT_TO_EMAIL", "");
    vi.stubEnv("CONTACT_FROM_EMAIL", "");
    vi.doMock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }), usePathname: () => "/nl/contact" }));
    const { createElement } = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { ContactPage } = await import("@/components/contact/ContactPage");
    const { contactCopy } = await import("@/components/contact/copy");
    const { person } = await import("@/content/person");
    for (const lang of ["nl", "en"] as const) {
      const html = renderToString(createElement(ContactPage, { lang, renderedAt: Date.now() }));
      expect(html.match(/<h1/g)).toHaveLength(1);
      expect(html).toContain(contactCopy.title[lang]);
      expect(html).toContain(contactCopy.offline.heading[lang]);
      expect(html).toContain(`href="${person.phone.href}"`);
      expect(html).toContain(`href="mailto:${person.email}"`);
      expect(html).toContain("<form");
      expect(html).not.toContain("numeral");
      expect(html).not.toMatch(new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`));
    }
    vi.unstubAllEnvs();
  });
});
