import Link from "next/link";
import { ArchButton } from "@/components/ui/ArchButton";
import { Icon } from "@/components/ui/Icon";
import { featuredProjects, workProjects } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { workCopy } from "./copy";
import { featuredFirst, numeralFor } from "./lib";
import { Morph } from "./Morph";
import { ProjectFigure } from "./ProjectFigure";
import styles from "./work.module.css";

/** Composition per position: one large lead, then a narrow and a wide card. */
const LAYOUT = [styles.featureLead, styles.featureNarrow, styles.featureWide];

/**
 * The home page's selected work: the featured projects as large figure-led
 * cards in an asymmetric composition, each opening its project (as a sheet
 * on a soft navigation), plus a link to the full work page.
 */
export function FeaturedWork({ lang }: { lang: Locale }) {
  const t = workCopy[lang];
  const order = featuredFirst(workProjects);
  const titleId = "featured-work-title";

  return (
    <section className="plate" aria-labelledby={titleId}>
      <div className={styles.featuredHead}>
        <h2 id={titleId} className={styles.featuredTitle}>
          {t.featuredTitle}
        </h2>
        <p className={styles.featuredLead}>{t.featuredLead}</p>
      </div>

      <ul className={styles.featureGrid}>
        {featuredProjects.map((project, i) => {
          const numeral = numeralFor(project.slug, order);
          return (
            <li key={project.slug} className={cn(styles.feature, LAYOUT[i % LAYOUT.length])}>
              <article className={styles.featureCard}>
                <Morph slug={project.slug} className={styles.featureFigure}>
                  <ProjectFigure
                    slug={project.slug}
                    lang={lang}
                    numeral={numeral}
                    decorative
                    sizes={i === 0 ? "(min-width: 56rem) 60vw, 100vw" : "(min-width: 56rem) 40vw, 100vw"}
                  />
                </Morph>
                <div className={styles.featureText}>
                  <h3 className={styles.featureName}>
                    <Link href={`/${lang}/werk/${project.slug}`} scroll={false} className={styles.featureLink}>
                      {project.name}
                    </Link>
                  </h3>
                  <p className={styles.featureTagline}>{project.tagline[lang]}</p>
                  <p className={styles.featureMeta}>
                    <span>{project.kind[lang]}</span>
                    <span>{project.status[lang]}</span>
                  </p>
                  <span className={styles.featureGo} aria-hidden="true">
                    {t.view}
                    <Icon name="arrowNE" size={16} />
                  </span>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className={styles.featuredFoot}>
        <ArchButton href={`/${lang}/werk`} variant="secondary" icon="arrowRight">
          {t.allProjects}
        </ArchButton>
      </div>
    </section>
  );
}
