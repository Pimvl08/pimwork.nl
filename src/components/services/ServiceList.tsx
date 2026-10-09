import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import styles from "@/components/home/home.module.css";
import { getProject, projectHref } from "@/content/projects";
import { serviceSummary, services } from "@/content/services";
import type { Locale } from "@/i18n/config";
import { servicesCopy } from "./copy";

/**
 * The five services as an editorial list, each lifted by a short arc: the
 * name links to the service page, one sentence says what it is, and the real
 * projects that show it follow. Used on the home page and on /diensten.
 */
export function ServiceList({ lang, headingLevel: H }: { lang: Locale; headingLevel: "h2" | "h3" }) {
  const t = servicesCopy[lang];
  return (
    <ul className={styles.serviceList}>
      {services.map((service) => {
        const proof = service.proof.map((item) => getProject(item.slug)).filter((project) => project !== undefined);
        return (
          <li key={service.slug} className={styles.service}>
            <svg className={styles.serviceArc} viewBox="0 0 72 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M0 12 Q 36 -2 72 12" vectorEffect="non-scaling-stroke" />
            </svg>
            <H className={styles.serviceTitle}>
              <Link href={`/${lang}/diensten/${service.slug}`} className={styles.serviceTitleLink}>
                {service.name[lang]}
              </Link>
            </H>
            <p className={styles.serviceBody}>{serviceSummary(service, lang)}</p>
            {proof.length ? (
              <p className={styles.proof}>
                <span className={styles.proofLabel}>{t.proof}</span>
                {proof.map((project) => (
                  <Link key={project.slug} href={projectHref(lang, project)} className={styles.proofLink}>
                    <span>{project.name}</span>
                    <Icon name="arrowNE" size={16} />
                  </Link>
                ))}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
