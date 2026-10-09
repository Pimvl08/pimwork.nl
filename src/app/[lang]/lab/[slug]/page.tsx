import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProjectDetail } from "@/components/work/ProjectDetail";
import { getProject, labProjects } from "@/content/projects";
import { isLocale, type Locale } from "@/i18n/config";
import { projectBreadcrumbs } from "@/lib/structured-data";

interface LabProjectRouteProps {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return labProjects.map((project) => ({ slug: project.slug }));
}

function labProject(slug: string) {
  const project = getProject(slug);
  return project?.section === "lab" ? project : undefined;
}

export async function generateMetadata({ params }: LabProjectRouteProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = labProject(slug);
  if (!project) return {};
  const locale: Locale = isLocale(lang) ? lang : "nl";
  const inherited = (await parent).openGraph ?? {};
  return {
    title: project.seo.title[locale],
    description: project.seo.description[locale],
    openGraph: { ...inherited, title: `${project.seo.title[locale]} | PimWork`, description: project.seo.description[locale], url: `/${locale}/lab/${slug}` },
    alternates: {
      canonical: `/${locale}/lab/${slug}`,
      languages: { "nl-NL": `/nl/lab/${slug}`, "en-GB": `/en/lab/${slug}`, "x-default": `/nl/lab/${slug}` },
    },
  };
}

/** A research project from the lab, as a full page with the way back to the lab. */
export default async function LabProjectPage({ params }: LabProjectRouteProps) {
  await connection();
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const project = labProject(slug);
  if (!project) notFound();
  return (
    <main id="main" className="plate">
      <JsonLd data={projectBreadcrumbs(project, lang)} />
      <ProjectDetail project={project} lang={lang} mode="page" titleId="project-title" />
    </main>
  );
}
