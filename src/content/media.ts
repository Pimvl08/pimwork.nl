import type { Bilingual } from "@/i18n/config";

/**
 * Real media from Pim's projects: screenshots and screen recordings captured
 * from the actual apps, and existing images from the project folders.
 * Files live in /public/media. Each entry records where it came from.
 * Captured with scripts/capture-media.mjs; every image was checked by eye for
 * personal data before it was added.
 */

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt: Bilingual<string>;
  /** Project slug this image belongs to, if any. */
  project?: string;
  /** How the file was made, for example "Playwright screenshot of dist/ build". */
  provenance: string;
  /** Tiny base64 blur placeholder (data:image/...), optional. */
  blurDataURL?: string;
}

export interface VideoAsset {
  /** Sources in order of preference. */
  sources: { src: string; type: string }[];
  poster: string;
  width: number;
  height: number;
  durationSeconds: number;
  title: Bilingual<string>;
  description: Bilingual<string>;
  project?: string;
  provenance: string;
}

export const images: ImageAsset[] = [
  {
    src: "/media/kdp-kleurboek/character-sheet.png",
    width: 1024,
    height: 1024,
    alt: {
      nl: "Karakterblad van het kleurboek in zwarte lijnen: een konijn met sjaal, een vos met halsdoek, een beer met bril en strikje, een egel met baret en een poes met een hartje aan de halsband.",
      en: "Character sheet of the coloring book in black line art: a rabbit with a scarf, a fox with a neckerchief, a bear with glasses and a bow tie, a hedgehog with a beret and a cat with a heart on its collar.",
    },
    project: "kdp-kleurboek",
    provenance: "Existing file KDP-kleurboek/style/character-sheet.png (character sheet of the five animals)",
    blurDataURL: "data:image/jpeg;base64,/9j//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAFkAAQEAAAAAAAAAAAAAAAAAAAQHAQEBAAAAAAAAAAAAAAAAAAAAARAAAgIBBAMBAQAAAAAAAAAAAQIRIRIiAEExAxMEMkIRAQAAAAAAAAAAAAAAAAAAAAD/wAARCAAQABADARIAAhIAAxIA/9oADAMBAAIRAxEAPwCvexwzlchc/poYZmhVC+tp8qn2mIBLLpI0tfZH9A8m43RQQeb6WwxJAMZZEyus33z1ztCBh9IWFYKWEXpEzMXEcUNgH//Z",
  },
  {
    src: "/media/kdp-kleurboek/contact-sheet.jpg",
    width: 1400,
    height: 1092,
    alt: {
      nl: "Contactblad van een vervangronde: zes kleurplaten met de dieren tussen boeken, met onder elke plaat de naam en de uitkomst van de kwaliteitscontrole in aantallen kleine vlakjes.",
      en: "Contact sheet of a replacement round: six coloring plates with the animals among books, each labelled with its name and the quality check result as a count of small areas.",
    },
    project: "kdp-kleurboek",
    provenance: "Existing file KDP-kleurboek/qc/contact-sheet-vervangronde.png, top 92 px (the title line) cropped off and scaled to 1400 px with ffmpeg",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAGQAaAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAFwAAAMBAAAAAAAAAAAAAAAAAAIDBAcBAQAAAAAAAAAAAAAAAAAAAAEQAAIBBAIBBQEAAAAAAAAAAAERAhIxACEDBGEVFFFBcSIRAQAAAAAAAAAAAAAAAAAAAAD/wAARCAAMABADASIAAhEAAxEA/9oADAMBAAIRAxEAPwDWkXyE9iLkbVFAiS+APDw4gExfPAx0wyiarWd8p9jwGMiRI1Evd2X9Yz07r1Af0Kdjfn8xL//Z",
  },
  {
    src: "/media/kdp-kleurboek/plate-p05.png",
    width: 1400,
    height: 1399,
    alt: {
      nl: "Kleurplaat: de beer met bril leest een boek in een leunstoel bij de open haard, de egel met baret zit ernaast met een mok.",
      en: "Coloring plate: the bear with glasses reads a book in an armchair by the fireplace, the hedgehog in a beret sits beside it with a mug.",
    },
    project: "kdp-kleurboek",
    provenance: "Rendered from KDP-kleurboek/clean/p05.pdf to PNG (1400 px wide, grayscale) with PyMuPDF from the project's own .venv, read-only",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAFeAV3AAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAFsAAAMBAAAAAAAAAAAAAAAAAAIDBAcBAQEAAAAAAAAAAAAAAAAAAAABEAACAQQDAQEBAQAAAAAAAAABAhEDEiEEADFRQUIjIhEBAAAAAAAAAAAAAAAAAAAAAP/AABEIABAAEAMBEgACEgADEgD/2gAMAwEAAhEDEQA/ANJpbmzexJNaWxJgrgyq2WmJjEmI4inrgqn8TRF7Ehi4f6B/qOo79xyiimlt7LtaHioTlACPsqbmYz3HefOCaNtSklNAWcqCw/MEZB9iYngB/9k=",
  },
  {
    src: "/media/kdp-kleurboek/plate-p12.png",
    width: 1400,
    height: 1355,
    alt: {
      nl: "Kleurplaat: het konijn, de vos en de egel lezen tijdens een picknick op een geruit kleed onder een slinger met lampjes.",
      en: "Coloring plate: the rabbit, the fox and the hedgehog read during a picnic on a checked blanket under a string of lights.",
    },
    project: "kdp-kleurboek",
    provenance: "Rendered from KDP-kleurboek/clean/p12.pdf to PNG (1400 px wide, grayscale) with PyMuPDF from the project's own .venv, read-only",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgABGAEPAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAFkAAQEAAAAAAAAAAAAAAAAAAAUHAQEBAAAAAAAAAAAAAAAAAAAAARAAAgEEAgMBAQAAAAAAAAAAAQIREiEDQQAEUTEiFIERAQAAAAAAAAAAAAAAAAAAAAD/wAARCAAQABADARIAAhIAAxIA/9oADAMBAAIRAxEAPwCtt3GVmaqKjaMgPiAF+rR79b4L+bJlZ6gaSrspUSWCkCQAL61flFDCdySCHcLDSapFiY1Ck/y3Dk6mfDSCXCtB+QFkbFxNXjgB/9k=",
  },
  {
    src: "/media/kdp-kleurboek/qc-overlay-p02.png",
    width: 1400,
    height: 1242,
    alt: {
      nl: "Kwaliteitscontrole van een kleurplaat met een boekwinkel: de lijnen in grijs, met in rood de kleine gesloten vlakjes die te klein zijn om in te kleuren.",
      en: "Quality check of a coloring plate with a bookshop: the lines in grey, with the small closed areas that are too small to color marked in red.",
    },
    project: "kdp-kleurboek",
    provenance: "Existing file KDP-kleurboek/qc/overlay/p02.png (quality check overlay, red marks small closed areas)",
    blurDataURL: "data:image/jpeg;base64,/9j//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAF4AAQEBAAAAAAAAAAAAAAAAAAIDBwEBAQAAAAAAAAAAAAAAAAAAAAEQAAIBBAIABwEAAAAAAAAAAAERAiEDMQBBIqFxkYFhMhITEQEBAAAAAAAAAAAAAAAAAAAAEf/AABEIAA4AEAMBEgACEgADEgD/2gAMAwEAAhEDEQA/ANknfUyHzLkMe2s2pF9h9iWq+R9dCwp27n6mOyCyxmmfiuz/AIyEolxUS1V1zyB4aBa//9k=",
  },
  {
    src: "/media/offerte-pdf-generator/editor-desktop.jpg",
    width: 1800,
    height: 1125,
    alt: {
      nl: "OfferteVlot op een desktopscherm: links het formulier met de gegevens van het verzonnen bedrijf Voorbeeld Dakwerken, rechts het live A4-voorbeeld van de offerte met drie regels en een totaal van 2.165,66 euro.",
      en: "OfferteVlot on a desktop display: on the left the form with the details of the made-up company Voorbeeld Dakwerken, on the right the live A4 preview of the quote with three lines and a total of 2,165.66 euros.",
    },
    project: "offerte-pdf-generator",
    provenance: "Playwright screenshot (Chrome, 1440x900 @1.25x) of offerte-pdf-generator/dist served with npx serve -l 4175, fictional example data (Voorbeeld Dakwerken, Jan Voorbeeld), contact fields cleared",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAFcAAQEAAAAAAAAAAAAAAAAAAAQHAQEBAAAAAAAAAAAAAAAAAAAAARAAAwACAgMBAQAAAAAAAAAAAgERAwASMaGBcUFhEQEAAAAAAAAAAAAAAAAAAAAA/8AAEQgACgAQAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8AvWMWIpN31PC0ZQ6J4chJuMiHG1E6v28V8uuHrRZBEzBkKLiVGpPi/wCXraP/2Q==",
  },
  {
    src: "/media/offerte-pdf-generator/a4-preview.jpg",
    width: 800,
    height: 1239,
    alt: {
      nl: "Het live A4-voorbeeld uit OfferteVlot: een offerte van Voorbeeld Dakwerken aan Jan Voorbeeld (verzonnen gegevens) met een tabel van drie regels, korting, btw, voorwaarden en een vak om akkoord te tekenen.",
      en: "The live A4 preview from OfferteVlot: a quote from Voorbeeld Dakwerken to Jan Voorbeeld (made-up details) with a table of three lines, discount, VAT, terms and a box to sign for approval.",
    },
    project: "offerte-pdf-generator",
    provenance: "Playwright element screenshot of the live A4 preview in offerte-pdf-generator/dist (npx serve -l 4175), fictional example data (Voorbeeld Dakwerken, Jan Voorbeeld), contact fields cleared",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgABkAGdAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAGYAAAEFAQAAAAAAAAAAAAAAAAIDAQQHBQYBAQEBAAAAAAAAAAAAAAAAAAIAARAAAgEDAgUFAQAAAAAAAAAAAQIDEgARIiFBUZEEBYGSMXLhExEBAQEAAAAAAAAAAAAAAAAAABEB/8AAEQgAGAAQAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8AvdEpkkaqQ106WbKLSMaBwzx5myK1sG1rSfjJAPoDjrcJ/F9lLI0jwIzMckkcet5EUngx3KJF/ETCSlVAaoMCRyxbbddAaqjtt9vy1Fq2yD7rK3sKv//Z",
  },
  {
    src: "/media/offerte-pdf-generator/items-phone.jpg",
    width: 780,
    height: 1688,
    alt: {
      nl: "OfferteVlot op een telefoon, tab Bewerken: drie offerteregels onder elkaar, elk met omschrijving, aantal, eenheid, prijs en regeltotaal.",
      en: "OfferteVlot on a phone, Edit tab: three quote lines stacked, each with description, quantity, unit, price and line total.",
    },
    project: "offerte-pdf-generator",
    provenance: "Playwright screenshot (Chrome, 390x844 @2x) of the line items editor in offerte-pdf-generator/dist (npx serve -l 4175), fictional example data (Voorbeeld Dakwerken, Jan Voorbeeld), contact fields cleared",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAM8w0wAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAGYAAQEAAwEAAAAAAAAAAAAAAAECAAQHBgEBAQEAAAAAAAAAAAAAAAAAAQIAEAACAQMCBgIDAQAAAAAAAAABAhEABAMxQVEhEoFxMsGhYQXwIhEBAQEAAAAAAAAAAAAAAAAAAAES/8AAEQgAIgAQAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8A6aLH9xgdhhvbVVOR3QNbXGQqHctDE3XPX8DgIr0d1bJdIFyyQjLkHS+TGepDIMoyyJ1U8jvW3B2P1Q5hY3g7fwq9UnnxjtNSxhSDrB2pJPGO0/NY5/yQdSDQyxpQ3qfFI0ob1PipD//Z",
  },
];

