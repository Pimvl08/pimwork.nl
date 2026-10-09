export const locales = ["nl", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "nl";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "nl" || value === "en";
}

/**
 * Bilingual copy lives next to the feature that uses it, as `{ nl, en }`.
 * Both sides must have the same shape, which TypeScript enforces through T.
 */
export type Bilingual<T> = { nl: T; en: T };

export function pick<T>(copy: Bilingual<T>, lang: Locale): T {
  return copy[lang];
}

export const htmlLang: Record<Locale, string> = { nl: "nl-NL", en: "en-GB" };
