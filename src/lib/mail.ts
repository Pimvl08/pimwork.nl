import type { ContactFields } from "@/lib/contact-schema";
import { escapeHtml, headerSafe, stripLineBreaks } from "@/lib/escape";

/**
 * Delivery of contact messages through the Resend HTTP API.
 * Server only: reads secrets from the environment and is imported only by
 * the API route. Nothing here logs content or addresses.
 */

export const RESEND_ENDPOINT = "https://api.resend.com/emails";
export const CONTACT_SUBJECT = "Bericht via de site van Pim";
const TIMEOUT_MS = 10_000;

export interface MailConfig {
  apiKey: string;
  to: string;
  from: string;
}

/** Returns the mail settings, or null when any of the three is missing. */
export function mailConfig(env: Record<string, string | undefined> = process.env): MailConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim();
  const from = env.CONTACT_FROM_EMAIL?.trim();
  if (!apiKey || !to || !from) return null;
  return { apiKey, to, from };
}

export interface ResendPayload {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  text: string;
  html: string;
}

/** Builds the email. Every visitor value is escaped for HTML or flattened to one line. */
export function buildContactEmail(fields: ContactFields, config: MailConfig): ResendPayload {
  const name = headerSafe(fields.name, 80);
  const email = headerSafe(fields.email, 120);
  const message = fields.message.replace(/\r\n?/g, "\n");

  const text = [`Naam: ${name}`, `E-mail: ${email}`, "", message].join("\n");
  const html = [
    '<div style="font-family:Georgia,serif;font-size:16px;line-height:1.5;color:#1c1c1c">',
    `<p style="margin:0 0 4px"><strong>Naam:</strong> ${escapeHtml(name)}</p>`,
    `<p style="margin:0 0 16px"><strong>E-mail:</strong> ${escapeHtml(email)}</p>`,
    `<p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>`,
    "</div>",
  ].join("");

  return {
    from: config.from,
    to: [config.to],
    reply_to: email,
    subject: stripLineBreaks(CONTACT_SUBJECT),
    text,
    html,
  };
}

export type SendResult = { ok: true } | { ok: false; status: number };

/** Sends one contact message. Resolves with a status, never throws. */
export async function sendContactMail(fields: ContactFields, config: MailConfig, fetcher: typeof fetch = fetch): Promise<SendResult> {
  try {
    const response = await fetcher(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(buildContactEmail(fields, config)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    return response.ok ? { ok: true } : { ok: false, status: response.status };
  } catch {
    // Timeout or network failure; status 0 marks "no response".
    return { ok: false, status: 0 };
  }
}
