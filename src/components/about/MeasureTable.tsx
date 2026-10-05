import Link from "next/link";
import { getProject } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import { CountUp } from "./CountUp";
import { aboutCopy, measureSelection } from "./copy";
import styles from "./about.module.css";

interface Row {
  slug: string;
  name: string;
  raw: string;
  label: string;
  what: string;
  context?: string;
}

/** Resolves the selection against projects.ts; a missing metric is skipped, never invented. */
export function measureRows(lang: Locale): Row[] {
  const rows: Row[] = [];
  for (const pick of measureSelection) {
    const project = getProject(pick.slug);
    const metric = project?.metrics.find((m) => m.label.en === pick.metric);
    if (!project || !metric) continue;
    rows.push({
      slug: project.slug,
      name: project.name,
      raw: metric.value[lang],
      label: metric.label[lang],
      what: pick.what[lang],
      context: pick.context?.[lang],
    });
  }
  return rows;
}

/** A ruled measurement table: hairlines, italic tabular numerals, a source per row. */
export function MeasureTable({ lang }: { lang: Locale }) {
  const t = aboutCopy.measures;
  const rows = measureRows(lang);
  return (
    <div>
      <table className={styles.table} aria-labelledby="about-measures">
        <thead>
          <tr>
            <th scope="col" className="label text-ink-mute">
              {t.colValue[lang]}
            </th>
            <th scope="col" className="label text-ink-mute">
              {t.colWhat[lang]}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.slug}>
              <td className={styles.value}>
                <CountUp raw={row.raw} lang={lang} delay={index * 90} />
              </td>
              <td>
                <p className="text-[length:var(--step-0)] leading-snug text-ink">{row.what}</p>
                {row.context ? (
                  <p className="mt-0.5 text-[length:var(--step--1)] italic text-ink-mute">{row.context}</p>
                ) : null}
                <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Link
                    href={`/${lang}/werk/${row.slug}`}
                    data-cursor="link"
                    className="inline-flex min-h-11 items-center italic text-ink-soft underline transition-colors duration-150 hover:text-ink sm:min-h-0"
                  >
                    {row.name}
                  </Link>
                  <span className="data text-[0.72rem] text-ink-mute">
                    projects.ts · {row.slug} · &ldquo;{row.label}&rdquo;
                  </span>
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="measure mt-4 text-[length:var(--step--1)] italic text-ink-mute">{t.note[lang]}</p>
    </div>
  );
}
