"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { pick } from "@/i18n/config";
import { uiStore, type Theme } from "@/lib/store";
import styles from "./chrome.module.css";
import { chromeCopy } from "./copy";
import { Cursor } from "./Cursor";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { isHomePath } from "./logic";
import { MobileNav } from "./MobileNav";
import { PlateRail } from "./PlateRail";
import { startPlateTracking } from "./plates";
import { Preloader } from "./Preloader";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SmoothScroll } from "./SmoothScroll";

const TerminalHost = dynamic(() => import("@/components/terminal/TerminalHost"), { ssr: false });
const EasterEggs = dynamic(() => import("@/components/easter/EasterEggs"), { ssr: false });

/** Brings the store in line with the paper the server rendered (from the cookie). */
function ThemeSync({ theme }: { theme: Theme }) {
  useEffect(() => {
    uiStore.set({ theme });
  }, [theme]);
  return null;
}

/** Re-reads which plates exist whenever the route changes. */
function PlateTracker({ pathname }: { pathname: string | null }) {
  useEffect(() => startPlateTracking(), [pathname]);
  return null;
}

/**
 * Everything around the content: header, plate rail (desktop), thumb bar
 * (mobile), cursor, smooth scroll, shortcuts, preloader, footer, plus the
 * lazily loaded terminal and easter eggs.
 */
export function SiteChrome({ lang, initialTheme, children }: { lang: Locale; initialTheme: Theme; children: ReactNode }) {
  const pathname = usePathname();
  const onHome = isHomePath(pathname, lang);

  return (
    <>
      <ThemeSync theme={initialTheme} />
      <PlateTracker pathname={pathname} />
      <a href="#main" className={styles.skip}>
        {pick(chromeCopy.skip, lang)}
      </a>
      <SiteHeader onHome={onHome} />
      {onHome ? <PlateRail /> : null}
      <MobileNav onHome={onHome} />
      <Cursor />
      <SmoothScroll />
      <KeyboardShortcuts />
      <Preloader />
      {children}
      <SiteFooter />
      <TerminalHost />
      <EasterEggs />
    </>
  );
}
