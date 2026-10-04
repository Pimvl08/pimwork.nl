import type { Theme } from "./store";
import type { Locale } from "@/i18n/config";
import { LOCALE_COOKIE } from "@/i18n/config";

export const THEME_COOKIE = "pim-theme";
const YEAR = 60 * 60 * 24 * 365;

/** Writes a first-party preference cookie (no personal data). */
function writeCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${YEAR}; SameSite=Lax${secure}`;
}

export function persistTheme(theme: Theme) {
  writeCookie(THEME_COOKIE, theme);
}

export function persistLocale(locale: Locale) {
  writeCookie(LOCALE_COOKIE, locale);
}

export function parseTheme(value: string | undefined): Theme {
  return value === "light" ? "light" : "dark";
}
