"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { getProject } from "@/content/projects";
import { interests } from "@/content/person";
import type { Locale } from "@/i18n/config";
import { useFinePointer, useMediaQuery, useReducedMotion } from "@/lib/hooks";
import { aboutCopy } from "./copy";
import styles from "./about.module.css";

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];
const TILT = 7;

/**
 * Six interest sheets fanned around one pivot like papers on a desk.
 * Lift, straighten and the neighbours leaning away are pure CSS (hover and
 * focus-within); this component only adds the pointer tilt on desktop and,
 * on touch, marks the sheet that snapped to the centre of the row.
 */
export function InterestFan({ lang }: { lang: Locale }) {
  const t = aboutCopy.interests;
  const listRef = useRef<HTMLUListElement>(null);
  const [snapped, setSnapped] = useState(0);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 64rem)");
  const tilt = fine && wide && !reduced;

  // Row mode: the sheet closest to the centre of the scroller is the active one.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (list.scrollWidth <= list.clientWidth + 1) return;
      const centre = list.scrollLeft + list.clientWidth / 2;
      let best = 0;
      let bestDistance = Infinity;
      Array.from(list.children).forEach((child, index) => {
        const el = child as HTMLElement;
        const distance = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centre);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      setSnapped(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    list.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      list.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const onMove = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      if (!tilt) return;
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      el.style.transform = `perspective(900px) rotateX(${(-py * TILT).toFixed(2)}deg) rotateY(${(px * TILT).toFixed(2)}deg)`;
    },
    [tilt],
  );

  const onLeave = useCallback((event: PointerEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.transform = "";
  }, []);

  return (
    <ul ref={listRef} className={styles.fan} aria-label={t.listLabel[lang]}>
      {interests.map((interest, index) => {
        const project = getProject(interest.evidence);
        const id = `interest-${interest.id}`;
        return (
          <li
            key={interest.id}
            className={styles.slot}
            style={{ "--i": index } as CSSProperties}
            data-snapped={snapped === index || undefined}
          >
            <div className={styles.nudge}>
              <Link
                href={`/${lang}/werk/${interest.evidence}`}
                className={styles.sheet}
                data-cursor="view"
                aria-labelledby={`${id}-title ${id}-proof`}
                aria-describedby={`${id}-body`}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="numeral text-[length:var(--step-1)] text-ink-mute" aria-hidden="true">
                    {ROMAN[index]}
                  </span>
                  <svg className={styles.sheetArc} viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M 2 9.5 Q 50 -4 98 9.5" fill="none" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                  </svg>
                </span>
                <span id={`${id}-title`} className="text-[length:var(--step-1)] italic leading-tight text-ink">
                  {interest.title[lang]}
                </span>
                <span id={`${id}-body`} className="text-[length:var(--step--1)] leading-relaxed text-ink-soft">
                  {interest.body[lang]}
                </span>
                <span className={styles.evidence}>
                  <span id={`${id}-proof`} className="text-[length:var(--step--1)]">
                    <span className="label mr-2">{t.evidence[lang]}</span>
                    <span className="italic">{project?.name ?? interest.evidence}</span>
                  </span>
                  <Icon name="arrowNE" size={16} />
                </span>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
