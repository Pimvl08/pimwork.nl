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
import { buildContactEmail, contactSubject, formatSentAt, mailConfig, missingMailSettings, sendContactMail, type MailSender } from "@/lib/mail";

const valid = { name: "Sanne", email: "sanne@example.com", message: "Hallo Pim, mooi project!" };

describe("contact schema", () => {
  it("accepts valid fields and trims them", () => {
    expect(validateContactFields({ name: "  Sanne ", email: " sanne@example.com", message: valid.message })).toEqual({});
  });

  it("returns one short code per field, never the input", () => {
    expect(validateContactFields({ name: "", email: "", message: "" })).toEqual({ name: "required", email: "required", message: "required" });
    expect(validateContactFields({ name: "x".repeat(CONTACT_LIMITS.name.max), email: valid.email, message: valid.message })).toEqual({});
    expect(validateContactFields({ name: "x".repeat(101), email: "geen-adres", message: "kort" })).toEqual({
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
  const config = { apiKey: "re_test", to: "pim@example.com", from: "PimWork <contact@example.com>" };

  it("needs all three settings and names the missing ones, never their values", () => {
    expect(mailConfig({ RESEND_API_KEY: "k", CONTACT_TO_EMAIL: "t@x.nl" })).toBeNull();
    expect(missingMailSettings({ RESEND_API_KEY: "k", CONTACT_TO_EMAIL: "  " })).toEqual(["CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"]);
    expect(mailConfig({ RESEND_API_KEY: "k", CONTACT_TO_EMAIL: "t@x.nl", CONTACT_FROM_EMAIL: "f@x.nl" })).toEqual({ apiKey: "k", to: "t@x.nl", from: "f@x.nl" });
  });

  it("puts the name in the subject, replies to the visitor and adds the time", () => {
    const sentAt = new Date("2026-10-06T18:41:00Z");
    const mail = buildContactEmail(valid, config, sentAt);
    expect(mail.subject).toBe("Nieuw bericht via pimwork.nl van Sanne");
    expect(mail.replyTo).toBe(valid.email);
    expect(mail.to).toEqual(["pim@example.com"]);
    expect(mail.from).toBe(config.from);
    expect(formatSentAt(sentAt)).toBe("6 oktober 2026 om 20:41");
    expect(mail.text).toContain("Naam: Sanne");
    expect(mail.text).toContain("E-mail: sanne@example.com");
    expect(mail.text).toContain("Verstuurd: 6 oktober 2026 om 20:41");
    expect(mail.text).toContain(valid.message);
    expect(mail.html).toContain("6 oktober 2026 om 20:41");
  });

  it("escapes every visitor value in the HTML and keeps the subject on one line", () => {
    const mail = buildContactEmail({ name: "<b>Eve</b>", email: "eve@example.com", message: "<script>x</script> & 'q'" }, config);
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("<b>Eve");
    expect(mail.html).toContain("&lt;script&gt;x&lt;/script&gt; &amp; &#39;q&#39;");
    expect(contactSubject("Eve\r\nBcc: x@y.nl")).toBe("Nieuw bericht via pimwork.nl van Eve Bcc: x@y.nl");
    expect(contactSubject("x".repeat(500)).length).toBeLessThanOrEqual(34 + CONTACT_LIMITS.name.max);
  });

  it("sends through the Resend client and reports failures without throwing", async () => {
    const send = vi.fn<MailSender["emails"]["send"]>(async () => ({ error: null }));
    expect(await sendContactMail(valid, config, { emails: { send } })).toEqual({ ok: true });
    expect(send.mock.calls[0][0]).toMatchObject({ to: ["pim@example.com"], replyTo: valid.email, subject: "Nieuw bericht via pimwork.nl van Sanne" });

    const refused: MailSender = { emails: { send: async () => ({ error: { statusCode: 403, name: "validation_error" } }) } };
    expect(await sendContactMail(valid, config, refused)).toEqual({ ok: false, status: 403, reason: "validation_error" });
    const offline: MailSender = {
      emails: {
        send: async () => {
          throw new TypeError("fetch failed");
        },
      },
    };
    expect(await sendContactMail(valid, config, offline)).toEqual({ ok: false, status: 0, reason: "network" });
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

  const configure = () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_TO_EMAIL", "pim@example.com");
    vi.stubEnv("CONTACT_FROM_EMAIL", "PimWork <contact@example.com>");
  };

  it("silently drops a filled honeypot without sending", async () => {
    configure();
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const res = await POST(request({ ...fresh(), website: "https://spam.example" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("treats a form sent within 3 seconds as a bot: a quiet 200, nothing sent", async () => {
    configure();
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const fast = await POST(request({ ...fresh(), renderedAt: Date.now() - 500 }));
    expect(fast.status).toBe(200);
    expect(await fast.json()).toEqual({ ok: true });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("refuses a form that has been open for more than a day", async () => {
    const old = await POST(request({ ...fresh(), renderedAt: Date.now() - MAX_FORM_AGE_MS - 60_000 }));
    expect(old.status).toBe(400);
    expect(await old.json()).toEqual({ error: "expired" });
  });

  it("answers 500 and logs which setting is missing when mail is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("CONTACT_TO_EMAIL", "pim@example.com");
    vi.stubEnv("CONTACT_FROM_EMAIL", "PimWork <contact@example.com>");
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(request(fresh()));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "server_error" });
    const logged = errors.mock.calls.flat().join(" ");
    expect(logged).toContain("RESEND_API_KEY");
    expect(logged).not.toContain("pim@example.com");
    errors.mockRestore();
  });

  it("sends through Resend when configured, and maps provider failure to 500", async () => {
    configure();
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ id: "test" }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetcher);
    const res = await POST(request(fresh()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(String(url)).toBe("https://api.resend.com/emails");
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer re_test");
    const payload = JSON.parse(String(init.body));
    expect(payload).toMatchObject({
      to: ["pim@example.com"],
      from: "PimWork <contact@example.com>",
      reply_to: valid.email,
      subject: "Nieuw bericht via pimwork.nl van Sanne",
    });

    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ name: "application_error", message: "boom", statusCode: 500 }), { status: 500, headers: { "content-type": "application/json" } })),
    );
    const failed = await POST(request(fresh()));
    expect(failed.status).toBe(500);
    expect(await failed.json()).toEqual({ error: "server_error" });
    const logged = errors.mock.calls.flat().join(" ");
    expect(logged).not.toContain(valid.email);
    expect(logged).not.toContain(valid.message);
    expect(logged).not.toContain(valid.name);
    errors.mockRestore();
  });

  it("rate limits after 5 requests from one client with a retry-after header", async () => {
    const addr = "192.0.2.77";
    for (let i = 0; i < 5; i++) {
      const res = await POST(request({ ...fresh(), website: "bot" }, { addr }));
      expect(res.status).toBe(200);
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
  it("shows the form with phone and email beside it, in both languages", async () => {
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
      expect(html).toContain(contactCopy.alt.heading[lang]);
      expect(html).toContain(contactCopy.alt.body[lang]);
      expect(html).toContain(`href="${person.phone.href}"`);
      expect(html).toContain(`href="mailto:${person.email}"`);
      expect(html).toContain("<form");
      expect(html).not.toContain("numeral");
      expect(html).not.toMatch(new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`));
    }
  });
});
