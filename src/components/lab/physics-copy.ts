import type { Bilingual } from "@/i18n/config";

export const physicsCopy = {
  surface: {
    nl: "Pot met papieren schijven, een per technologie die Pim gebruikt. Pijltjes kantelen de zwaartekracht, spatie schudt.",
    en: "Jar of paper discs, one per technology Pim uses. Arrow keys tilt gravity, space shakes.",
  },
  hint: {
    nl: "Sleep en gooi een schijf, tik ernaast om te duwen.",
    en: "Drag and throw a disc, tap beside one to push.",
  },
  cursorGrab: { nl: "Pak", en: "Grab" },
  cursorPush: { nl: "Duw", en: "Push" },
  shake: { nl: "Schud", en: "Shake" },
  flip: { nl: "Zwaartekracht omdraaien", en: "Flip gravity" },
  reset: { nl: "Opnieuw", en: "Again" },
  table: { nl: "Lijst", en: "List" },
  tableCaption: {
    nl: "Technologieën in Pims projecten, met het aantal projecten waarin ze voorkomen.",
    en: "Technologies in Pim's projects, with the number of projects each appears in.",
  },
  colTech: { nl: "Technologie", en: "Technology" },
  colCount: { nl: "Projecten", en: "Projects" },
  colWhere: { nl: "Waar", en: "Where" },
  shakeOff: {
    nl: "Schudden staat uit omdat je minder beweging hebt gekozen.",
    en: "Shaking is off because you chose reduced motion.",
  },
  said: {
    shook: { nl: "Geschud.", en: "Shaken." },
    flipUp: { nl: "Zwaartekracht wijst nu omhoog.", en: "Gravity now points up." },
    flipDown: { nl: "Zwaartekracht wijst weer omlaag.", en: "Gravity points down again." },
    tilt: { nl: "Zwaartekracht gekanteld.", en: "Gravity tilted." },
    reset: { nl: "Alle schijven opnieuw in de pot.", en: "All discs dropped in again." },
    pushed: { nl: "Geduwd.", en: "Pushed." },
  },
} as const satisfies Record<string, Bilingual<string> | Record<string, Bilingual<string>>>;

export function projectsLabel(lang: "nl" | "en", count: number): string {
  if (lang === "nl") return count === 1 ? "1 project" : `${count} projecten`;
  return count === 1 ? "1 project" : `${count} projects`;
}
