import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { workCopy } from "@/components/work/copy";
import { featuredFirst, numeralFor } from "@/components/work/lib";
import { ProjectFigure } from "@/components/work/ProjectFigure";
import { WorkIndex, type WorkRow } from "@/components/work/WorkIndex";
import styles from "@/components/work/work.module.css";
import { workProjects } from "@/content/projects";
import { isLocale, type Locale } from "@/i18n/config";

interface WorkRouteProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: WorkRouteProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "nl";
  const t = workCopy[locale];
  const inherited = (await parent).openGraph ?? {};
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    openGraph: { ...inherited, title: `${t.metaTitle} | PimWork`, description: t.metaDescription, url: `/${locale}/werk` },
    alternates: {
      canonical: `/${locale}/werk`,
      languages: { "nl-NL": "/nl/werk", "en-GB": "/en/werk", "x-default": "/nl/werk" },
    },
  };
}

/**
 * All projects as one editorial index, featured work first. A row opens its
 * project as a sheet over this page; a direct visit renders the full page.
 */
export default async function WorkPage({ params }: WorkRouteProps) {
  await connection();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = workCopy[lang];
  const order = featuredFirst(workProjects);
  const rows: WorkRow[] = order.map((project) => {
    const numeral = numeralFor(project.slug, order);
    return {
      slug: project.slug,
      href: `/${lang}/werk/${project.slug}`,
      numeral,
      name: project.name,
      kind: project.kind[lang],
      tagline: project.tagline[lang],
      status: project.status[lang],
      stack: project.stack,
      figure: <ProjectFigure slug={project.slug} lang={lang} numeral={numeral} decorative sizes="(min-width: 56rem) 21rem, 100vw" />,
    };
  });

  return (
    <main id="main" className="plate">
      <header className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{t.title}</h1>
        <p className={styles.pageLead}>{t.lead}</p>
      </header>
      <WorkIndex rows={rows} listLabel={t.listLabel} headingLevel="h2" />
    </main>
  );
}
