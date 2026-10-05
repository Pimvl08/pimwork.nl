"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageAsset, VideoAsset } from "@/content/media";
import type { Locale } from "@/i18n/config";
import { mediaCopy } from "./copy";
import { Lightbox } from "./Lightbox";
import { shortCaption } from "./logic";
import styles from "./media.module.css";
import { VideoPlayer } from "./VideoPlayer";

interface ProjectMediaProps {
  lang: Locale;
  /** Project name, shown in the lightbox caption. */
  name: string;
  images: ImageAsset[];
  video?: VideoAsset;
}

/**
 * The real screens of one project: a screen recording in the custom player
 * (with its own fallback) and screenshot thumbnails in justified rows that
 * open the lightbox. Renders nothing when the project has no media.
 */
export function ProjectMedia({ lang, name, images, video }: ProjectMediaProps) {
  const t = mediaCopy[lang];
  const [open, setOpen] = useState<number | null>(null);
  if (!video && images.length === 0) return null;

  return (
    <div className={styles.media}>
      {video ? (
        <figure className={styles.videoFigure}>
          <VideoPlayer lang={lang} video={video} />
          <figcaption className={styles.note}>{video.description[lang]}</figcaption>
        </figure>
      ) : null}

      {images.length > 0 ? (
        <ul className={styles.thumbs} aria-label={t.shots}>
          {images.map((image, i) => {
            const ratio = image.width / image.height;
            const caption = shortCaption(image.alt[lang]);
            return (
              <li
                key={image.src}
                className={styles.shot}
                // Grow by aspect ratio so a row shares one height; cap tall
                // items so a lone phone screenshot never fills the page.
                style={{ flexGrow: ratio, flexBasis: `${(ratio * 13).toFixed(2)}rem`, maxWidth: `${(ratio * 26).toFixed(2)}rem` }}
              >
                <button
                  type="button"
                  className={styles.frame}
                  style={{ aspectRatio: `${image.width} / ${image.height}` }}
                  aria-haspopup="dialog"
                  aria-label={t.enlarge(caption)}
                  onClick={() => setOpen(i)}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    sizes="(min-width: 64rem) 36rem, (min-width: 40rem) 60vw, 100vw"
                    placeholder={image.blurDataURL ? "blur" : "empty"}
                    blurDataURL={image.blurDataURL}
                    className={styles.img}
                  />
                </button>
                <p className={styles.thumbCaption} aria-hidden="true">
                  {caption}
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}

      {open !== null ? (
        <Lightbox lang={lang} images={images} index={open} projectName={() => name} onIndex={setOpen} onClose={() => setOpen(null)} />
      ) : null}
    </div>
  );
}
