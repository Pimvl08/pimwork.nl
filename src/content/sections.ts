import type { Bilingual } from "@/i18n/config";

/**
 * The site's pages, in menu order. `path` is appended to /<lang>.
 * `key` is the single-key shortcut shown in the shortcut sheet.
 */
export interface PageDef {
  id: "home" | "work" | "services" | "about" | "lab" | "contact";
  path: string;
  label: Bilingual<string>;
  key: string;
  /** Shown in the main navigation (home is reached through the logo). */
  inNav: boolean;
  /**
   * Shown in the thumb bar on phones. It holds four links at 320 px; the
   * other pages are one tap away in the menu sheet.
   */
  inBar: boolean;
}

export const pages: PageDef[] = [
  { id: "home", path: "", label: { nl: "Home", en: "Home" }, key: "0", inNav: false, inBar: false },
  { id: "work", path: "/werk", label: { nl: "Werk", en: "Work" }, key: "1", inNav: true, inBar: true },
  { id: "services", path: "/diensten", label: { nl: "Diensten", en: "Services" }, key: "2", inNav: true, inBar: false },
  { id: "about", path: "/over", label: { nl: "Over mij", en: "About" }, key: "3", inNav: true, inBar: true },
  { id: "lab", path: "/lab", label: { nl: "Lab", en: "Lab" }, key: "4", inNav: true, inBar: true },
  { id: "contact", path: "/contact", label: { nl: "Contact", en: "Contact" }, key: "5", inNav: true, inBar: true },
];

export function pageHref(lang: string, page: PageDef): string {
  return `/${lang}${page.path}`;
}