export const videos: VideoAsset[] = [
  {
    sources: [
      { src: "/media/offerte-pdf-generator/line-item.webm", type: "video/webm" },
      { src: "/media/offerte-pdf-generator/line-item.mp4", type: "video/mp4" },
    ],
    poster: "/media/offerte-pdf-generator/line-item-poster.jpg",
    width: 1280,
    height: 800,
    durationSeconds: 15,
    title: { nl: "OfferteVlot: offerteregels typen", en: "OfferteVlot: typing quote lines" },
    description: {
      nl: "Drie offerteregels worden ingetypt en het A4-voorbeeld ernaast rekent elke regel, de korting en de btw direct mee. Alle gegevens zijn verzonnen.",
      en: "Three quote lines are typed in and the A4 preview beside them recalculates every line, the discount and the VAT straight away. All details are made up.",
    },
    project: "offerte-pdf-generator",
    provenance: "Playwright recordVideo (Chrome, 1280x800) of typing three line items in offerte-pdf-generator/dist (npx serve -l 4175), fictional example data (Voorbeeld Dakwerken, Jan Voorbeeld), contact fields cleared, transcoded with ffmpeg",
  },
];

export function imagesFor(project: string): ImageAsset[] {
  return images.filter((image) => image.project === project);
}

export function videoFor(project: string): VideoAsset | undefined {
  return videos.find((video) => video.project === project);
}
