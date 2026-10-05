/**
 * Pure helpers for the about page. No React, so they are unit tested in
 * tests/unit/about.test.ts.
 */

import type { Fact } from "@/content/person";
import type { Locale } from "@/i18n/config";

export interface ShownFact {
  id: string;
  label: string;
  value: string;
}

/** Only facts with a value are shown; a fact set to null is left out entirely. */
export function visibleFacts(list: readonly Fact[], lang: Locale): ShownFact[] {
  const shown: ShownFact[] = [];
  for (const fact of list) {
    const value = fact.value?.[lang]?.trim();
    if (value) shown.push({ id: fact.id, label: fact.label[lang], value });
  }
  return shown;
}

/** Roman figure numbers for the principles, the way a geometer numbers figures. */
export function figureNumeral(index: number): string {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return romans[index] ?? String(index + 1);
}
