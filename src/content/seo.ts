import type { Bilingual } from "@/i18n/config";

/** Title and description of the site as a whole, used by the root layout and the structured data. */
export const siteMeta = {
  title: {
    nl: "PimWork | Software die werk uit handen neemt",
    en: "PimWork | Software that takes work off your hands",
  },
  description: {
    nl: "Ik bouw web-apps, desktopsoftware en slimme tools die werk uit handen nemen. Bekijk mijn werk en neem contact op.",
    en: "I build web apps, desktop software and smart tools that take work off your hands. See my work and get in touch.",
  },
} satisfies { title: Bilingual<string>; description: Bilingual<string> };

/**
 * Where Pim works, for the structured data. Places only, never a street
 * address: the business is run from home.
 */
export const areaServed = [
  { "@type": "City", name: "Helmond" },
  { "@type": "AdministrativeArea", name: "Laarbeek" },
  { "@type": "City", name: "Eindhoven" },
  { "@type": "State", name: "Noord-Brabant" },
] as const;
