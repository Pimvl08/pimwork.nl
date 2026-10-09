import type { Bilingual } from "@/i18n/config";

/**
 * Everything the site says about Pim himself. Only proven facts are filled
 * in. A fact with value `null` is simply not shown; fill it in to make it
 * appear. A portrait appears as soon as `portrait` points to a file in /public.
 */

export const person = {
  /** The company name shown as the brand across the site. */
  brand: "PimWork",
  /** Pim himself, used where the text is about the person. */
  name: "Pim",
  domain: "pimwork.nl",
  email: "contact@pimwork.nl",
  phone: { display: "06 15 91 37 13", href: "tel:+31615913713" },
  github: { handle: "pimdaanbram-prog", href: "https://github.com/pimdaanbram-prog" },
  portrait: null as null | { src: string; width: number; height: number; alt: Bilingual<string> },
};

export interface Fact {
  id: string;
  label: Bilingual<string>;
  value: Bilingual<string> | null;
}

/** Shown on the about page. Facts with value null are hidden. */
export const facts: Fact[] = [
  { id: "name", label: { nl: "Naam", en: "Name" }, value: { nl: "Pim van Leeuwen", en: "Pim van Leeuwen" } },
  {
    id: "builds",
    label: { nl: "Bouwt", en: "Builds" },
    value: {
      nl: "Web-apps, desktopsoftware en automatiseringen",
      en: "Web apps, desktop software and automations",
    },
  },
  {
    id: "platforms",
    label: { nl: "Voor", en: "For" },
    value: { nl: "Mac, Windows, telefoon en browser", en: "Mac, Windows, phone and browser" },
  },
  { id: "study", label: { nl: "Opleiding", en: "Education" }, value: null },
  { id: "place", label: { nl: "Woonplaats", en: "Based in" }, value: { nl: "Aarle-Rixtel", en: "Aarle-Rixtel" } },
  {
    id: "region",
    label: { nl: "Regio", en: "Area" },
    value: { nl: "Helmond, Laarbeek, Eindhoven en omgeving", en: "Helmond, Laarbeek, Eindhoven and nearby" },
  },
];

/** Shown wherever the region is named: on home, contact and the service pages. */
export const visitLine = {
  nl: "Ik woon in Aarle-Rixtel, dus langskomen kan, in overleg.",
  en: "I live in Aarle-Rixtel, so I can visit you in person, by appointment.",
} satisfies Bilingual<string>;

/** How client data is handled. Shown on the home page and the contact page. */
export const privacy = {
  title: { nl: "Jouw gegevens blijven van jou", en: "Your data stays yours" },
  body: {
    nl: [
      "De gegevens waar ik mee werk zijn vaak bedrijfsgevoelig of vallen onder de AVG. Ik ga er zorgvuldig mee om: ze blijven binnen je bedrijf, gaan niet naar derden en ik gebruik ze nergens anders voor.",
      "Een geheimhoudingsverklaring teken ik zonder discussie.",
    ],
    en: [
      "The data I work with is often commercially sensitive or covered by the GDPR. I handle it with care: it stays inside your company, is not shared with third parties and I do not use it for anything else.",
      "I sign a non-disclosure agreement without discussion.",
    ],
  },
} satisfies { title: Bilingual<string>; body: Bilingual<string[]> };

/** The about page: who Pim is and how he works. */
export const about = {
  intro: {
    nl: [
      "Ik ben Pim en ik woon in Aarle-Rixtel. Ik bouw software die werk uit handen neemt, voor bedrijven in Helmond, Laarbeek, Eindhoven en omgeving: web-apps, koppelingen tussen systemen, websites en tools voor taken die elke dag terugkomen.",
      "Ik begin altijd bij een echt probleem, vaak mijn eigen. Een trainingsapp die ik zelf elke week gebruik, een desktopapp waarmee een team zijn bestanden deelt zonder werk kwijt te raken, een tool waarmee een aannemer in een paar minuten een offerte maakt.",
    ],
    en: [
      "I'm Pim and I live in Aarle-Rixtel, near Helmond. I build software that takes work off your hands for businesses in Helmond, Laarbeek, Eindhoven and the surrounding area: web apps, links between systems, websites and tools for tasks that come back every day.",
      "I always start from a real problem, often my own. A training app I still use every week, a desktop app that lets a team share files without losing work, a tool that lets a contractor write a quote in a few minutes.",
    ],
  },
  howIWork: {
    title: { nl: "Hoe ik werk", en: "How I work" },
    lead: {
      nl: "Ik werk in kleine, gecontroleerde stappen. Zo weet je op elk moment waar je aan toe bent, en werkt wat ik oplever ook echt.",
      en: "I work in small, checked steps. That way you always know where you stand, and what I deliver actually works.",
    },
    body: {
      nl: [
        "Ik maak eerst scherp wat er precies moet gebeuren en hoe we weten dat het gelukt is. Daarna bouw ik in kleine stappen, en controleer ik elke stap met tests en door het zelf te bekijken en te gebruiken. Ik laat niets ongecontroleerd door.",
        "Zo bouwde ik TeamSync, een complete desktopapp voor Mac en Windows met een eigen sync-engine. Met tests voor de engine, voor de toegangsregels van de database en voor twee laptops die tegelijk werken.",
      ],
      en: [
        "I first make it sharp what exactly needs to happen and how we will know it worked. Then I build in small steps, and check every step with tests and by looking at it and using it myself. I never let anything through unchecked.",
        "That is how I built TeamSync, a complete desktop app for Mac and Windows with its own sync engine. With tests for the engine, for the database access rules, and for two laptops working at the same time.",
      ],
    },
    principles: [
      {
        title: { nl: "Eerst het probleem", en: "The problem first" },
        body: {
          nl: "Wat moet er beter, voor wie, en hoe weet je dat het gelukt is? Pas daarna bouwen.",
          en: "What needs to get better, for whom, and how do you know it worked? Only then build.",
        },
      },
      {
        title: { nl: "Kleine, werkende stappen", en: "Small, working steps" },
        body: {
          nl: "Elke stap moet werken voordat de volgende begint. Zo blijft het overzichtelijk en is er altijd iets dat je kunt laten zien.",
          en: "Every step has to work before the next one starts. That keeps it clear and there is always something to show.",
        },
      },
      {
        title: { nl: "Testen in plaats van hopen", en: "Testing instead of hoping" },
        body: {
          nl: "Automatische tests, en daarnaast alles zelf gebruiken op telefoon en laptop, in licht en donker.",
          en: "Automated tests, plus using everything myself on phone and laptop, in light and dark.",
        },
      },
      {
        title: { nl: "Veilig en zorgvuldig", en: "Secure and careful" },
        body: {
          nl: "Geen sleutels in de code, toegangsregels in de database, en niets opnemen of bewaren zonder toestemming.",
          en: "No keys in the code, access rules in the database, and nothing recorded or stored without consent.",
        },
      },
    ],
  },
} satisfies {
  intro: Bilingual<string[]>;
  howIWork: {
    title: Bilingual<string>;
    lead: Bilingual<string>;
    body: Bilingual<string[]>;
    principles: { title: Bilingual<string>; body: Bilingual<string> }[];
  };
};
