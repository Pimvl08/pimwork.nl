"use client";

import Link from "next/link";
import { useId, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { pageHref, pages } from "@/content/sections";
import { pick } from "@/i18n/config";
import { useCopy, useLang } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/cn";
import styles from "./chrome.module.css";
import { LangSwitch, ThemeToggle, useActivePage } from "./controls";
import { chromeCopy } from "./copy";
import { Sheet } from "./Sheet";

const barPages = pages.filter((page) => page.inNav);

function MenuGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9.5 Q 12 6.5 20 9.5 M4 15.5 Q 12 12.5 20 15.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Below 1024px the navigation lives where the thumb is: an arched bar at the
 * bottom with the four pages and a menu button. The menu is a full paper
 * sheet with every page, the theme and the language.
 */
export function MobileNav() {
  const lang = useLang();
  const active = useActivePage();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const t = {
    pages: useCopy(chromeCopy.pages),
    openMenu: useCopy(chromeCopy.openMenu),
    closeMenu: useCopy(chromeCopy.closeMenu),
    menuTitle: useCopy(chromeCopy.menuTitle),
    swipeHint: useCopy(chromeCopy.swipeHint),
  };

  return (
    <>
      <nav className={styles.pillWrap} aria-label={t.pages}>
        <div className={styles.pill}>
          <ul className={styles.pillLinks}>
            {barPages.map((page) => (
              <li key={page.id}>
                <Link href={pageHref(lang, page)} className={styles.pillLink} aria-current={active === page.id ? "page" : undefined}>
                  {pick(page.label, lang)}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={cn(styles.menuButton, styles.menuButtonRound)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={t.openMenu}
            onClick={() => setOpen(true)}
          >
            <MenuGlyph />
          </button>
        </div>
      </nav>

      <Sheet open={open} onClose={() => setOpen(false)} labelledBy={titleId} variant="full" swipeToClose initialFocus={closeRef}>
        <div className={styles.sheetHead}>
          <span className={styles.sheetGrip} aria-hidden="true" />
          <h2 id={titleId} className={`label ${styles.sheetTitle}`}>
            {t.menuTitle}
          </h2>
          <p className="sr-only">{t.swipeHint}</p>
        </div>
        <nav aria-label={t.pages} className={styles.sheetNav}>
          <ul className={styles.menuList}>
            {pages.map((page, index) => (
              <li key={page.id} className={styles.menuItem} style={{ "--i": index } as CSSProperties}>
                <Link
                  href={pageHref(lang, page)}
                  className={styles.menuLink}
                  aria-current={active === page.id ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.menuName}>{pick(page.label, lang)}</span>
                  <Icon name="arrowRight" size={22} className={styles.menuArrow} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.sheetBar}>
          <LangSwitch large />
          <ThemeToggle />
          <button ref={closeRef} type="button" className={styles.menuButton} onClick={() => setOpen(false)}>
            <Icon name="close" size={18} />
            <span>{t.closeMenu}</span>
          </button>
        </div>
      </Sheet>
    </>
  );
}
