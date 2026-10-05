import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProjectDetail } from "@/components/work/ProjectDetail";
import { getProject, projects } from "@/content/projects";
import { isLocale, type Locale } from "@/i18n/config";

interface ProjectRouteProps {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectRouteProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const locale: Locale = isLocale(lang) ? lang : "nl";
  // Keep the site's Open Graph fields (image, locale, site name); only the
  // title, description and url belong to this project.
  const inherited = (await parent).openGraph ?? {};
  return {
    title: project.name,
    description: project.tagline[locale],
    openGraph: { ...inherited, title: `${project.name} | Pim`, description: project.tagline[locale], url: `/${locale}/werk/${slug}` },
    alternates: {
      canonical: `/${locale}/werk/${slug}`,
      languages: { "nl-NL": `/nl/werk/${slug}`, "en-GB": `/en/werk/${slug}`, "x-default": `/nl/werk/${slug}` },
    },
  };
}

/**
 * A project as a full page. Reached directly (or on reload); a click from the
 * home page or the work index opens the same detail in the intercepted sheet.
 */
export default async function ProjectPage({ params }: ProjectRouteProps) {
  await connection();
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const project = getProject(slug);
  if (!project) notFound();
  return (
    <main id="main" className="plate">
      <ProjectDetail project={project} lang={lang} mode="page" titleId="project-title" />
    </main>
  );
}
