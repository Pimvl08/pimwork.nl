"use client";

import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { pick } from "@/i18n/config";
import { uiStore, type Theme } from "@/lib/store";
import styles from "./chrome.module.css";
import { chromeCopy } from "./copy";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { MobileNav } from "./MobileNav";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

const TerminalHost = dynamic(() => import("@/components/terminal/TerminalHost"), { ssr: false });
const EasterEggs = dynamic(() => import("@/components/easter/EasterEggs"), { ssr: false });

/** Brings the store in line with the paper the server rendered (from the cookie). */
function ThemeSync({ theme }: { theme: Theme }) {
  useEffect(() => {
    uiStore.set({ theme });
  }, [theme]);
  return null;
}

/**
 * Everything around the content: header, thumb bar (mobile), shortcuts and
 * footer, plus the lazily loaded command palette and easter eggs.
 */
export function SiteChrome({ lang, initialTheme, children }: { lang: Locale; initialTheme: Theme; children: ReactNode }) {
  return (
    <>
      <ThemeSync theme={initialTheme} />
      <a href="#main" className={styles.skip}>
        {pick(chromeCopy.skip, lang)}
      </a>
      <SiteHeader />
      <MobileNav />
      <KeyboardShortcuts />
      {children}
      <SiteFooter />
      <TerminalHost />
      <EasterEggs />
    </>
  );
}
