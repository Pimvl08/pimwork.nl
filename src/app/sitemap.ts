import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { locales } from "@/i18n/config";
import { siteUrl } from "@/lib/site";

/** Home and every project page, in both languages, each pointing at its twin. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths = ["", ...projects.map((project) => `/werk/${project.slug}`)];

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(locales.map((lang) => [lang, `${base}/${lang}${path}`]));
    return locales.map((lang) => ({
      url: `${base}/${lang}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: { languages },
    }));
  });
}
