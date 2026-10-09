import { featuredFirst, numeralFor } from "@/components/work/lib";
import { ProjectFigure } from "@/components/work/ProjectFigure";
import { WorkIndex, type WorkRow } from "@/components/work/WorkIndex";
import { labProjects, projectHref } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import { labCopy } from "./copy";
import { LabStage } from "./LabStage";

/**
 * The lab as its own page. Five experiments share one stage; the tabs sit on
 * a compass arc above it and only the chosen experiment is ever loaded.
 * Below them, research projects that are not client work, in the same
 * index as the work page.
 */
export function LabPage({ lang }: { lang: Locale }) {
  const order = featuredFirst(labProjects);
  const rows: WorkRow[] = order.map((project) => {
    const numeral = numeralFor(project.slug, order);
    return {
      slug: project.slug,
      href: projectHref(lang, project),
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
    <main id="main" className="plate relative isolate pt-[calc(var(--section-y)+3rem)]" aria-labelledby="lab-title">
      <header className="flex max-w-[60rem] flex-col gap-5">
        <h1 id="lab-title" className="text-[length:var(--step-4)] leading-[1.02]">
          {labCopy.title[lang]}
        </h1>
        <p className="measure font-serif text-[length:var(--step-1)] leading-snug text-ink-soft">{labCopy.lead[lang]}</p>
      </header>
      <LabStage lang={lang} />
      {rows.length ? (
        <section className="mt-[clamp(4rem,9vw,7rem)] flex flex-col gap-8" aria-labelledby="lab-more-title">
          <header className="flex max-w-[60rem] flex-col gap-4">
            <h2 id="lab-more-title" className="text-[length:var(--step-3)] leading-[1.05]">
              {labCopy.more.title[lang]}
            </h2>
            <p className="measure font-serif text-[length:var(--step-1)] leading-snug text-ink-soft">{labCopy.more.lead[lang]}</p>
          </header>
          <WorkIndex rows={rows} listLabel={labCopy.more.title[lang]} headingLevel="h3" />
        </section>
      ) : null}
    </main>
  );
}
