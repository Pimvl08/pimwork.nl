import { pages, type PageDef } from "@/content/sections";

/* Pure helpers for the chrome, kept free of React and the DOM so they can be unit tested. */

export type ShortcutAction =
  | { type: "terminal" }
  | { type: "sheet" }
  | { type: "theme" }
  | { type: "lang" }
  | { type: "page"; id: PageDef["id"] }
  | { type: "escape" };

export interface KeyInput {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  /** Focus is in an input, textarea, select or contenteditable. */
  typing: boolean;
  terminalOpen: boolean;
  /** Another modal (the mobile menu) is open and owns the keyboard. */
  modalOpen: boolean;
  composing?: boolean;
}

/** Maps a keydown to a site shortcut, or null when the key belongs to someone else. */
export function shortcutFor(input: KeyInput): ShortcutAction | null {
  if (input.composing) return null;
  const { key } = input;
  // Ctrl/Cmd+K opens the palette even from a form field; once open, the palette owns the key.
  if ((input.ctrl || input.meta) && !input.alt && key.toLowerCase() === "k") {
    return input.terminalOpen ? null : { type: "terminal" };
  }
  if (key === "Escape") return input.terminalOpen ? null : { type: "escape" };
  if (input.ctrl || input.meta || input.alt) return null;
  if (input.typing || input.terminalOpen || input.modalOpen) return null;
  if (key === "?") return { type: "sheet" };
  const lower = key.toLowerCase();
  if (lower === "t") return { type: "theme" };
  if (lower === "l") return { type: "lang" };
  const page = pages.find((p) => p.key === key);
  return page ? { type: "page", id: page.id } : null;
}

/**
 * Which page the pathname belongs to: /nl -> home, /nl/werk/teamsync -> work.
 * Returns null for pages outside the menu (the hidden page, a 404).
 */
export function activePageId(pathname: string | null | undefined, lang: string): PageDef["id"] | null {
  if (!pathname) return null;
  const trimmed = pathname.replace(/\/+$/, "");
  const prefix = `/${lang}`;
  if (trimmed === prefix || trimmed === "") return "home";
  if (!trimmed.startsWith(`${prefix}/`)) return null;
  const segment = `/${trimmed.slice(prefix.length + 1).split("/")[0]}`;
  return pages.find((page) => page.path === segment)?.id ?? null;
}

/** True when `pathname` is the home page of `lang`. */
export function isHomePath(pathname: string | null | undefined, lang: string): boolean {
  return activePageId(pathname, lang) === "home";
}
