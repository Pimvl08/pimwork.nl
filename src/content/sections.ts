import type { Bilingual } from "@/i18n/config";

/**
 * The plates of the home page, in reading order. `id` is the anchor and stays
 * the same in both languages so shared links keep working.
 */
export interface SectionDef {
  id: string;
  numeral: string;
  label: Bilingual<string>;
  /** Single key that jumps to this plate (shown in the shortcut sheet). */
  key: string;
}

export const sections: SectionDef[] = [
  { id: "cover", numeral: "00", label: { nl: "Omslag", en: "Cover" }, key: "0" },
  { id: "about", numeral: "01", label: { nl: "Wie", en: "Who" }, key: "1" },
  { id: "work", numeral: "02", label: { nl: "Werk", en: "Work" }, key: "2" },
  { id: "lab", numeral: "03", label: { nl: "Lab", en: "Lab" }, key: "3" },
  { id: "media", numeral: "04", label: { nl: "Beeld", en: "Media" }, key: "4" },
  { id: "data", numeral: "05", label: { nl: "Data", en: "Data" }, key: "5" },
  { id: "machine", numeral: "06", label: { nl: "Machine", en: "Machine" }, key: "6" },
  { id: "contact", numeral: "07", label: { nl: "Contact", en: "Contact" }, key: "7" },
];

export const sectionIds = sections.map((section) => section.id);
