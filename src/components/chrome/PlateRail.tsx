"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { sections } from "@/content/sections";
import { pick } from "@/i18n/config";
import { useCopy, useLang } from "@/i18n/LocaleProvider";
import styles from "./chrome.module.css";
import { chromeCopy } from "./copy";
import { railArcOffset } from "./logic";
import { onPlateLinkClick, useActivePlate } from "./plates";

const BULGE = 9;
const COUNT = sections.length;
/* The hairline arc through the dots, in a box where one rail item is 44 units tall. */
const ITEM = 44;
const H = COUNT * ITEM;
const ARC_EXTEND = 0.25;
const yStart = ITEM / 2 - ARC_EXTEND * ((H - ITEM) / 2);
const yEnd = H - yStart;
const xEnd = BULGE * (1 - (1 + ARC_EXTEND) ** 2);
const xCtrl = 2 * BULGE - xEnd;
const ARC_PATH = `M${xEnd} ${yStart} Q ${xCtrl} ${H / 2} ${xEnd} ${yEnd}`;

/**
 * Desktop rail: every plate a small dot on one compass arc. The plate in view
 * shows its numeral large; hover or focus names it.
 */
export function PlateRail() {
  const lang = useLang();
  const active = useActivePlate();
  const label = useCopy(chromeCopy.plates);

  return (
    <nav aria-label={label} className={styles.rail}>
      <svg className={styles.railArc} viewBox={`-24 0 48 ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d={ARC_PATH} />
      </svg>
      <ol className={styles.railList}>
        {sections.map((section, index) => {
          const current = active === section.id;
          const name = pick(section.label, lang);
          return (
            <li
              key={section.id}
              className={styles.railItem}
              style={{ "--arc-x": `${railArcOffset(index, COUNT, BULGE)}px` } as CSSProperties}
            >
              <Link
                href={`/${lang}#${section.id}`}
                className={styles.railLink}
                aria-current={current ? "location" : undefined}
                data-cursor="link"
                onClick={(event) => onPlateLinkClick(event, section.id)}
              >
                <span className={styles.railDot} aria-hidden="true" />
                <span className={styles.railNumeral} aria-hidden="true">
                  {section.numeral}
                </span>
                <span className={styles.railName}>
                  <span className="sr-only">{section.numeral} </span>
                  {name}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
