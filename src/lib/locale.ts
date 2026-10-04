import { isLocale, type Locale } from "@/i18n/config";

/** Returns the same path in another language: /nl/werk/x -> /en/werk/x. */
export function localizedPath(pathname: string, target: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) {
    parts[1] = target;
    return parts.join("/") || `/${target}`;
  }
  return `/${target}${pathname === "/" ? "" : pathname}`;
}
