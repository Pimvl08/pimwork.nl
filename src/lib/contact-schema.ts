import { z } from "zod";

/**
 * The contact form contract, shared by the browser and the API route so the
 * client checks exactly what the server checks. Error messages are short
 * codes, never echoes of the input; the form maps them to bilingual copy.
 */

export const CONTACT_LIMITS = {
  name: { min: 1, max: 100 },
  email: { max: 120 },
  message: { min: 10, max: 2000 },
} as const;

/** A submission faster than this after render is treated as a script. */
export const MIN_FILL_MS = 3_000;
/** A render timestamp older than this is refused, the page must be refreshed. */
export const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

export type ContactField = "name" | "email" | "message";
export type FieldErrorCode = "required" | "too_short" | "too_long" | "invalid";
export type FieldErrors = Partial<Record<ContactField, FieldErrorCode>>;

const FIELD_CODES: readonly FieldErrorCode[] = ["required", "too_short", "too_long", "invalid"];
const CONTACT_FIELDS: readonly ContactField[] = ["name", "email", "message"];

/** Pragmatic address check: one @, no spaces or brackets, a dot in the domain. */
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:".]+(?:\.[^\s@<>()[\]\\,;:".]+)*\.[^\s@<>()[\]\\,;:".]{2,}$/;
/** No control characters at all (single-line fields). */
const SINGLE_LINE = /^\P{Cc}*$/u;
/** Control characters except tab and line breaks (the message). */
const MULTI_LINE = /^(?:\P{Cc}|[\t\n\r])*$/u;

const text = () =>
  z.string({ error: (issue) => (issue.input === undefined || issue.input === null ? "required" : "invalid") }).trim();

export const contactFieldsSchema = z.object({
  name: text()
    .min(CONTACT_LIMITS.name.min, { error: "required", abort: true })
    .max(CONTACT_LIMITS.name.max, { error: "too_long", abort: true })
    .regex(SINGLE_LINE, { error: "invalid" }),
  email: text()
    .min(1, { error: "required", abort: true })
    .max(CONTACT_LIMITS.email.max, { error: "too_long", abort: true })
    .regex(EMAIL_PATTERN, { error: "invalid" }),
  message: text()
    .min(1, { error: "required", abort: true })
    .min(CONTACT_LIMITS.message.min, { error: "too_short", abort: true })
    .max(CONTACT_LIMITS.message.max, { error: "too_long", abort: true })
    .regex(MULTI_LINE, { error: "invalid" }),
});

export const contactRequestSchema = contactFieldsSchema.extend({
  /** Honeypot. People never see it; anything in it means a bot filled the form. */
  website: z.string().max(2000).optional().default(""),
  /** Server render time of the form in ms since epoch. */
  renderedAt: z.number().int().nonnegative(),
});

export type ContactFields = z.infer<typeof contactFieldsSchema>;
export type ContactRequest = z.infer<typeof contactRequestSchema>;

function toFieldErrors(issues: readonly z.core.$ZodIssue[]): { fields: FieldErrors; other: boolean } {
  const fields: FieldErrors = {};
  let other = false;
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && (CONTACT_FIELDS as readonly string[]).includes(key)) {
      const field = key as ContactField;
      if (fields[field]) continue; // first problem per field is the one to fix first
      fields[field] = (FIELD_CODES as readonly string[]).includes(issue.message) ? (issue.message as FieldErrorCode) : "invalid";
    } else {
      other = true;
    }
  }
  return { fields, other };
}

/** Client side: checks the three visible fields, returns an error code per field. */
export function validateContactFields(values: { name: string; email: string; message: string }): FieldErrors {
  const result = contactFieldsSchema.safeParse(values);
  return result.success ? {} : toFieldErrors(result.error.issues).fields;
}

export type ParsedContact =
  | { ok: true; data: ContactRequest }
  | { ok: false; fields: FieldErrors; malformed: boolean };

/** Server side: parses an unknown JSON body. Never returns the raw input. */
export function parseContactRequest(input: unknown): ParsedContact {
  const result = contactRequestSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const { fields, other } = toFieldErrors(result.error.issues);
  return { ok: false, fields, malformed: other };
}

/** Is the render timestamp plausible for a person filling in the form? */
export function checkFormAge(renderedAt: number, now = Date.now()): "ok" | "too_fast" | "expired" {
  const age = now - renderedAt;
  if (age < MIN_FILL_MS) return "too_fast";
  if (age > MAX_FORM_AGE_MS) return "expired";
  return "ok";
}
