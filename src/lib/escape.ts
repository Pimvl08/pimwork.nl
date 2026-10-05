/**
 * Escaping helpers for text that leaves the site in an email.
 * Every value a visitor typed goes through one of these before it is placed
 * in HTML or in a header-like field (subject, display name).
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes the five characters that can change the meaning of HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
}

/**
 * Removes CR, LF, the Unicode line and paragraph separators and every other
 * control character, so a value can never
 * start a new header line. Runs of whitespace collapse to one space.
 */
export function stripLineBreaks(value: string): string {
  return value
    .replace(/\p{Cc}+/gu, " ")
    .replace(/[\u2028\u2029]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** A single-line, length-capped value that is safe for a subject or a display name. */
export function headerSafe(value: string, max = 120): string {
  return stripLineBreaks(value).slice(0, max);
}
