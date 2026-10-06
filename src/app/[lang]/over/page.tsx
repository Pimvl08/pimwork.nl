import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AboutPage } from "@/components/about/AboutPage";
import { aboutCopy } from "@/components/about/copy";
import { isLocale, type Locale } from "@/i18n/config";

interface AboutRouteProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: AboutRouteProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "nl";
  const title = aboutCopy.meta.title[locale];
  const description = aboutCopy.meta.description[locale];
  // Keep the site's Open Graph image, locale and site name.
  const inherited = (await parent).openGraph ?? {};
  return {
    title,
    description,
    openGraph: { ...inherited, title: `${title} | PimWork`, description, url: `/${locale}/over` },
    alternates: {
      canonical: `/${locale}/over`,
      languages: { "nl-NL": "/nl/over", "en-GB": "/en/over", "x-default": "/nl/over" },
    },
  };
}

/** Who Pim is and how he works. Rendered per request for the CSP nonce. */
export default async function AboutRoute({ params }: AboutRouteProps) {
  await connection();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <AboutPage lang={lang} />;
}
