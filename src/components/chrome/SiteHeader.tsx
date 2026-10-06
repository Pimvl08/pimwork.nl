"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CreaseMark } from "@/components/ui/CreaseMark";
import { BrandName } from "@/components/ui/BrandName";
import { pageHref, pages } from "@/content/sections";
import { pick } from "@/i18n/config";
import { useCopy, useLang } from "@/i18n/LocaleProvider";
import { uiStore } from "@/lib/store";
import styles from "./chrome.module.css";
import { LangSwitch, ThemeToggle, useActivePage } from "./controls";
import { chromeCopy } from "./copy";

const navPages = pages.filter((page) => page.inNav);

/**
 * A solid paper strip. Gains a hairline once the page moves, slides away on
 * the way down and comes back on the way up, but never while it holds focus.
 */
export function SiteHeader() {
  const lang = useLang();
  const active = useActivePage();
  const homeLabel = useCopy(chromeCopy.home);
  const navLabel = useCopy(chromeCopy.mainNav);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const focusInside = useRef(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      setScrolled(y > 8);
      const delta = y - lastY;
      if (y < 96) setHidden(false);
      else if (Math.abs(delta) > 6) setHidden(delta > 0 && !focusInside.current && !uiStore.get().terminalOpen);
      if (Math.abs(delta) > 6 || y < 96) lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={styles.header}
      data-scrolled={scrolled}
      data-hidden={hidden}
      onFocus={() => {
        focusInside.current = true;
        setHidden(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focusInside.current = false;
      }}
    >
      <Link
        href={`/${lang}`}
        className={styles.brand}
        aria-label={homeLabel}
        aria-current={active === "home" ? "page" : undefined}
        data-egg="logo"
      >
        <CreaseMark size={30} />
        <span aria-hidden="true">
          <BrandName />
        </span>
      </Link>

      <nav aria-label={navLabel} className={styles.nav}>
        <ul className={styles.navList}>
          {navPages.map((page) => (
            <li key={page.id}>
              <Link href={pageHref(lang, page)} className={styles.navLink} aria-current={active === page.id ? "page" : undefined}>
                <span className="label">{pick(page.label, lang)}</span>
                <svg className={styles.navArc} viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <path d="M3 8.5 Q 50 0.5 97 8.5" pathLength={1} />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.tools}>
        <LangSwitch />
        <ThemeToggle className={styles.desktopOnly} />
      </div>
    </header>
  );
}
