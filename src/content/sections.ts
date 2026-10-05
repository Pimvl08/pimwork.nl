import type { Bilingual } from "@/i18n/config";

/**
 * The site's pages, in menu order. `path` is appended to /<lang>.
 * `key` is the single-key shortcut shown in the shortcut sheet.
 */
export interface PageDef {
  id: "home" | "work" | "about" | "lab" | "contact";
  path: string;
  label: Bilingual<string>;
  key: string;
  /** Shown in the main navigation (home is reached through the logo). */
  inNav: boolean;
}

export const pages: PageDef[] = [
  { id: "home", path: "", label: { nl: "Home", en: "Home" }, key: "0", inNav: false },
  { id: "work", path: "/werk", label: { nl: "Werk", en: "Work" }, key: "1", inNav: true },
  { id: "about", path: "/over", label: { nl: "Over mij", en: "About" }, key: "2", inNav: true },
  { id: "lab", path: "/lab", label: { nl: "Lab", en: "Lab" }, key: "3", inNav: true },
  { id: "contact", path: "/contact", label: { nl: "Contact", en: "Contact" }, key: "4", inNav: true },
];

export function pageHref(lang: string, page: PageDef): string {
  return `/${lang}${page.path}`;
}
