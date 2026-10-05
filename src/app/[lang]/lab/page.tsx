import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { LabPage } from "@/components/lab/LabPage";
import { labCopy } from "@/components/lab/copy";
import { isLocale, type Locale } from "@/i18n/config";

interface LabRouteProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: LabRouteProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "nl";
  const title = labCopy.title[locale];
  const description = labCopy.lead[locale];
  const inherited = (await parent).openGraph ?? {};
  return {
    title,
    description,
    openGraph: { ...inherited, title: `${title} | Pim`, description, url: `/${locale}/lab` },
    alternates: {
      canonical: `/${locale}/lab`,
      languages: { "nl-NL": "/nl/lab", "en-GB": "/en/lab", "x-default": "/nl/lab" },
    },
  };
}

/** The five browser experiments, for the curious. */
export default async function LabRoute({ params }: LabRouteProps) {
  await connection();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <LabPage lang={lang} />;
}
