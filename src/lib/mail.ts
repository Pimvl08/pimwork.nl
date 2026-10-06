import { Resend } from "resend";
import { CONTACT_LIMITS, type ContactFields } from "@/lib/contact-schema";
import { escapeHtml, headerSafe, stripLineBreaks } from "@/lib/escape";

/**
 * Delivery of contact messages through Resend.
 * Server only: reads secrets from the environment and is imported only by
 * the API route. Nothing here logs content or addresses, and nothing is
 * stored: a message exists only as the email that goes out.
 */

export const CONTACT_SUBJECT_PREFIX = "Nieuw bericht via pimwork.nl van";
export const MAIL_SETTINGS = ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"] as const;
const TIMEOUT_MS = 10_000;

export interface MailConfig {
  apiKey: string;
  to: string;
  from: string;
}

type Env = Record<string, string | undefined>;

/** Names of the mail settings that are missing or empty. Never their values. */
export function missingMailSettings(env: Env = process.env): string[] {
  return MAIL_SETTINGS.filter((name) => !env[name]?.trim());
}

/** Returns the mail settings, or null when any of the three is missing. */
export function mailConfig(env: Env = process.env): MailConfig | null {
  if (missingMailSettings(env).length > 0) return null;
  return {
    apiKey: env.RESEND_API_KEY!.trim(),
    to: env.CONTACT_TO_EMAIL!.trim(),
    from: env.CONTACT_FROM_EMAIL!.trim(),
  };
}

export interface ContactEmail {
  from: string;
  to: string[];
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

/** The subject line, with the visitor's name flattened to one safe line. */
export function contactSubject(name: string): string {
  return stripLineBreaks(`${CONTACT_SUBJECT_PREFIX} ${headerSafe(name, CONTACT_LIMITS.name.max)}`);
}

/** "6 oktober 2026 om 20:41", in Dutch time, so it matches the clock Pim reads. */
export function formatSentAt(date: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(date);
}

/** Builds the email. Every visitor value is escaped for HTML or flattened to one line. */
export function buildContactEmail(fields: ContactFields, config: MailConfig, sentAt: Date = new Date()): ContactEmail {
  const name = headerSafe(fields.name, CONTACT_LIMITS.name.max);
  const email = headerSafe(fields.email, CONTACT_LIMITS.email.max);
  const message = fields.message.replace(/\r\n?/g, "\n");
  const time = formatSentAt(sentAt);

  const text = [`Naam: ${name}`, `E-mail: ${email}`, `Verstuurd: ${time}`, "", message].join("\n");
  const html = [
    '<div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#1c1c1c">',
    `<p style="margin:0 0 4px"><strong>Naam:</strong> ${escapeHtml(name)}</p>`,
    `<p style="margin:0 0 4px"><strong>E-mail:</strong> ${escapeHtml(email)}</p>`,
    `<p style="margin:0 0 16px"><strong>Verstuurd:</strong> ${escapeHtml(time)}</p>`,
    `<p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>`,
    "</div>",
  ].join("");

  return {
    from: config.from,
    to: [config.to],
    replyTo: email,
    subject: contactSubject(fields.name),
    text,
    html,
  };
}

/** The one call this module needs from the Resend client, so tests can pass a fake. */
export interface MailSender {
  emails: {
    send(payload: ContactEmail): Promise<{ error: { statusCode: number | null; name: string } | null }>;
  };
}

export type SendResult = { ok: true } | { ok: false; status: number; reason: string };

/** Sends one contact message. Resolves with a status, never throws. */
export async function sendContactMail(
  fields: ContactFields,
  config: MailConfig,
  sender: MailSender = new Resend(config.apiKey),
): Promise<SendResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), TIMEOUT_MS);
  });
  try {
    const result = await Promise.race([sender.emails.send(buildContactEmail(fields, config)), timeout]);
    if (result === "timeout") return { ok: false, status: 0, reason: "timeout" };
    if (result.error) return { ok: false, status: result.error.statusCode ?? 0, reason: result.error.name };
    return { ok: true };
  } catch {
    // Network failure inside the client; status 0 marks "no response".
    return { ok: false, status: 0, reason: "network" };
  } finally {
    clearTimeout(timer);
  }
}
