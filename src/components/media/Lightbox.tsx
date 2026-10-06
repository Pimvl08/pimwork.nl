"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef } from "react";
import { CircleButton } from "@/components/ui/CircleButton";
import type { ImageAsset } from "@/content/media";
import type { Locale } from "@/i18n/config";
import { lockScroll } from "@/lib/scroll";
import { mediaCopy } from "./copy";
import { swipeStep, wrapIndex } from "./logic";
import styles from "./media.module.css";

interface LightboxProps {
  lang: Locale;
  images: ImageAsset[];
  index: number;
  projectName: (slug?: string) => string;
  onIndex: (index: number) => void;
  onClose: () => void;
}

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen image viewer on a native modal <dialog>: focus is trapped
 * inside, arrow keys and buttons browse, Esc or the close button closes,
 * horizontal swipes browse on touch. Neighbours are preloaded.
 */
export function Lightbox({ lang, images, index, projectName, onIndex, onClose }: LightboxProps) {
  const t = mediaCopy[lang].lightbox;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const captionId = useId();
  const total = images.length;
  const image = images[index];
  const go = useCallback((step: number) => onIndex(wrapIndex(index, step, total)), [index, total, onIndex]);

  // Open as a modal on mount, lock the page scroll, close on unmount.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Remember what opened the lightbox so focus can return there on close.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    // Opened from inside the project sheet the page is already locked: leave it so.
    const wasLocked = document.documentElement.style.overflow === "hidden";
    lockScroll(true);
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
    return () => {
      if (!wasLocked) lockScroll(false);
      if (dialog.open) dialog.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "Tab") {
      // Keep focus inside the dialog.
      const nodes = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (node) => node.offsetParent !== null,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  if (!image) return null;
  const neighbours = total > 1 ? [images[wrapIndex(index, 1, total)], images[wrapIndex(index, -1, total)]] : [];
  const sizes = "(min-width: 64rem) 82vw, 100vw";

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-modal="true"
      aria-label={t.label}
      aria-describedby={captionId}
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-3 px-[var(--gutter)] py-3 sm:py-5">
        <header className="flex items-center justify-between gap-4">
          <p className="data text-[length:var(--step--1)] text-ink-mute" aria-live="polite">
            {t.counter(index + 1, total)}
          </p>
          <CircleButton data-autofocus icon="close" label={t.close} onClick={onClose} />
        </header>

        <div
          className={styles.stage}
          onPointerDown={(event) => {
            swipe.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
          }}
          onPointerUp={(event) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start || start.id !== event.pointerId) return;
            const step = swipeStep(event.clientX - start.x, event.clientY - start.y);
            if (step !== 0) go(step);
          }}
          onPointerCancel={() => {
            swipe.current = null;
          }}
        >
          <Image
            key={image.src}
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt[lang]}
            sizes={sizes}
            placeholder={image.blurDataURL ? "blur" : "empty"}
            blurDataURL={image.blurDataURL}
            loading="eager"
            draggable={false}
            className={`${styles.stageImg} ${styles.slide}`}
          />
          {neighbours.map((neighbour) => (
            <div key={`pre-${neighbour.src}`} className={styles.preload} aria-hidden="true">
              <Image src={neighbour.src} width={neighbour.width} height={neighbour.height} alt="" sizes={sizes} loading="eager" />
            </div>
          ))}
        </div>

        <footer className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div id={captionId} className="measure">
            <p className="text-[length:var(--step-0)] leading-snug text-ink">
              <span className="">{projectName(image.project)}</span>
              <span aria-hidden="true" className="text-ink-faint">
                {" "}
                &middot;{" "}
              </span>
              <span className="text-ink-soft">{image.alt[lang]}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-[length:var(--step--1)] text-ink-mute lg:inline">{t.hint}</span>
            <CircleButton icon="arrowLeft" label={t.previous} onClick={() => go(-1)} disabled={total < 2} />
            <CircleButton icon="arrowRight" label={t.next} onClick={() => go(1)} disabled={total < 2} />
          </div>
        </footer>
      </div>
    </dialog>
  );
}
