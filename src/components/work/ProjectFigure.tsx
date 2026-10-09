import Image from "next/image";
import { ViewTransition } from "react";
import { imagesFor } from "@/content/media";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { workCopy } from "./copy";
import { ProjectDiagram, diagramCaption } from "./ProjectDiagram";
import { morphClass, projectTransitionName } from "./transition";
import styles from "./work.module.css";

interface ProjectFigureProps {
  slug: string;
  lang: Locale;
  /** Roman plate numeral, printed as "fig. III". */
  numeral: string;
  /** Show the figcaption under the frame. */
  caption?: boolean;
  /** Purely visual copy (index preview, inline card): hidden from assistive tech. */
  decorative?: boolean;
  /** Wrap the frame in the shared ViewTransition (project page and modal). */
  transition?: boolean;
  /** Load the photo eagerly and at high priority (above the fold on the project page). */
  preload?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * A project's figure: the first real image from content/media when there is
 * one, otherwise the authored plate diagram of its mechanism.
 */
export function ProjectFigure({
  slug,
  lang,
  numeral,
  caption = false,
  decorative = false,
  transition = false,
  preload = false,
  sizes = "(min-width: 72rem) 52rem, (min-width: 56rem) 70vw, 100vw",
  className,
}: ProjectFigureProps) {
  const image = imagesFor(slug)[0];
  const t = workCopy[lang];
  const text = image ? image.alt[lang] : diagramCaption(slug, lang);

  const frame = (
    <div className={cn(styles.frame, image && styles.frameImage)}>
      {image ? (
        <Image
          src={image.src}
          alt={decorative ? "" : image.alt[lang]}
          fill
          sizes={sizes}
          // The LCP image of the project page: fetched first, at high priority.
          loading={preload ? "eager" : "lazy"}
          fetchPriority={preload ? "high" : undefined}
          placeholder={image.blurDataURL ? "blur" : "empty"}
          blurDataURL={image.blurDataURL}
          className="object-cover"
        />
      ) : (
        <ProjectDiagram slug={slug} lang={lang} numeral={numeral} decorative={decorative} />
      )}
    </div>
  );

  return (
    <figure className={cn(styles.figure, className)} aria-hidden={decorative ? true : undefined}>
      {transition ? (
        <ViewTransition name={projectTransitionName(slug)} share={morphClass} default="none">
          {frame}
        </ViewTransition>
      ) : (
        frame
      )}
      {caption && text ? (
        <figcaption className={styles.caption}>
          <span className="numeral text-ink">
            {t.fig} {numeral}
          </span>{" "}
          <span>{text}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}
