import { areaServed, siteMeta } from "@/content/seo";
import { facts, person } from "@/content/person";
import type { Project } from "@/content/projects";
import { pages } from "@/content/sections";
import type { Locale } from "@/i18n/config";
import { siteUrl } from "@/lib/site";

type JsonLd = Record<string, unknown>;

/** The full name from the about page facts, so it is written down in one place. */
function founderName(): string {
  return facts.find((fact) => fact.id === "name")?.value?.nl ?? person.name;
}

/** The business on the home page. Deliberately without an address. */
export function professionalService(lang: Locale): JsonLd {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${base}/#business`,
    name: person.brand,
    url: `${base}/${lang}`,
    logo: `${base}/apple-icon`,
    image: `${base}/apple-icon`,
    description: siteMeta.description[lang],
    telephone: person.phone.href.replace(/^tel:/, ""),
    email: person.email,
    areaServed,
    founder: { "@type": "Person", name: founderName(), url: `${base}/${lang}/over` },
    sameAs: [person.github.href],
  };
}

/** Home, Work, project: the trail above a project page. */
export function projectBreadcrumbs(project: Project, lang: Locale): JsonLd {
  const base = siteUrl();
  const label = (id: string) => pages.find((page) => page.id === id)?.label[lang] ?? id;
  const trail = [
    { name: label("home"), url: `${base}/${lang}` },
    { name: label("work"), url: `${base}/${lang}/werk` },
    { name: project.name, url: `${base}/${lang}/werk/${project.slug}` },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  };
}

/** Serialised for a <script type="application/ld+json">, with "<" escaped so the payload can never close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
