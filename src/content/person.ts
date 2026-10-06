import type { Bilingual } from "@/i18n/config";

/**
 * Everything the site says about Pim himself. Only proven facts are filled
 * in. A fact with value `null` is simply not shown; fill it in to make it
 * appear. A portrait appears as soon as `portrait` points to a file in /public.
 */

export const person = {
  name: "Pim",
  email: "pvanleeuwen08@icloud.com",
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
  { id: "place", label: { nl: "Woonplaats", en: "Based in" }, value: null },
];

/** What Pim can build for others, each backed by a real project. */
export interface Service {
  id: string;
  title: Bilingual<string>;
  body: Bilingual<string>;
  /** Project slugs that prove it. */
  proof: string[];
}

export const services: Service[] = [
  {
    id: "web-apps",
    title: { nl: "Web-apps die mensen echt gebruiken", en: "Web apps people actually use" },
    body: {
      nl: "Een app die werkt op telefoon en laptop, ook zonder internet, en die je installeert als een gewone app. Snel, overzichtelijk en in het Nederlands.",
      en: "An app that works on phone and laptop, even without internet, and installs like a regular app. Fast, clear and in your language.",
    },
    proof: ["strength-tracker"],
  },
  {
    id: "desktop",
    title: { nl: "Software voor teams", en: "Software for teams" },
    body: {
      nl: "Desktopsoftware voor Mac en Windows die samenwerken makkelijker maakt, met veilige opslag in de cloud en zonder dat iemand werk kwijtraakt.",
      en: "Desktop software for Mac and Windows that makes working together easier, with secure cloud storage and without anyone losing work.",
    },
    proof: ["teamsync"],
  },
  {
    id: "tools",
    title: { nl: "Tools die saai werk overnemen", en: "Tools that take over boring work" },
    body: {
      nl: "Komt iets elke dag terug, zoals een offerte maken of een formulier invullen? Dan bouw ik er een tool voor die het in een fractie van de tijd doet.",
      en: "Does something come back every day, like writing a quote or filling in a form? Then I build a tool that does it in a fraction of the time.",
    },
    proof: ["offerte-pdf-generator", "belhulp"],
  },
  {
    id: "ai",
    title: { nl: "AI waar het iets oplevert", en: "AI where it pays off" },
    body: {
      nl: "Geen chatbot om de chatbot, maar AI op de plek waar het tijd bespaart: gesprekken uitschrijven, gegevens invullen, beelden omzetten naar drukwerk. Met controles, zodat het klopt.",
      en: "Not a chatbot for the sake of it, but AI where it saves time: transcribing calls, filling in data, turning images into print. With checks, so it is right.",
    },
    proof: ["belhulp", "kdp-kleurboek"],
  },
];

/** The about page: who Pim is and how he works. */
export const about = {
  intro: {
    nl: [
      "Ik ben Pim. Ik bouw software die werk uit handen neemt: web-apps, desktopsoftware en tools voor taken die elke dag terugkomen.",
      "Ik begin altijd bij een echt probleem, vaak mijn eigen. Een trainingsapp die ik zelf elke week gebruik, een desktopapp waarmee een team zijn bestanden deelt zonder werk kwijt te raken, een tool waarmee een aannemer in een paar minuten een offerte maakt.",
    ],
    en: [
      "I'm Pim. I build software that takes work off your hands: web apps, desktop software and tools for tasks that come back every day.",
      "I always start from a real problem, often my own. A training app I still use every week, a desktop app that lets a team share files without losing work, a tool that lets a contractor write a quote in a few minutes.",
    ],
  },
  howIWork: {
    title: { nl: "Hoe ik werk", en: "How I work" },
    lead: {
      nl: "Ik bouw met AI-tools, vooral Claude Code. Dat maakt me snel, maar het verschil zit in hoe je ze inzet.",
      en: "I build with AI tools, mostly Claude Code. That makes me fast, but the difference is in how you use them.",
    },
    body: {
      nl: [
        "Een AI-tool schrijft code die er overtuigend uitziet, ook als hij niet klopt. Daarom laat ik nooit iets ongecontroleerd door. Ik maak eerst scherp wat er precies moet gebeuren, laat het in kleine stappen bouwen, en controleer elke stap met tests en door het zelf te bekijken en te gebruiken.",
        "Zo bouwde ik TeamSync, een complete desktopapp voor Mac en Windows met een eigen sync-engine. Met tests voor de engine, voor de toegangsregels van de database en voor twee laptops die tegelijk werken.",
      ],
      en: [
        "An AI tool writes code that looks convincing, even when it is wrong. That is why I never let anything through unchecked. I first make it sharp what exactly needs to happen, have it built in small steps, and check every step with tests and by looking at it and using it myself.",
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
