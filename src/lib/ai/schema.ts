import { z } from "zod";

/** Body of POST /api/ask. */
export const askSchema = z.object({
  question: z.string().trim().min(2).max(400),
  lang: z.enum(["nl", "en"]),
});

export type AskInput = z.infer<typeof askSchema>;

export type AskParse = { ok: true; data: AskInput } | { ok: false; fields: Record<string, string[]> };

export function parseAsk(body: unknown): AskParse {
  const result = askSchema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  const fields: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "body";
    (fields[key] ??= []).push(issue.message);
  }
  return { ok: false, fields };
}

/** The note appended when the model declines to answer. */
export const REFUSAL_NOTE = {
  nl: "De machine wil hier liever niet op antwoorden. Stel gerust een andere vraag over Pims werk.",
  en: "The machine would rather not answer this one. Feel free to ask something else about Pim's work.",
} as const;

export const INTERRUPTED_NOTE = {
  nl: "(Het antwoord werd onderbroken.)",
  en: "(The answer was interrupted.)",
} as const;
