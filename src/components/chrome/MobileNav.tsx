"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type CSSProperties } from "react";
import { CreaseMark } from "@/components/ui/CreaseMark";
import { Icon } from "@/components/ui/Icon";
import { sections } from "@/content/sections";
import { pick } from "@/i18n/config";
import { useCopy, useLang } from "@/i18n/LocaleProvider";
import styles from "./chrome.module.css";
import { LangSwitch, TerminalButton, ThemeToggle } from "./controls";
import { chromeCopy } from "./copy";
import { goToPlate, useActivePlate } from "./plates";
import { Sheet } from "./Sheet";

function MenuGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9.5 Q 12 6.5 20 9.5 M4 15.5 Q 12 12.5 20 15.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Below 1024px the navigation lives where the thumb is: an arched bar at the
 * bottom (as on the quality board) with the current plate, theme, terminal
 * and the menu. The menu is a full paper sheet with every plate.
 */
export function MobileNav({ onHome }: { onHome: boolean }) {
  const lang = useLang();
  const router = useRouter();
  const active = useActivePlate();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const t = {
    plates: useCopy(chromeCopy.plates),
    current: useCopy(chromeCopy.current),
    menu: useCopy(chromeCopy.menu),
    openMenu: useCopy(chromeCopy.openMenu),
    closeMenu: useCopy(chromeCopy.closeMenu),
    menuTitle: useCopy(chromeCopy.menuTitle),
    swipeHint: useCopy(chromeCopy.swipeHint),
    home: useCopy(chromeCopy.home),
  };
  const currentSection = onHome ? sections.find((section) => section.id === active) ?? sections[0] : null;

  const choose = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setOpen(false);
    // Let the sheet release the scroll lock and focus first, then travel.
    window.setTimeout(() => goToPlate(id, lang, (href) => router.push(href)), 40);
  };

  return (
    <>
      <div className={styles.pillWrap}>
        <div className={styles.pill}>
          {currentSection ? (
            <p className={styles.pillCurrent}>
              <span className="sr-only">{t.current} </span>
              <span className={styles.pillNumeral}>{currentSection.numeral}</span>
              <span className={styles.pillName}>{pick(currentSection.label, lang)}</span>
            </p>
          ) : (
            <Link href={`/${lang}`} className={styles.pillHome} aria-label={t.home} data-cursor="link">
              <CreaseMark size={26} />
              <span aria-hidden="true">Pim</span>
            </Link>
          )}
          <ThemeToggle />
          <TerminalButton />
          <button
            type="button"
            className={styles.menuButton}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={t.openMenu}
            data-cursor="link"
            onClick={() => setOpen(true)}
          >
            <MenuGlyph />
            <span aria-hidden="true">{t.menu}</span>
          </button>
        </div>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} labelledBy={titleId} variant="full" swipeToClose initialFocus={closeRef}>
        <div className={styles.sheetHead}>
          <span className={styles.sheetGrip} aria-hidden="true" />
          <h2 id={titleId} className={`label ${styles.sheetTitle}`}>
            {t.menuTitle}
          </h2>
          <p className="sr-only">{t.swipeHint}</p>
        </div>
        <nav aria-label={t.plates} className={styles.sheetNav}>
          <ol className={styles.menuList}>
            {sections.map((section, index) => {
              const current = onHome && active === section.id;
              return (
                <li key={section.id} className={styles.menuItem} style={{ "--i": index } as CSSProperties}>
                  <a
                    href={`/${lang}#${section.id}`}
                    className={styles.menuLink}
                    aria-current={current ? "location" : undefined}
                    onClick={(event) => choose(event, section.id)}
                  >
                    <span className={styles.menuNumeral}>{section.numeral}</span>
                    <span className={styles.menuName}>{pick(section.label, lang)}</span>
                    <Icon name="arrowSE" size={20} className={styles.menuArrow} />
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className={styles.sheetBar}>
          <LangSwitch large />
          <ThemeToggle />
          <button ref={closeRef} type="button" className={styles.menuButton} onClick={() => setOpen(false)} data-cursor="link">
            <Icon name="close" size={18} />
            <span>{t.closeMenu}</span>
          </button>
        </div>
      </Sheet>
    </>
  );
}
