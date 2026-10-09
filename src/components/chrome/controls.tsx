"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import circle from "@/components/ui/CircleButton.module.css";
import { Icon } from "@/components/ui/Icon";
import { locales, type Locale } from "@/i18n/config";
import { useCopy, useLang } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/lib/locale";
import { useUI } from "@/lib/store";
import { toggleTheme } from "@/lib/theme";
import styles from "./chrome.module.css";
import { chromeCopy, languageNames } from "./copy";
import { activePageId } from "./logic";

/** The page the visitor is on, from the URL (null outside the menu). */
export function useActivePage() {
  const lang = useLang();
  return activePageId(usePathname(), lang);
}

/** "NL · EN": real links to the same page in the other language. */
export function LangSwitch({ className, large = false }: { className?: string; large?: boolean }) {
  const lang = useLang();
  const pathname = usePathname() ?? `/${lang}`;
  const label = useCopy(chromeCopy.language);

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>, target: Locale, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    // A full page load: the language is part of the root layout, and a soft
    // navigation would let the project sheet route intercept /werk/<slug>.
    event.preventDefault();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full load is intended: the language lives in the root layout
    window.location.assign(`${href}${window.location.hash}`);
  };

  return (
    <div role="group" aria-label={label} className={cn(styles.lang, large && styles.langLarge, className)}>
      {locales.map((target, index) => {
        const href = localizedPath(pathname, target);
        return (
          <Fragment key={target}>
            {index > 0 ? (
              <span aria-hidden="true" className={styles.langDot}>
                ·
              </span>
            ) : null}
            <a
              href={href}
              hrefLang={target}
              lang={target}
              aria-current={target === lang ? "true" : undefined}
              className={styles.langLink}
              onClick={(event) => onClick(event, target, href)}
            >
              {target.toUpperCase()}
              <span className="sr-only"> {languageNames[target]}</span>
            </a>
          </Fragment>
        );
      })}
    </div>
  );
}

/**
 * Sun or moon: both icons are rendered and CSS picks one from
 * <html data-theme>, so the server markup is already right (no flash).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUI((s) => s.theme);
  const toLight = useCopy(chromeCopy.toLight);
  const toDark = useCopy(chromeCopy.toDark);
  const label = theme === "dark" ? toLight : toDark;
  return (
    <button
      type="button"
      className={cn(circle.circle, circle.md, styles.themeToggle, className)}
      aria-label={label}
      title={label}
      data-theme-toggle=""
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
    >
      <span className={cn(styles.themeIcon, styles.themeSun)}>
        <Icon name="sun" size={20} />
      </span>
      <span className={cn(styles.themeIcon, styles.themeMoon)}>
        <Icon name="moon" size={20} />
      </span>
    </button>
  );
}

/** Origin for a theme switch started from the keyboard: the visible toggle, else the top right. */
export function themeOrigin(): { x: number; y: number } {
  const toggles = Array.from(document.querySelectorAll<HTMLElement>("[data-theme-toggle]"));
  const visible = toggles.find((el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0);
  if (visible) {
    const rect = visible.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  return { x: window.innerWidth - 40, y: 40 };
}
