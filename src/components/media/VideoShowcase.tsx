"use client";

import { useId, useRef, useState } from "react";
import type { VideoAsset } from "@/content/media";
import type { Locale } from "@/i18n/config";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { mediaCopy } from "./copy";
import { formatTime, wrapIndex } from "./logic";
import styles from "./media.module.css";
import { VideoPlayer } from "./VideoPlayer";

interface VideoShowcaseProps {
  lang: Locale;
  videos: VideoAsset[];
  /** Project names and hrefs by slug, resolved on the server. */
  projects: Record<string, { name: string; href: string }>;
}

/**
 * The recordings as a tab list beside one custom player. Tabs follow the
 * ARIA tabs pattern (arrow keys, Home, End). On fine pointers without reduced
 * motion, hovering a tab plays a silent preview in its thumbnail.
 */
export function VideoShowcase({ lang, videos, projects }: VideoShowcaseProps) {
  const t = mediaCopy[lang];
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const previews = fine && !reduced;
  const video = videos[selected];
  const project = video?.project ? projects[video.project] : undefined;

  const focusTab = (index: number) => {
    setSelected(index);
    tabs.current[index]?.focus();
  };

  if (!video) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)] lg:gap-12">
      <div
        role="tablist"
        aria-label={t.recordingsLabel}
        aria-orientation="vertical"
        className="flex flex-col border-b border-rule"
        onKeyDown={(event) => {
          const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
          if (event.key in keys) {
            event.preventDefault();
            focusTab(wrapIndex(selected, keys[event.key], videos.length));
          } else if (event.key === "Home") {
            event.preventDefault();
            focusTab(0);
          } else if (event.key === "End") {
            event.preventDefault();
            focusTab(videos.length - 1);
          }
        }}
      >
        {videos.map((item, i) => {
          const name = item.project ? projects[item.project]?.name : undefined;
          const isSelected = i === selected;
          return (
            <button
              key={item.poster}
              ref={(node) => {
                tabs.current[i] = node;
              }}
              id={`${baseId}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel`}
              tabIndex={isSelected ? 0 : -1}
              className={styles.tab}
              onClick={() => setSelected(i)}
              onPointerEnter={(event) => {
                if (!previews) return;
                const preview = event.currentTarget.querySelector("video");
                if (preview) void preview.play().catch(() => undefined);
              }}
              onPointerLeave={(event) => {
                const preview = event.currentTarget.querySelector("video");
                if (preview) {
                  preview.pause();
                  preview.currentTime = 0;
                }
              }}
            >
              <span className={styles.tabMark} aria-hidden="true" />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[length:var(--step-1)] italic leading-tight">{item.title[lang]}</span>
                <span className="flex flex-wrap items-baseline gap-x-3 text-[length:var(--step--1)] text-ink-mute">
                  {name ? <span>{name}</span> : null}
                  <span className="data">{formatTime(item.durationSeconds)}</span>
                </span>
                {previews ? (
                  <video
                    className={`${styles.thumbVideo} mt-3 hidden lg:block`}
                    poster={item.poster}
                    preload="none"
                    muted
                    loop
                    playsInline
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    {item.sources.map((source) => (
                      <source key={source.src} src={source.src} type={source.type} />
                    ))}
                  </video>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${selected}`} className="flex min-w-0 flex-col gap-4">
        <VideoPlayer key={video.poster} lang={lang} video={video} projectHref={project?.href} />
        <div className="flex flex-col gap-2">
          <p className="measure text-ink-soft">{video.description[lang]}</p>
          <p className="text-[length:var(--step--1)] text-ink-mute">
            <span className="label mr-2">{t.player.source}</span>
            <span className="font-mono text-[0.85em]">{video.provenance}</span>
          </p>
          <p className="text-[length:var(--step--1)] italic text-ink-mute">{t.player.shortcuts}</p>
        </div>
      </div>
    </div>
  );
}
