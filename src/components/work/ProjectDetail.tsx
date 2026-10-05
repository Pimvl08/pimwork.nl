import Link from "next/link";
import { ArcCard } from "@/components/ui/ArcCard";
import { ArchButton } from "@/components/ui/ArchButton";
import { Icon } from "@/components/ui/Icon";
import { PlateHeading } from "@/components/ui/PlateHeading";
import { projects, statusLabel, type Project } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { workCopy } from "./copy";
import { formatPeriod, neighbours, numeralFor } from "./lib";
import { ProjectFigure } from "./ProjectFigure";
import styles from "./work.module.css";

const ARCH = "M0 23 Q500 1 1000 23";
const LETTERS = "abcdefghijklmnopqrstuvwxyz";

/** Slightly arched hairline above every numbered figure. */
function FigureRule() {
  return (
    <svg
      viewBox="0 0 1000 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ARCH} className={styles.rule} />
    </svg>
  );
}

interface ProjectDetailProps {
  project: Project;
  lang: Locale;
  /** "page" is the full plate route (h1); "sheet" sits inside the modal (h2). */
  mode: "page" | "sheet";
  /** Id of the project name, so the article and the dialog are labelled by it. */
  titleId: string;
}

/**
 * The full plate of one project, shared by /[lang]/werk/[slug] and the
 * intercepted modal sheet. Server component: no client code ships with it.
 */
export function ProjectDetail({
  project,
  lang,
  mode,
  titleId,
}: ProjectDetailProps) {
  const t = workCopy[lang];
  const numeral = numeralFor(project.slug, projects);
  const around = neighbours(project.slug, projects);
  const H = mode === "page" ? "h2" : "h3";
  const sheet = mode === "sheet";
  const home = `/${lang}#work`;
  const id = (part: string) => `${titleId}-${part}`;

  return (
    <article className={styles.detail} aria-labelledby={titleId}>
      {sheet ? null : (
        <div className={styles.topbar}>
          <Link href={home} className={styles.backLink} data-cursor="link">
            <Icon name="arrowLeft" size={18} />
            <span>{t.back}</span>
          </Link>
          <span className="label text-ink-mute">
            {t.plate} {numeral}
          </span>
        </div>
      )}

      <PlateHeading
        as={sheet ? "h2" : "h1"}
        id={titleId}
        numeral={numeral}
        lead={project.short[lang]}
      >
        {project.name}
      </PlateHeading>

      <p className={styles.metaLine}>
        <span>{project.category[lang]}</span>
        <span>{formatPeriod(project.period, lang)}</span>
        <span>{statusLabel[project.status][lang]}</span>
      </p>

      <ProjectFigure
        slug={project.slug}
        lang={lang}
        numeral={numeral}
        caption
        transition
        preload={!sheet}
        className={styles.detailFigure}
      />

      <div className={styles.sections}>
        <section className={styles.section} aria-labelledby={id("problem")}>
          <H id={id("problem")} className={styles.sectionTitle}>
            {t.problem}
          </H>
          <p className={styles.prose}>{project.problem[lang]}</p>
        </section>

        <section className={styles.section} aria-labelledby={id("does")}>
          <H id={id("does")} className={styles.sectionTitle}>
            {t.whatItDoes}
          </H>
          <p className={styles.prose}>{project.summary[lang]}</p>
        </section>

        {project.highlights[lang].length > 0 ? (
          <section className={styles.section} aria-labelledby={id("how")}>
            <H id={id("how")} className={styles.sectionTitle}>
              {t.highlights}
            </H>
            <ol className={styles.figureList}>
              {project.highlights[lang].map((line, i) => (
                <li key={i} className={styles.figureItem}>
                  <FigureRule />
                  <span className={styles.figureNo} aria-hidden="true">
                    {i + 1}
                  </span>
                  <p className={styles.figureText}>{line}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {project.hardProblems[lang].length > 0 ? (
          <section className={styles.section} aria-labelledby={id("hard")}>
            <H id={id("hard")} className={styles.sectionTitle}>
              {t.hardProblems}
            </H>
            <ol className={styles.figureList}>
              {project.hardProblems[lang].map((line, i) => (
                <li key={i} className={styles.figureItem}>
                  <FigureRule />
                  <span className={styles.figureNoSoft} aria-hidden="true">
                    {LETTERS[i % LETTERS.length]}.
                  </span>
                  <p className={styles.figureText}>{line}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {project.metrics.length > 0 ? (
          <section className={styles.section} aria-labelledby={id("metrics")}>
            <H id={id("metrics")} className={styles.sectionTitle}>
              {t.metrics}
            </H>
            <table className={styles.table}>
              <caption>
                {t.metrics}: {project.name}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{t.metricLabel}</th>
                  <th scope="col">{t.metricValue}</th>
                </tr>
              </thead>
              <tbody>
                {project.metrics.map((metric) => (
                  <tr key={metric.label.nl}>
                    <th scope="row">{metric.label[lang]}</th>
                    <td>{metric.value[lang]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby={id("stack")}>
          <H id={id("stack")} className={styles.sectionTitle}>
            {t.stack}
          </H>
          <ul className={styles.stackList}>
            {project.stack.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby={id("links")}>
          <H id={id("links")} className={styles.sectionTitle}>
            {t.links}
          </H>
          {project.links.length > 0 ? (
            <div className={styles.linkList}>
              {project.links.map((link) => (
                <ArchButton
                  key={link.href}
                  href={link.href}
                  variant="secondary"
                  icon="arrowNE"
                >
                  {link.label[lang]}
                </ArchButton>
              ))}
            </div>
          ) : (
            <p className={styles.prose}>{t.noLinks}</p>
          )}
        </section>
      </div>

      {around ? (
        <nav className={styles.pager} aria-label={t.pager}>
          {(["prev", "next"] as const).map((dir) => {
            const target = around[dir];
            const linkProps = {
              href: `/${lang}/werk/${target.slug}`,
              className: cn(
                styles.pagerLink,
                dir === "next" && styles.pagerNext,
              ),
              "data-dir": dir,
              "data-cursor": "view",
              "data-cursor-label": t.cursor,
            };
            const inner = (
              <>
                <span className={styles.pagerDir}>
                  {dir === "prev" ? <Icon name="arrowLeft" size={16} /> : null}
                  {dir === "prev" ? t.prev : t.next}
                  {dir === "next" ? <Icon name="arrowRight" size={16} /> : null}
                </span>
                <span className={styles.pagerName}>
                  <span className={styles.numeralSoft}>
                    {numeralFor(target.slug, projects)}
                  </span>
                  {target.name}
                </span>
              </>
            );
            // Inside the sheet the next plate replaces this one, so Back still
            // closes to the index. On the full page a soft link would be
            // intercepted into a sheet; a plain link loads the next full plate.
            return (
              <ArcCard key={dir} className={styles.pagerCard}>
                {sheet ? (
                  <Link {...linkProps} replace scroll={false}>
                    {inner}
                  </Link>
                ) : (
                  <a {...linkProps}>{inner}</a>
                )}
              </ArcCard>
            );
          })}
        </nav>
      ) : null}

      <div className={styles.backRow}>
        <ArchButton href={home} variant="secondary" icon="arrowLeft">
          {t.back}
        </ArchButton>
      </div>
    </article>
  );
}
