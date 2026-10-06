import Link from "next/link";
import type { ReactNode } from "react";
import { ProjectMedia } from "@/components/media/ProjectMedia";
import { ArcCard } from "@/components/ui/ArcCard";
import { ArchButton } from "@/components/ui/ArchButton";
import { Icon } from "@/components/ui/Icon";
import { PlateHeading } from "@/components/ui/PlateHeading";
import { imagesFor, videoFor } from "@/content/media";
import { projects, type Project } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { workCopy } from "./copy";
import { featuredFirst, neighbours, numeralFor } from "./lib";
import { ProjectDiagram, diagramCaption } from "./ProjectDiagram";
import { ProjectFigure } from "./ProjectFigure";
import styles from "./work.module.css";

const ARCH = "M0 23 Q500 1 1000 23";
const LETTERS = "abcdefghijklmnopqrstuvwxyz";

/** Slightly arched hairline above every numbered item. */
function FigureRule() {
  return (
    <svg viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={ARCH} className={styles.rule} />
    </svg>
  );
}

function Section({ id, title, as: H, children }: { id: string; title: string; as: "h2" | "h3"; children: ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <H id={id} className={styles.sectionTitle}>
        {title}
      </H>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

interface ProjectDetailProps {
  project: Project;
  lang: Locale;
  /** "page" is the full route (h1); "sheet" sits inside the modal (h2). */
  mode: "page" | "sheet";
  /** Id of the project name, so the article and the dialog are labelled by it. */
  titleId: string;
}

/**
 * One project, shared by /[lang]/werk/[slug] and the intercepted sheet:
 * who it is for, the problem, what I built, what it delivers, how it works,
 * the hardest part, real screens, tools and links. Server component; only
 * the media block ships client code.
 */
export function ProjectDetail({ project, lang, mode, titleId }: ProjectDetailProps) {
  const t = workCopy[lang];
  const order = featuredFirst(projects);
  const numeral = numeralFor(project.slug, order);
  const around = neighbours(project.slug, order);
  const sheet = mode === "sheet";
  const H = sheet ? "h3" : "h2";
  const index = `/${lang}/werk`;
  const id = (part: string) => `${titleId}-${part}`;
  const images = imagesFor(project.slug);
  const video = videoFor(project.slug);
  // When a screenshot leads the page, the mechanism diagram moves under the hood.
  const diagramBelow = images.length > 0 && diagramCaption(project.slug, lang) !== null;

  return (
    <article className={styles.detail} aria-labelledby={titleId}>
      {sheet ? null : (
        <div className={styles.topbar}>
          <Link href={index} className={styles.backLink}>
            <Icon name="arrowLeft" size={18} />
            <span>{t.back}</span>
          </Link>
        </div>
      )}

      <PlateHeading as={sheet ? "h2" : "h1"} id={titleId} numeral={numeral} lead={project.tagline[lang]}>
        {project.name}
      </PlateHeading>

      <p className={styles.metaLine}>
        <span>{project.kind[lang]}</span>
        <span className={styles.metaStatus}>{project.status[lang]}</span>
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
        <Section id={id("audience")} title={t.audience} as={H}>
          <p className={styles.lede}>{project.audience[lang]}</p>
        </Section>

        <Section id={id("problem")} title={t.problem} as={H}>
          <p className={styles.prose}>{project.problem[lang]}</p>
        </Section>

        <Section id={id("solution")} title={t.solution} as={H}>
          <p className={styles.prose}>{project.solution[lang]}</p>
        </Section>

        {project.benefits[lang].length > 0 ? (
          <Section id={id("benefits")} title={t.benefits} as={H}>
            <ol className={styles.figureList}>
              {project.benefits[lang].map((line, i) => (
                <li key={i} className={styles.figureItem}>
                  <FigureRule />
                  <span className={styles.figureNo} aria-hidden="true">
                    {i + 1}
                  </span>
                  <p className={styles.benefitText}>{line}</p>
                </li>
              ))}
            </ol>
          </Section>
        ) : null}

        {project.craft[lang].length > 0 || diagramBelow ? (
          <Section id={id("craft")} title={t.craft} as={H}>
            {project.craft[lang].length > 0 ? (
              <ul className={styles.figureList}>
                {project.craft[lang].map((line, i) => (
                  <li key={i} className={styles.figureItem}>
                    <FigureRule />
                    <span className={styles.figureNoSoft} aria-hidden="true">
                      {LETTERS[i % LETTERS.length]}.
                    </span>
                    <p className={styles.figureText}>{line}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            {diagramBelow ? (
              <figure className={styles.craftFigure}>
                <div className={styles.frame}>
                  <ProjectDiagram slug={project.slug} lang={lang} numeral={numeral} />
                </div>
                <figcaption className={styles.caption}>
                  <span className="numeral text-ink">
                    {t.fig} {numeral}
                  </span>{" "}
                  <span>{diagramCaption(project.slug, lang)}</span>
                </figcaption>
              </figure>
            ) : null}
          </Section>
        ) : null}

        {project.challenge[lang] ? (
          <Section id={id("challenge")} title={t.challenge} as={H}>
            <p className={styles.lede}>{project.challenge[lang]}</p>
          </Section>
        ) : null}

        {images.length > 0 || video ? (
          <Section id={id("media")} title={t.media} as={H}>
            <ProjectMedia lang={lang} name={project.name} images={images} video={video} />
          </Section>
        ) : null}

        {project.stack.length > 0 ? (
          <Section id={id("stack")} title={t.stack} as={H}>
            <ul className={styles.stackList}>
              {project.stack.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {project.links.length > 0 ? (
          <Section id={id("links")} title={t.links} as={H}>
            <div className={styles.linkList}>
              {project.links.map((link, i) => (
                <ArchButton key={link.href} href={link.href} variant={i === 0 ? "primary" : "secondary"} icon="arrowNE">
                  {link.label[lang]}
                </ArchButton>
              ))}
            </div>
          </Section>
        ) : null}
      </div>

      {around ? (
        <nav className={styles.pager} aria-label={t.pager}>
          {(["prev", "next"] as const).map((dir) => {
            const target = around[dir];
            const linkProps = {
              href: `/${lang}/werk/${target.slug}`,
              className: cn(styles.pagerLink, dir === "next" && styles.pagerNext),
              "data-dir": dir,
            };
            const inner = (
              <>
                <span className={styles.pagerDir}>
                  {dir === "prev" ? <Icon name="arrowLeft" size={16} /> : null}
                  {dir === "prev" ? t.prev : t.next}
                  {dir === "next" ? <Icon name="arrowRight" size={16} /> : null}
                </span>
                <span className={styles.pagerName}>
                  <span className={styles.numeralSoft}>{numeralFor(target.slug, order)}</span>
                  {target.name}
                </span>
                <span className={styles.pagerKind}>{target.kind[lang]}</span>
              </>
            );
            // Inside the sheet the next project replaces this one, so Back
            // still closes the sheet. On the full page a soft link would be
            // intercepted into a sheet; a plain link loads the next full page.
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

      {sheet ? null : (
        <div className={styles.backRow}>
          <ArchButton href={index} variant="secondary" icon="arrowLeft">
            {t.back}
          </ArchButton>
        </div>
      )}
    </article>
  );
}
