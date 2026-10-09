import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ServiceList } from "@/components/services/ServiceList";
import { servicesCopy } from "@/components/services/copy";
import styles from "@/components/work/work.module.css";
import { isLocale, type Locale } from "@/i18n/config";

interface ServicesRouteProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: ServicesRouteProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "nl";
  const t = servicesCopy[locale];
  const inherited = (await parent).openGraph ?? {};
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    openGraph: { ...inherited, title: `${t.metaTitle} | PimWork`, description: t.metaDescription, url: `/${locale}/diensten` },
    alternates: {
      canonical: `/${locale}/diensten`,
      languages: { "nl-NL": "/nl/diensten", "en-GB": "/en/diensten", "x-default": "/nl/diensten" },
    },
  };
}

/** The five services on one page, each leading to its own page. Rendered per request for the CSP nonce. */
export default async function ServicesRoute({ params }: ServicesRouteProps) {
  await connection();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = servicesCopy[lang];
  return (
    <main id="main" className="plate">
      <header className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{t.title}</h1>
        <p className={styles.pageLead}>{t.lead}</p>
      </header>
      <div className="mt-[clamp(2.5rem,6vw,4.5rem)] max-w-[52rem]">
        <ServiceList lang={lang} headingLevel="h2" />
      </div>
    </main>
  );
}
