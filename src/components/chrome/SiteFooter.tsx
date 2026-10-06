"use client";

import Link from "next/link";
import { ArcRule } from "@/components/ui/ArcRule";
import { CreaseMark } from "@/components/ui/CreaseMark";
import { Icon } from "@/components/ui/Icon";
import { BrandName } from "@/components/ui/BrandName";
import { person } from "@/content/person";
import { pageHref, pages } from "@/content/sections";
import { pick } from "@/i18n/config";
import { useCopy, useLang } from "@/i18n/LocaleProvider";
import styles from "./chrome.module.css";
import { useActivePage } from "./controls";
import { chromeCopy } from "./copy";

/** The close of every page: who, what in one line, the pages, phone and email, the portfolio PDF and the year. */
export function SiteFooter() {
  const lang = useLang();
  const active = useActivePage();
  const t = useCopy(chromeCopy.footer);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <ArcRule className="inset-x-0 top-0 h-full w-full opacity-70" d="M-40 760 A 1250 1250 0 0 1 1040 260" draw />
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <p className={styles.footerName}>
            <CreaseMark size={30} />
            <span>
              <BrandName />
            </span>
          </p>
          <p className={styles.footerLine}>{t.line}</p>
        </div>

        <nav aria-label={t.nav} className={styles.footerNav}>
          <ul className={styles.footerLinks}>
            {pages.map((page) => (
              <li key={page.id}>
                <Link href={pageHref(lang, page)} className={styles.footerLink} aria-current={active === page.id ? "page" : undefined}>
                  {pick(page.label, lang)}
                </Link>
              </li>
            ))}
          </ul>
          <ul className={styles.footerLinks}>
            <li>
              <a href={`mailto:${person.email}`} className={styles.footerLink}>
                <Icon name="mail" size={16} />
                <span>{person.email}</span>
              </a>
            </li>
            <li>
              <a href={person.phone.href} className={styles.footerLink}>
                <Icon name="phone" size={16} />
                <span>{person.phone.display}</span>
              </a>
            </li>
            <li>
              <a href={`/portfolio-pim-${lang}.pdf`} download className={`${styles.footerLink} ${styles.footerDownload}`}>
                <Icon name="download" size={16} />
                <span>{t.portfolio}</span>
              </a>
            </li>
          </ul>
        </nav>

        <p className={styles.footerBase}>
          <span>{person.brand}</span>
          <span className="data">{year}</span>
        </p>
      </div>
    </footer>
  );
}
