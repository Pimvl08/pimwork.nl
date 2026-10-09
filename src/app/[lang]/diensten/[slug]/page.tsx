import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServicePage } from "@/components/services/ServicePage";
import { getService, services } from "@/content/services";
import { isLocale, type Locale } from "@/i18n/config";
import { serviceBreadcrumbs, serviceData } from "@/lib/structured-data";

interface ServiceRouteProps {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServiceRouteProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { lang, slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  const locale: Locale = isLocale(lang) ? lang : "nl";
  const title = service.meta.title[locale];
  const description = service.meta.description[locale];
  const inherited = (await parent).openGraph ?? {};
  return {
    title,
    description,
    openGraph: { ...inherited, title: `${title} | PimWork`, description, url: `/${locale}/diensten/${slug}` },
    alternates: {
      canonical: `/${locale}/diensten/${slug}`,
      languages: { "nl-NL": `/nl/diensten/${slug}`, "en-GB": `/en/diensten/${slug}`, "x-default": `/nl/diensten/${slug}` },
    },
  };
}

/** One service as a full page. Rendered per request for the CSP nonce. */
export default async function ServiceRoute({ params }: ServiceRouteProps) {
  await connection();
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const service = getService(slug);
  if (!service) notFound();
  return (
    <main id="main" className="plate">
      <JsonLd data={serviceData(service, lang)} />
      <JsonLd data={serviceBreadcrumbs(service, lang)} />
      <ServicePage service={service} lang={lang} />
    </main>
  );
}
