"use client";

import { createContext, useContext, type ReactNode } from "react";
import { type Bilingual, type Locale, defaultLocale } from "./config";

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={lang}>{children}</LocaleContext.Provider>;
}

export function useLang(): Locale {
  return useContext(LocaleContext);
}

/** Picks the current language from a `{ nl, en }` copy object. */
export function useCopy<T>(copy: Bilingual<T>): T {
  return copy[useContext(LocaleContext)];
}
