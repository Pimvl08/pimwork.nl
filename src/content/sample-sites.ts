import type { Bilingual } from "@/i18n/config";

/**
 * Sample websites for the page "Website laten maken". Only sites for a
 * made-up business belong here, never a real company that did not become a
 * client. Each one is shown with the label "voorbeeldsite" / "sample site".
 * While the list is empty, the block does not appear at all.
 *
 * To add one: put a screenshot in /public/media/sample-sites/ and add an entry,
 * for example
 *   {
 *     name: "Schildersbedrijf Voorbeeld",
 *     url: "https://voorbeeld.pimwork.nl",
 *     trade: { nl: "Schilder", en: "Painter" },
 *     description: { nl: "Eén pagina met diensten, foto's en een belknop.", en: "One page with services, photos and a call button." },
 *     image: { src: "/media/sample-sites/schilder.jpg", width: 1600, height: 1000, alt: { nl: "...", en: "..." } },
 *   },
 */
export interface SampleSite {
  name: string;
  url: string;
  trade: Bilingual<string>;
  description: Bilingual<string>;
  image?: { src: string; width: number; height: number; alt: Bilingual<string> };
}

export const sampleSites: SampleSite[] = [];
