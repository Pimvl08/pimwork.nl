import type { Bilingual } from "@/i18n/config";

/** Title and description of the site as a whole, used by the root layout and the structured data. */
export const siteMeta = {
  title: {
    nl: "PimWork | Software, automatisering en websites in Helmond",
    en: "PimWork | Software, automation and websites in Helmond",
  },
  description: {
    nl: "Ik bouw software op maat, koppelingen en websites voor bedrijven in Helmond, Laarbeek, Eindhoven en omgeving. Bekijk mijn werk of neem contact op.",
    en: "I build custom software, integrations and websites for businesses in Helmond, Laarbeek, Eindhoven and the surrounding area. See my work or get in touch.",
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
