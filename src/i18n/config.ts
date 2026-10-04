export const locales = ["nl", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "nl";

/** Cookie that remembers an explicit language choice, read by the proxy. */
export const LOCALE_COOKIE = "pim-lang";

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

/** Picks the preferred supported locale from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number.parseFloat(q.trim().slice(2)) : 1;
      return { base: tag.toLowerCase().split("-")[0], quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((entry) => entry.base.length > 0)
    .sort((a, b) => b.quality - a.quality);
  for (const entry of ranked) {
    if (isLocale(entry.base)) return entry.base;
  }
  return defaultLocale;
}

export const htmlLang: Record<Locale, string> = { nl: "nl-NL", en: "en-GB" };
