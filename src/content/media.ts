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
    src: "/media/strength-tracker/login-desktop.jpg",
    width: 1800,
    height: 1125,
    alt: {
      nl: "Inlogscherm van Strength Tracker op een desktopscherm: een oranje bliksemlogo, het woord STRENGTH en een donker formulier met velden voor e-mail en wachtwoord en een oranje knop Inloggen.",
      en: "Strength Tracker login screen on a desktop display: an orange lightning logo, the word STRENGTH and a dark form with email and password fields and an orange log in button.",
    },
    project: "strength-tracker",
    provenance: "Playwright screenshot (Chrome, 1440x900 @1.25x) of the public login screen at https://strengttracker.netlify.app",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAFoAAQEBAAAAAAAAAAAAAAAAAAEDBwEBAQAAAAAAAAAAAAAAAAAAAAIQAAEEAgMBAAAAAAAAAAAAAAECAwASMlFBIWEREQEBAQEAAAAAAAAAAAAAAAAAESFB/8AAEQgACgAQAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8AxJpJW4kVt3jvyLqS24oFNSDjr7xImEdVcf/Z",
  },
  {
    src: "/media/strength-tracker/login-phone.jpg",
    width: 780,
    height: 1688,
    alt: {
      nl: "Hetzelfde inlogscherm van Strength Tracker op een telefoon, met het formulier over de volle breedte.",
      en: "The same Strength Tracker login screen on a phone, with the form spanning the full width.",
    },
    project: "strength-tracker",
    provenance: "Playwright screenshot (Chrome, 390x844 @2x) of the public login screen at https://strengttracker.netlify.app",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAM8w0wAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAG4AAQEAAwEAAAAAAAAAAAAAAAIBAwQHBQEBAQAAAAAAAAAAAAAAAAAAAgQQAAICAgEDBAMBAAAAAAAAAAECAxEABCEFEkETJIFxMmFSkREAAQMDBQEBAAAAAAAAAAAAERIxAAIBUTIhcQMTBCL/wAARCAAiABADASIAAhEAAxEA/9oADAMBAAIRAxEAPwDjGrDJtTJDHy7kKtmuT+8ezBJqzSQycPGe1gDfP3jh2fSC+3hJAruIbuv+rDDnLNteqG9vCpYfkA1g3dglyb8c3gFaifyGG5yZQqlAF1FzsMDMxIrlRSv8KTlaNwpJVgK8is29frO/rRrHFMUVOFAC8f6Mez1zqOzE8Umwzo4pgVQWPgXhv7nT1guqojhLxJ+dOvtUGRSDytp4uE4sJyi8ln//2Q==",
  },
  {
    src: "/media/capcraft/home-desktop-dark.jpg",
    width: 1800,
    height: 1125,
    alt: {
      nl: "Homepage van CapCraft in het donkere thema: de kop 'Custom petten, gemaakt van de beste materialen' naast een grote foto van iemand met een groene bucket hat.",
      en: "CapCraft home page in the dark theme: the headline 'Custom petten, gemaakt van de beste materialen' beside a large photo of someone wearing a green bucket hat.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 1440x900 @1.25x, theme dark) of / in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAF4AAQEBAAAAAAAAAAAAAAAAAAYEBwEBAQAAAAAAAAAAAAAAAAAAAgMQAAIBBAICAwEAAAAAAAAAAAECAyERBAASMSITYUEjFBEAAwEAAAAAAAAAAAAAAAAAAAERAv/AABEIAAoAEAMBIgACEQADEQD/2gAMAwEAAhEDEQA/AMtkmmjiUs+UrMgZSZJK/I8+ttAyHw2nSTI/MjmTK9RxrbytSlOzfTeopJpf4Snsfie15GxoPq9tLKZVp//Z",
  },
  {
    src: "/media/capcraft/home-phone-light.jpg",
    width: 780,
    height: 1688,
    alt: {
      nl: "Homepage van CapCraft op een telefoon in het lichte thema: de kop, de introductietekst en twee knoppen onder elkaar op crèmekleurig papier.",
      en: "CapCraft home page on a phone in the light theme: the headline, the introduction and two buttons stacked on cream paper.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 390x844 @2x, theme light) of / in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAM8w0wAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAG8AAAMBAQAAAAAAAAAAAAAAAAMEBQYIAQEBAQAAAAAAAAAAAAAAAAADAgQQAAIABQICBwkBAAAAAAAAAAECBAMAEQUSMSGzJBMiNXRSBjLhsdHBkkJxYVERAQEBAQEAAAAAAAAAAAAAAAABEWFB/8AAEQgAIgAQAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8A3JweBDEGDhP6Cij30WXgMDMvogIQ23AQVSeGXUx1P7RP4Gxuf9X40WHliU5IZzq4cdP0UUW3rQhxUJ6mM+aZMfALLLsZamEYlUJ7IJ6trkDc6jc1roeU6yZXWlGmhFEx0XQrPbtFVPEAnYUUObkMQOJ8u33miBh51P6t8zVDcqZQk5OLJN+kxPONKQJIy+MsSOlw/NWmsn3nF+JiucaUgu98Z4uH5q1MD6//2Q==",
  },
  {
    src: "/media/capcraft/products-desktop-light.jpg",
    width: 1800,
    height: 1125,
    alt: {
      nl: "Collectiepagina van CapCraft in het lichte thema: de kop 'Veertien modellen, allemaal even lang uitgewerkt', filters per model aan de linkerkant en een raster met petten.",
      en: "CapCraft collection page in the light theme: the headline 'Veertien modellen, allemaal even lang uitgewerkt', model filters on the left and a grid of caps.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 1440x900 @1.25x, theme light) of /products in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAGIAAQEAAAAAAAAAAAAAAAAAAAUHAQEAAAAAAAAAAAAAAAAAAAADEAACAQMEAQUBAAAAAAAAAAABAgMRIQAEEjEFMjNhFLEiBhEBAAEFAQAAAAAAAAAAAAAAAQAhEWGhkXH/wAARCAAKABADASIAAhEAAxEA/9oADAMBAAIRAxEAPwCw/Eg3eEQBJsIY/vZbCoe16CeSOKJ9LI8jmJFWCpLilR6XuKsfzfnFNczLCCpIO9bg0Nzkc/kwHmqwDFdaKE3IunFeMNbC+biFUMLyf//Z",
  },
  {
    src: "/media/capcraft/product-desktop-dark.jpg",
    width: 1800,
    height: 1125,
    alt: {
      nl: "Productpagina van de Donk Baseball Cap in het donkere thema: een grote foto van een donkere pet op een stoel, de prijs van 59,95 euro, keuze voor kleur en maat en een knop om in de winkelwagen te leggen.",
      en: "Product page of the Donk Baseball Cap in the dark theme: a large photo of a dark cap on a chair, the price of 59.95 euros, colour and size options and an add to cart button.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 1440x900 @1.25x, theme dark) of /products/donk-baseball-cap in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAF8AAQEAAAAAAAAAAAAAAAAAAAUGAQEAAAAAAAAAAAAAAAAAAAADEAADAAIBBAIDAQAAAAAAAAABAwIRBAASUUExITIUEyJhEQACAwEAAAAAAAAAAAAAAAABAgARYSH/wAARCAAKABADASIAAhEAAxEA/9oADAMBAAIRAxEAPwCF09Vm+tLQ3aWuF1+64Y1tFgr6mCyekYBIIIHJxrduKwWbMHAODbfIyD9u3zxHS3NpKFQt7lyGGumGXM9WfeAQM/7wX8rYmCoOaFnIMC6EHPv+c4+fPfhKTZyK1c0T/9k=",
  },
  {
    src: "/media/capcraft/product-phone-dark.jpg",
    width: 780,
    height: 1688,
    alt: {
      nl: "Productpagina van de Donk Baseball Cap op een telefoon in het donkere thema: de productfoto met drie miniaturen eronder en de productnaam.",
      en: "Product page of the Donk Baseball Cap on a phone in the dark theme: the product photo with three thumbnails below it and the product name.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 390x844 @2x, theme dark) of /products/donk-baseball-cap in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAM8w0wAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAGoAAQEBAQAAAAAAAAAAAAAAAAYDBAABAQEBAAAAAAAAAAAAAAAAAAQBAxAAAgIBBAEEAwEBAAAAAAAAAQIDEQQhAAUSMSIyQQYTUXEVFBEAAgIDAQEBAAAAAAAAAAAAAREAAgMS8GEiIf/AABEIACIAEAMBIgACEQADEQD/2gAMAwEAAhEDEQA/AAD899kiiEjZudEhAqRmkANjSiRRvcB9i+wspZeRzHGtsGah+/jdebbKyZOLxchWK/8APAVcEAOjIoWj7QUAo3re0H+FxWLBPlHJaGNYJESKy0uTL0NEKPChq7saUeBuAuuwIU1LrbUuIOG4ufLixDkoMeHrEg/L65HUxggxrYPU/El+mk09JvPNxC5cGWuOrs0MM02RO7Fo40VGZYwTrJI/yTQXwBQvYluV/FjQgRz0qddcgHUgV1VWJCitARpezsmfkMvVJJY1Ip1WSQK+leodqOmmuyjCbEM/ILXGItl8/Unwc7u4VaZhp+zvLJ7ju58L/Nwk920iEM//2Q==",
  },
  {
    src: "/media/capcraft/products-phone-dark.jpg",
    width: 780,
    height: 1688,
    alt: {
      nl: "Collectiepagina van CapCraft op een telefoon in het donkere thema: de kop, knoppen voor filteren en sorteren en de eerste pet uit het raster.",
      en: "CapCraft collection page on a phone in the dark theme: the headline, filter and sort buttons and the first cap of the grid.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 390x844 @2x, theme dark) of /products in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAM8w0wAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAG4AAQADAQAAAAAAAAAAAAAAAAUEAwYIAQEBAQAAAAAAAAAAAAAAAAAAAgMQAAEDAwIEBQUBAAAAAAAAAAECBAMRBQCzBnQhQRNRNWESMjGxsoI0cREAAgMBAQEAAAAAAAAAAAAAAQBxAjGxEVH/wAARCAAiABADASIAAhEAAxEA/9oADAMBAAIRAxEAPwDAC/7i9oIfuhUCh73iP9yMvcm4IzRVydVPhKD+NcHDlQSB3OgHxT0/XIshQqqq1UfQD7ADDfp+uub7RvjlEZjbRkSIStNZkJqlSQoE1VQVBHKuWuNkX+CGWZbSNKIkKkXRxEohKASoge+p5D6Z0ZZZI5bayoQShq2Qr0PZRyy69UTbH1OrNzpKwjBTLDyatuEa6CMRvnlD7hnGkrDrD/K24RroIxK+eUPuGn0lZnXDJ6raIHH/2Q==",
  },
  {
    src: "/media/capcraft/home-desktop-light.jpg",
    width: 1800,
    height: 1125,
    alt: {
      nl: "Homepage van CapCraft in het lichte thema: dezelfde opbouw als in het donker, nu met donkere tekst op crèmekleurig papier.",
      en: "CapCraft home page in the light theme: the same layout as in the dark, now with dark text on cream paper.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 1440x900 @1.25x, theme light) of / in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAFsAAQAAAAAAAAAAAAAAAAAAAAcBAQAAAAAAAAAAAAAAAAAAAAMQAAIBAwQCAwEAAAAAAAAAAAIDAREFABITIkEEMmExFCERAQEBAAAAAAAAAAAAAAAAAAABEf/AABEIAAoAEAMBIgACEQADEQD/2gAMAwEAAhEDEQA/AFpSkscUCHikInInELXx+J4feEHh3C4Pu0CJCaYuGwQklOiVEyR40XHrFNNJr3jtGG9lQnZRO0uv6Zmuga/xkU66wyya/9k=",
  },
  {
    src: "/media/capcraft/products-desktop-dark.jpg",
    width: 1800,
    height: 1125,
    alt: {
      nl: "Collectiepagina van CapCraft in het donkere thema: filters per model en kleur aan de linkerkant en petten met labels als Bestseller en Nieuw.",
      en: "CapCraft collection page in the dark theme: model and colour filters on the left and caps tagged Bestseller and Nieuw.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 1440x900 @1.25x, theme dark) of /products in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAGIAAAMBAAAAAAAAAAAAAAAAAAQFBgcBAQAAAAAAAAAAAAAAAAAAAAIQAQABAwUAAgMBAAAAAAAAAAECAwURIQQxABIGIjMUUhMRAQACAwEAAAAAAAAAAAAAAAERAGGhcZH/wAARCAAKABADASIAAhEAAxEA/9oADAMBAAIRAxEAPwDM9hRulzZ09nT3G4nTp+5+a8zzH+n1UDnq7Nwwv+m40FcVZugZXSToHLx23+DSlHcXFio/qGo4fyHRLaE7bc2QSY0DC6p9ZcZ46FgXm6wlDC+X/9k=",
  },
  {
    src: "/media/capcraft/product-desktop-light.jpg",
    width: 1800,
    height: 1125,
    alt: {
      nl: "Productpagina van de Donk Baseball Cap in het lichte thema, met dezelfde foto, prijs en keuzes als in het donker.",
      en: "Product page of the Donk Baseball Cap in the light theme, with the same photo, price and options as in the dark.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 1440x900 @1.25x, theme light) of /products/donk-baseball-cap in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAGIAAAMBAAAAAAAAAAAAAAAAAAAEBQcBAQAAAAAAAAAAAAAAAAAAAAMQAAIBAgcAAwEAAAAAAAAAAAECAwQREgBBBRMxIVFxMiMRAQACAwEAAAAAAAAAAAAAAAERACFBAmH/wAARCAAKABADASIAAhEAAxEA/9oADAMBAAIRAxEAPwC3vNVuFPuvBBwxU8aB5CtHTzuS7XVCCgwjB+SD9nOjRRUjqCIqdgSQP5xaEgiwXQ+ZZlhiZ42aNGOIG5UE3Xo3I7GnxkNNTvJytDE0lwcZRS9x0cRF/NPciKz5W6jEbL//2Q==",
  },
  {
    src: "/media/capcraft/home-phone-dark.jpg",
    width: 780,
    height: 1688,
    alt: {
      nl: "Homepage van CapCraft op een telefoon in het donkere thema: de kop met een onderstreepte regel, de introductietekst en de knoppen naar de collectie.",
      en: "CapCraft home page on a phone in the dark theme: the headline with an underlined line, the introduction and the buttons to the collection.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 390x844 @2x, theme dark) of / in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAM8w0wAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAGoAAAMBAQAAAAAAAAAAAAAAAAQFAwYCAQEBAAAAAAAAAAAAAAAAAAADAhAAAgAEBAQFBQEAAAAAAAAAAQIDBAARIRIxUbEyBYETIgZB4cFxcvBhQhEBAQEBAAAAAAAAAAAAAAAAAAERQf/AABEIACIAEAMBIgACEQADEQD/2gAMAwEAAhEDEQA/AMavXevlQVnZwf0OT8VF/UHXofNPzYvu5FLkmWygZU5QP944DZuFSmIhioBlUZccM31Y1B9OpWb9NCBCEWQnmiBFERhNKAzgeYgeItgToLCwrJTERGjRPCDpCLsYau2dlS/lDMMCQNTUWCWFthvr3UVwbewI/ftViOoYFoWA0PEULNgZkwHvRcLSF+J4ihZvmTvRQfX/2Q==",
  },
  {
    src: "/media/capcraft/products-phone-light.jpg",
    width: 780,
    height: 1688,
    alt: {
      nl: "Collectiepagina van CapCraft op een telefoon in het lichte thema: de kop, knoppen voor filteren en sorteren en een witte pet met de labels Bestseller en Aanbieding.",
      en: "CapCraft collection page on a phone in the light theme: the headline, filter and sort buttons and a white cap tagged Bestseller and Aanbieding.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 390x844 @2x, theme light) of /products in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAM8w0wAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAGwAAQEBAQAAAAAAAAAAAAAAAAUEAwcBAQEBAAAAAAAAAAAAAAAAAAECAxAAAgAEBAYCAwEAAAAAAAAAAQIRAwAEIUGxMTIFE4FyYQYSgjRCUREAAgMAAwEAAAAAAAAAAAAAAAFxEQIhsTIx/8AAEQgAIgAQAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8A6IeQ/HgxBsbUwJBHR97bVvL+OcgmCK8utQP8MojWFMG2UsT08yeJs/yqmWHWCwgo9k6kmps0swF3am4MgTkM4Exl/wBCAiRtkMavXHDeo16Eya7KELIfox+oDA54wjVLQV1hmDTXAOAyVhd3HbQUk/CvkKNlftz+2gpJ+FfIVGfLl9jr6oR//9k=",
  },
  {
    src: "/media/capcraft/product-phone-light.jpg",
    width: 780,
    height: 1688,
    alt: {
      nl: "Productpagina van de Donk Baseball Cap op een telefoon in het lichte thema: de productfoto, drie miniaturen en de productnaam.",
      en: "Product page of the Donk Baseball Cap on a phone in the light theme: the product photo, three thumbnails and the product name.",
    },
    project: "capcraft",
    provenance: "Playwright screenshot (Chrome, 390x844 @2x, theme light) of /products/donk-baseball-cap in capcraft/dist served with: npx serve -s capcraft/dist -l 4174",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAM8w0wAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAG8AAQADAQEAAAAAAAAAAAAAAAQFBgcBAgEBAQEAAAAAAAAAAAAAAAAABAMCEAACAQMCBQQDAQAAAAAAAAABAgMEERIABTEhEyJBMnEGFNFhURURAAICAwADAQAAAAAAAAAAAAERAAIhEvATYSID/8AAEQgAIgAQAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8AvVRtnxSluaiLbYwDYiQxIL34dzDXmCi+HVJUQx7U5Y4qqPE1yfAxc8zrHfmjVVRvMdLUKxXqMVcEAOjNZbH0goBY35399T+zbFtVLXU1UaloY1liRIrlpamXIWso4KGtmxso4DWQXXYHEtZ1tqXLB/mT1e4y/ZQU8P2njHU75HUsSOmtwcT4kv22Tl2m59s2lKuviWnDs8EqTVEzMWjjRWyWME85JH8k2C8ALC+tBpqecTVAatkmykLqsiyWiGZOKMwtiLgAA+NStFTSUvVzdGzbIYKVA9/3+NF8Rscn5Ba4y9v19ZSfBzuClmuqnn/BpcfpGjji3vpEfp0iGn//2Q==",
  },
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
  {
    src: "/media/paletteforge/landing-desktop.jpg",
    width: 1040,
    height: 880,
    alt: {
      nl: "Uitsnede van de landingspagina van PaletteForge: de kop 'Forge perfect color systems', een korte uitleg en de live demo, een balk van vijf paarse en blauwe kleurvlakken met de knop Genereer nieuw.",
      en: "Crop of the PaletteForge landing page: the headline 'Forge perfect color systems', a short explanation and the live demo, a bar of five purple and blue swatches with the Genereer nieuw button.",
    },
    project: "paletteforge",
    provenance: "Playwright screenshot (Chrome, 1440x900 @1.25x) of the landing page with the live palette demo, cropped to the hero (x 0, y 70, 1040x880 px) with ffmpeg; paletteforge production build started with: npx next start -p 4176",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAWwBYAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAGcAAAMBAAAAAAAAAAAAAAAAAAQFBgcBAQEAAAAAAAAAAAAAAAAAAAIEEAABBAEEAQUBAAAAAAAAAAABAgMEESEAMRIFMhORcWJBUREBAQACAgMBAAAAAAAAAAAAAQIRAHEDEpFhIf/AABEIAA4AEAMBIgACEQADEQD/2gAMAwEAAhEDEQA/ANkfjy1vKcQ/xRgBBRyA2sk3ftWj4qXkI4uqCzeCBxFfzKlan2ermsGl9nIesHyv9I+x202gRX46R6klb+D575PydtUXMSPj2zfE0Z9mi1m5CWxzmhAnkf1z83//2Q==",
  },
  {
    src: "/media/paletteforge/templates-desktop.jpg",
    width: 1800,
    height: 720,
    alt: {
      nl: "Uitsnede van de templatepagina van PaletteForge: een zoekbalk met categoriefilters en een raster van twaalf paletten zoals Aurora Borealis, Sunset Horizon en Ocean Depth, elk met een knop om de CSS te kopiëren.",
      en: "Crop of the PaletteForge templates page: a search bar with category filters and a grid of twelve palettes such as Aurora Borealis, Sunset Horizon and Ocean Depth, each with a button to copy the CSS.",
    },
    project: "paletteforge",
    provenance: "Playwright screenshot (Chrome, 1440x900 @1.25x) of /producten (palette templates), cropped to the search bar and template grid (y 140, 1800x720 px) with ffmpeg; paletteforge production build started with: npx next start -p 4176",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAADwAQAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAGMAAAMBAAAAAAAAAAAAAAAAAAECBQcBAQEAAAAAAAAAAAAAAAAAAAABEAADAAEEAwEBAAAAAAAAAAACAQMEABEhEkEzc4ExEQACAgIDAQAAAAAAAAAAAAABEVEhADGxQQID/8AAEQgABgAQAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8A0nFw6sd01Ce/MBoVRa+tJjRcpfzThj1OLPqAEDbgKqZDN+X2c0y344MS28aq4vr0Jel/un2JCRXOp3k780LosAzOf//Z",
  },
  {
    src: "/media/paletteforge/landing-phone.jpg",
    width: 780,
    height: 1688,
    alt: {
      nl: "Landingspagina van PaletteForge op een telefoon: de kop, de uitleg en de demobalk met vijf kleurvlakken.",
      en: "PaletteForge landing page on a phone: the headline, the explanation and the demo bar with five swatches.",
    },
    project: "paletteforge",
    provenance: "Playwright screenshot (Chrome, 390x844 @2x) of the landing page; paletteforge production build started with: npx next start -p 4176",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAM8w0wAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAoKCwoLDQ0NDQ0NEA8QEBAQEBAQEBAQEBISEhUVFRISEhAQEhIUFBUVFxcXFRUVFRcXGRkZHh4cHCMjJCsrM//EAHUAAQADAQEAAAAAAAAAAAAAAAMEBQEABwEBAQEAAAAAAAAAAAAAAAAAAwQCEAABAwMBBwMFAQAAAAAAAAABAgMRAAQhMVETBSJhoYEjEnGRsQZSFUERAAEDBAIDAQAAAAAAAAAAAAECAAMRYRIEIhPBkVEh/8AAEQgAIgAQAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8A9We4i3b3KmfVPtJkh9uEpAklSV5EZxmnY4mw+6hsPGVGAN42ZOzlTP0NWzu8EwTHioIU57skxTj9v7ZLkxs6dr8msbzlbTcJJVAJQj5/c0jfFLdx1bXqlSMklKQOyutT/wCdYNqWoN2qNkIAKVdYOe1ImytC4FpFvmJgcx6SFjuKoUvWrwjkAusHw87Ma5AnpKUGvLMZVHwMyy0ZJbQScklIknbprXblpJCg2gHWQkTO2Y1pf88VqtB8H71E2f8A/9k=",
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
  {
    sources: [
      { src: "/media/capcraft/home-scroll.webm", type: "video/webm" },
      { src: "/media/capcraft/home-scroll.mp4", type: "video/mp4" },
    ],
    poster: "/media/capcraft/home-scroll-poster.jpg",
    width: 1280,
    height: 800,
    durationSeconds: 14,
    title: { nl: "CapCraft: door de homepage scrollen", en: "CapCraft: scrolling the home page" },
    description: {
      nl: "Een opname van de homepage in het donkere thema: de introductie, de uitgelichte modellen, de collectie en het verhaal over hoe de petten gemaakt worden.",
      en: "A recording of the home page in the dark theme: the introduction, the featured models, the collection and the story of how the caps are made.",
    },
    project: "capcraft",
    provenance: "Playwright recordVideo (Chrome, 1280x800) of scrolling the home page of capcraft/dist served with npx serve, transcoded with ffmpeg",
  },
  {
    sources: [
      { src: "/media/paletteforge/generate.webm", type: "video/webm" },
      { src: "/media/paletteforge/generate.mp4", type: "video/mp4" },
    ],
    poster: "/media/paletteforge/generate-poster.jpg",
    width: 720,
    height: 680,
    durationSeconds: 13,
    title: { nl: "PaletteForge: paletten genereren", en: "PaletteForge: generating palettes" },
    description: {
      nl: "Zeven keer op Genereer nieuw: de demo op de landingspagina laat telkens een nieuw palet van vijf kleuren zien.",
      en: "Seven clicks on Genereer nieuw: the demo on the landing page shows a new palette of five colours each time.",
    },
    project: "paletteforge",
    provenance: "Playwright recordVideo (Chrome, 1280x800) of clicking Genereer nieuw on the landing page, cropped to the hero and palette demo (720x680 at x 0, y 60) with ffmpeg; paletteforge production build started with: npx next start -p 4176",
  },
];

export function imagesFor(project: string): ImageAsset[] {
  return images.filter((image) => image.project === project);
}

export function videoFor(project: string): VideoAsset | undefined {
  return videos.find((video) => video.project === project);
}
