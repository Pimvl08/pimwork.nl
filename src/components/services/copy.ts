import type { Bilingual } from "@/i18n/config";

/** Interface copy around the services: the overview, the service pages and the link from a project. */
export const servicesCopy: Bilingual<{
  title: string;
  lead: string;
  metaTitle: string;
  metaDescription: string;
  proof: string;
  back: string;
  problem: string;
  audience: string;
  how: string;
  built: string;
  example: string;
  samples: string;
  sampleLabel: string;
  visitSample: string;
  extra: string;
  contact: string;
}> = {
  nl: {
    title: "Diensten",
    lead: "Dit kan ik voor je bouwen. Bij elke dienst lees je welk probleem het oplost, hoe ik werk en welk project van mij het laat zien. Ik help bedrijven in Helmond, Laarbeek, Eindhoven en omgeving.",
    metaTitle: "Diensten: software, koppelingen en websites",
    metaDescription:
      "Software op maat, Exact Online koppelingen, offertesoftware, systemen koppelen en websites. Wat ik bouw voor bedrijven in Helmond en omgeving.",
    proof: "Gebouwd:",
    back: "Alle diensten",
    problem: "Wat het oplost",
    audience: "Voor wie",
    how: "Hoe ik werk",
    built: "Wat ik al bouwde",
    example: "Voorbeeld van mijn werk",
    samples: "Voorbeeldsites",
    sampleLabel: "Voorbeeldsite",
    visitSample: "Bekijk de voorbeeldsite",
    extra: "Handig erbij",
    contact: "Neem contact op",
  },
  en: {
    title: "Services",
    lead: "Here is what I can build for you. For each service you can read which problem it solves, how I work and which of my projects shows it in practice. I help businesses in Helmond, Laarbeek, Eindhoven and the surrounding area.",
    metaTitle: "Services: software, integrations and websites",
    metaDescription:
      "Custom software, Exact Online integrations, quoting software, connected systems and websites. What I build for businesses around Helmond, with examples.",
    proof: "Built:",
    back: "All services",
    problem: "What it solves",
    audience: "Who it is for",
    how: "How I work",
    built: "What I have built",
    example: "An example of my work",
    samples: "Sample sites",
    sampleLabel: "Sample site",
    visitSample: "View the sample site",
    extra: "Useful extra",
    contact: "Get in touch",
  },
};
