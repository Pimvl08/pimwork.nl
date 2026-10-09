import type { MetadataRoute } from "next";
import { projectHref, projects } from "@/content/projects";
import { pages } from "@/content/sections";
import { services } from "@/content/services";
import { defaultLocale, htmlLang, locales } from "@/i18n/config";
import { siteUrl } from "@/lib/site";

/**
 * Every page, every service page and every project page, in both languages, each pointing at its
 * twin. The language codes match the hreflang links on the pages themselves.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths = [
    ...pages.map((page) => page.path),
    ...services.map((service) => `/diensten/${service.slug}`),
    // projectHref gives /<lang>/werk/<slug> or /<lang>/lab/<slug>; the path is the part after the language.
    ...projects.map((project) => projectHref("", project).slice(1)),
  ];

  return paths.flatMap((path) => {
    const languages = {
      ...Object.fromEntries(locales.map((lang) => [htmlLang[lang], `${base}/${lang}${path}`])),
      "x-default": `${base}/${defaultLocale}${path}`,
    };
    return locales.map((lang) => ({
      url: `${base}/${lang}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path.startsWith("/diensten") ? 0.9 : path.split("/").length > 2 ? 0.7 : 0.8,
      alternates: { languages },
    }));
  });
}
