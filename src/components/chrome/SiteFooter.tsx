"use client";

import Link from "next/link";
import { ArcRule } from "@/components/ui/ArcRule";
import { CreaseMark } from "@/components/ui/CreaseMark";
import { Icon } from "@/components/ui/Icon";
import { person } from "@/content/person";
import { useCopy, useLang } from "@/i18n/LocaleProvider";
import styles from "./chrome.module.css";
import { chromeCopy } from "./copy";
import { onPlateLinkClick } from "./plates";

/** The close of every page: one line, how it was made, and the way back. */
export function SiteFooter() {
  const lang = useLang();
  const t = useCopy(chromeCopy.footer);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <ArcRule className="inset-0 h-full w-full" d="M-40 700 A 1250 1250 0 0 1 1040 180" draw />
      <div className={styles.footerInner}>
        <p className={styles.footerLine}>{t.line}</p>

        <div className={styles.footerMeta}>
          <p className={styles.colophon}>
            <CreaseMark size={22} />
            <span>{t.colophon}</span>
          </p>
          <nav aria-label={t.nav}>
            <ul className={styles.footerLinks}>
              <li>
                <a href={person.github.href} className={styles.footerLink} target="_blank" rel="noopener noreferrer" data-cursor="link">
                  <span>{t.github}</span>
                  <Icon name="arrowNE" size={16} />
                  <span className="sr-only"> ({t.githubNote})</span>
                </a>
              </li>
              <li>
                <Link href={`/${lang}/colofon`} className={styles.footerLink} data-cursor="link">
                  <span>{t.colophonLink}</span>
                  <Icon name="arrowRight" size={16} />
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}#cover`}
                  className={styles.footerLink}
                  data-cursor="link"
                  onClick={(event) => onPlateLinkClick(event, "cover")}
                >
                  <span>{t.back}</span>
                  <Icon name="arrowDown" size={16} className={styles.footerUp} />
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className={styles.footerYear}>
          <span>{t.made}</span>
          <span aria-hidden="true"> · </span>
          <span className="data">{year}</span>
        </p>
      </div>
    </footer>
  );
}
