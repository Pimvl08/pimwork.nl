import { areaServed, siteMeta } from "@/content/seo";
import { facts, person } from "@/content/person";
import { projectHref, type Project } from "@/content/projects";
import { pages } from "@/content/sections";
import type { Service } from "@/content/services";
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

function pageLabel(id: string, lang: Locale): string {
  return pages.find((page) => page.id === id)?.label[lang] ?? id;
}

function breadcrumbs(trail: { name: string; url: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  };
}

/** Home, Work (or Lab), project: the trail above a project page. */
export function projectBreadcrumbs(project: Project, lang: Locale): JsonLd {
  const base = siteUrl();
  const lab = project.section === "lab";
  return breadcrumbs([
    { name: pageLabel("home", lang), url: `${base}/${lang}` },
    { name: pageLabel(lab ? "lab" : "work", lang), url: `${base}/${lang}/${lab ? "lab" : "werk"}` },
    { name: project.name, url: `${base}${projectHref(lang, project)}` },
  ]);
}

/** Home, Services, service: the trail above a service page. */
export function serviceBreadcrumbs(service: Service, lang: Locale): JsonLd {
  const base = siteUrl();
  return breadcrumbs([
    { name: pageLabel("home", lang), url: `${base}/${lang}` },
    { name: pageLabel("services", lang), url: `${base}/${lang}/diensten` },
    { name: service.name[lang], url: `${base}/${lang}/diensten/${service.slug}` },
  ]);
}

/** A service offered by the business on the home page, in the same area. */
export function serviceData(service: Service, lang: Locale): JsonLd {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name[lang],
    serviceType: service.name[lang],
    description: service.meta.description[lang],
    url: `${base}/${lang}/diensten/${service.slug}`,
    provider: { "@id": `${base}/#business`, "@type": "ProfessionalService", name: person.brand, url: `${base}/${lang}` },
    areaServed,
  };
}

/** Serialised for a <script type="application/ld+json">, with "<" escaped so the payload can never close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
