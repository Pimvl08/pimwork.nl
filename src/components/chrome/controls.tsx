"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";
import { CircleButton } from "@/components/ui/CircleButton";
import circle from "@/components/ui/CircleButton.module.css";
import { Icon } from "@/components/ui/Icon";
import { locales, type Locale } from "@/i18n/config";
import { useCopy, useLang } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/lib/locale";
import { persistLocale } from "@/lib/prefs";
import { uiStore, useUI } from "@/lib/store";
import { toggleTheme } from "@/lib/theme";
import styles from "./chrome.module.css";
import { chromeCopy, languageNames } from "./copy";

/** "NL · EN": real links to the same page in the other language. */
export function LangSwitch({ className, large = false }: { className?: string; large?: boolean }) {
  const lang = useLang();
  const pathname = usePathname() ?? `/${lang}`;
  const router = useRouter();
  const label = useCopy(chromeCopy.language);

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>, target: Locale, href: string) => {
    persistLocale(target);
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    // Keep the reader on the same plate when switching language.
    if (window.location.hash) {
      event.preventDefault();
      router.push(`${href}${window.location.hash}`);
    }
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
            <Link
              href={href}
              hrefLang={target}
              lang={target}
              aria-current={target === lang ? "true" : undefined}
              className={styles.langLink}
              data-cursor="link"
              onClick={(event) => onClick(event, target, href)}
            >
              {target.toUpperCase()}
              <span className="sr-only"> {languageNames[target]}</span>
            </Link>
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
      data-cursor="link"
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

export function TerminalButton({ className }: { className?: string }) {
  const label = useCopy(chromeCopy.terminal);
  return (
    <CircleButton
      icon="terminal"
      label={label}
      className={className}
      aria-keyshortcuts="Control+K Meta+K"
      onClick={() => uiStore.set({ terminalOpen: true })}
    />
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
