"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Theme } from "@/lib/store";

/** Placeholder: replaced by the chrome build (header, rail, cursor, smooth scroll, terminal host). */
export function SiteChrome({ children }: { lang: Locale; initialTheme: Theme; children: ReactNode }) {
  return <>{children}</>;
}
