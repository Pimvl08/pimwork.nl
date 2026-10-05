import type { Locale } from "@/i18n/config";
import { PlateHeading } from "@/components/ui/PlateHeading";
import { projects } from "@/content/projects";
import snapshot from "@/content/generated/stats.json";
import { dataCopy } from "@/components/data/copy";
import { FillDefs } from "@/components/data/parts";
import { LinesChart, type NamedStats } from "@/components/data/LinesChart";
import { TimelineChart } from "@/components/data/TimelineChart";
import { TestsChart } from "@/components/data/TestsChart";
import { StackMatrix } from "@/components/data/StackMatrix";
import { formatDay, parseStats, sharedTech } from "@/components/data/stats";

const stats = parseStats(snapshot);

/**
 * Plate 05: numbers measured on Pim's own disk by scripts/collect-stats.mjs.
 * The snapshot is a committed JSON file; nothing here reads the disk.
 */
export function DataPlate({ lang }: { lang: Locale }) {
  const c = dataCopy[lang];
  const rows: NamedStats[] = [];
  const missing: string[] = [];
  for (const p of projects) {
    const measured = stats.projects.find((x) => x.slug === p.slug);
    if (measured) rows.push({ slug: p.slug, name: p.name, stats: measured });
    else missing.push(p.name);
  }
  const columns = projects.map((p) => ({ slug: p.slug, name: p.name }));
  const techs = sharedTech(projects.map((p) => ({ slug: p.slug, stack: p.stack })));

  return (
    <section id="data" className="plate" aria-labelledby="data-title">
      <FillDefs />
      <div className="flex flex-col gap-[calc(var(--section-y)*0.75)]">
        <div className="flex flex-col gap-5">
          <PlateHeading numeral="05" id="data-title" lead={stats.generatedAt ? c.lead(formatDay(stats.generatedAt, lang)) : undefined}>
            {c.title}
          </PlateHeading>
          <p className="measure text-ink-soft">{c.method}</p>
          {missing.length > 0 ? <p className="measure italic text-ink-mute">{c.missing(missing.join(", "))}</p> : null}
        </div>
        <LinesChart lang={lang} rows={rows} />
        <TimelineChart lang={lang} rows={rows} />
        <div className="max-w-[64rem]">
          <TestsChart lang={lang} rows={rows} />
        </div>
        <StackMatrix lang={lang} columns={columns} techs={techs} />
      </div>
    </section>
  );
}
