import { PlateHeading } from "@/components/ui/PlateHeading";
import { workCopy } from "@/components/work/copy";
import { formatPeriod, periodYear, toRoman } from "@/components/work/lib";
import { ProjectFigure } from "@/components/work/ProjectFigure";
import { WorkIndex, type WorkRow } from "@/components/work/WorkIndex";
import { projects, statusLabel } from "@/content/projects";
import type { Locale } from "@/i18n/config";

/**
 * Plate 02: the eight projects as an editorial index, in projects.ts order.
 * The figures are rendered here on the server and handed to the client index.
 */
export function WorkPlate({ lang }: { lang: Locale }) {
  const t = workCopy[lang];
  const rows: WorkRow[] = projects.map((project, i) => {
    const numeral = toRoman(i + 1);
    return {
      slug: project.slug,
      href: `/${lang}/werk/${project.slug}`,
      numeral,
      name: project.name,
      category: project.category[lang],
      year: periodYear(project.period, lang),
      period: formatPeriod(project.period, lang),
      status: statusLabel[project.status][lang],
      short: project.short[lang],
      stack: project.stack,
      figure: (
        <ProjectFigure slug={project.slug} lang={lang} numeral={numeral} decorative sizes="(min-width: 56rem) 21rem, 92vw" />
      ),
    };
  });

  return (
    <section id="work" className="plate" aria-labelledby="work-title">
      <PlateHeading numeral="02" id="work-title" lead={t.lead}>
        {t.title}
      </PlateHeading>
      <WorkIndex rows={rows} cursorLabel={t.cursor} listLabel={t.listLabel} />
    </section>
  );
}
