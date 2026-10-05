"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { ImageAsset } from "@/content/media";
import type { Locale } from "@/i18n/config";
import { mediaCopy } from "./copy";
import { Lightbox } from "./Lightbox";
import { composeGallery, selectPerProject, shortCaption } from "./logic";
import styles from "./media.module.css";

export interface GalleryProject {
  slug: string;
  name: string;
}

interface GalleryProps {
  lang: Locale;
  images: ImageAsset[];
  projects: GalleryProject[];
}

const SELECTION = "__selection";

/**
 * Editorial composition of the real screenshots. A selection (two per
 * project) is shown first; a project filter shows all images of one project.
 * Every image opens in the Lightbox.
 */
export function Gallery({ lang, images, projects }: GalleryProps) {
  const t = mediaCopy[lang];
  const [filter, setFilter] = useState<string>(SELECTION);
  const [open, setOpen] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const shown = useMemo(
    () => (filter === SELECTION ? selectPerProject(images, 2) : images.filter((image) => image.project === filter)),
    [filter, images],
  );
  const placements = useMemo(() => composeGallery(shown), [shown]);
  const nameOf = (slug?: string) => projects.find((project) => project.slug === slug)?.name ?? "";
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const image of images) map.set(image.project ?? "", (map.get(image.project ?? "") ?? 0) + 1);
    return map;
  }, [images]);

  useArcRevealFallback(gridRef, shown);

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label={t.filterLabel} className={styles.chips}>
        <button type="button" className={styles.chip} aria-pressed={filter === SELECTION} onClick={() => setFilter(SELECTION)}>
          {t.selection}
        </button>
        {projects.map((project) => (
          <button
            key={project.slug}
            type="button"
            className={styles.chip}
            aria-pressed={filter === project.slug}
            disabled={!counts.get(project.slug)}
            onClick={() => setFilter(project.slug)}
          >
            {project.name}
            <span className="data ml-2 text-[length:var(--step--1)] not-italic opacity-80">{counts.get(project.slug) ?? 0}</span>
          </button>
        ))}
      </div>

      <div ref={gridRef} className={styles.grid}>
        {shown.map((image, i) => {
          const place = placements[i];
          const caption = shortCaption(image.alt[lang]);
          const style = {
            "--span": place.span,
            "--start": place.start ?? "auto",
            "--span-sm": place.spanSm,
            "--start-sm": place.startSm ?? "auto",
            "--align": place.align,
          } as CSSProperties;
          return (
            <figure key={image.src} className={styles.item} style={style}>
              <button
                ref={(node) => {
                  triggers.current[i] = node;
                }}
                type="button"
                className={`${styles.frame} ${styles.reveal}`}
                data-cursor="view"
                data-cursor-label={t.view}
                aria-haspopup="dialog"
                onClick={() => setOpen(i)}
              >
                <Image
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={image.alt[lang]}
                  sizes={`(min-width: 56rem) ${Math.round((place.span / 12) * 100)}vw, ${Math.round((place.spanSm / 6) * 100)}vw`}
                  placeholder={image.blurDataURL ? "blur" : "empty"}
                  blurDataURL={image.blurDataURL}
                  loading="lazy"
                  className={styles.img}
                />
              </button>
              <figcaption className={styles.caption}>
                <span className="italic text-ink">{nameOf(image.project)}</span>
                <span className="text-[length:var(--step--1)] text-ink-mute">{caption}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {open !== null ? (
        <Lightbox
          lang={lang}
          images={shown}
          index={open}
          projectName={nameOf}
          onIndex={setOpen}
          onClose={() => {
            const trigger = triggers.current[open];
            setOpen(null);
            // Return focus to the image that opened the viewer.
            requestAnimationFrame(() => trigger?.focus({ preventScroll: true }));
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * Where CSS scroll-driven animations are missing, reveal items that start
 * below the fold with an IntersectionObserver. Items already visible on mount
 * are left alone, so nothing flashes; reduced motion skips it entirely.
 */
function useArcRevealFallback(ref: React.RefObject<HTMLDivElement | null>, dependency: unknown) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const supported = typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (supported || reduced || !("IntersectionObserver" in window)) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.reveal}`));
    const first = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const node = entry.target as HTMLElement;
          if (!first.has(node)) {
            first.add(node);
            if (entry.isIntersecting) {
              observer.unobserve(node);
              continue;
            }
            node.dataset.reveal = "pending";
            continue;
          }
          if (entry.isIntersecting) {
            node.dataset.reveal = "shown";
            observer.unobserve(node);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      nodes.forEach((node) => delete node.dataset.reveal);
    };
  }, [ref, dependency]);
}
