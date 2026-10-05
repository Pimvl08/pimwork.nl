import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProjectDetail } from "@/components/work/ProjectDetail";
import { ProjectSheet } from "@/components/work/ProjectSheet";
import { workCopy } from "@/components/work/copy";
import { getProject } from "@/content/projects";
import { isLocale } from "@/i18n/config";

/**
 * Intercepted /[lang]/werk/[slug]: opened from the home page or the work
 * index, the project unfolds as a modal sheet over that page. A direct visit renders the full page.
 */
export default async function ProjectModal({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  await connection();
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const project = getProject(slug);
  if (!project) notFound();
  const titleId = `sheet-${project.slug}-title`;
  return (
    <ProjectSheet key={project.slug} titleId={titleId} closeLabel={workCopy[lang].close}>
      <ProjectDetail project={project} lang={lang} mode="sheet" titleId={titleId} />
    </ProjectSheet>
  );
}
