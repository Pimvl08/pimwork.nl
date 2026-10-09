import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ContactPage } from "@/components/contact/ContactPage";
import { contactCopy } from "@/components/contact/copy";
import { isLocale, type Locale } from "@/i18n/config";

interface ContactRouteProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: ContactRouteProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "nl";
  const title = contactCopy.title[locale];
  const description = contactCopy.metaDescription[locale];
  const inherited = (await parent).openGraph ?? {};
  return {
    title,
    description,
    openGraph: { ...inherited, title: `${title} | PimWork`, description, url: `/${locale}/contact` },
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { "nl-NL": "/nl/contact", "en-GB": "/en/contact", "x-default": "/nl/contact" },
    },
  };
}

/** Server time of this render, handed to the form for its timing check. */
function renderTime(): number {
  return Date.now();
}

/** Write Pim. Rendered per request: the form carries the render time for its timing check. */
export default async function ContactRoute({ params }: ContactRouteProps) {
  await connection();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <ContactPage lang={lang} renderedAt={renderTime()} />;
}
