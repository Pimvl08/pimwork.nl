import Link from "next/link";
import { ArcRule } from "@/components/ui/ArcRule";
import { ArchButton } from "@/components/ui/ArchButton";
import { Icon } from "@/components/ui/Icon";
import { about, services } from "@/content/person";
import { getProject } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { homeCopy } from "./copy";
import styles from "./home.module.css";

/**
 * "Wat ik voor je kan bouwen": the four kinds of software Pim builds, each
 * with the real projects that prove it. A sticky introduction on the left,
 * an editorial list on the right, every item lifted by a short arc.
 */
export function Services({ lang }: { lang: Locale }) {
  const t = homeCopy.services;
  return (
    <section id="diensten" className={cn(styles.section, "unfold")} aria-labelledby="services-title">
      <div className={styles.servicesGrid}>
        <div className={styles.servicesIntro}>
          <h2 id="services-title" className={styles.heading}>
            {t.title[lang]}
          </h2>
          <p className={styles.lead}>{t.lead[lang]}</p>
        </div>
        <ul className={styles.serviceList}>
          {services.map((service) => {
            const proof = service.proof.map((slug) => getProject(slug)).filter((project) => project !== undefined);
            return (
              <li key={service.id} className={styles.service}>
                <svg className={styles.serviceArc} viewBox="0 0 72 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <path d="M0 12 Q 36 -2 72 12" vectorEffect="non-scaling-stroke" />
                </svg>
                <h3 className={styles.serviceTitle}>{service.title[lang]}</h3>
                <p className={styles.serviceBody}>{service.body[lang]}</p>
                {proof.length ? (
                  <p className={styles.proof}>
                    <span className={styles.proofLabel}>{t.proof[lang]}</span>
                    {proof.map((project) => (
                      <Link key={project.slug} href={`/${lang}/werk/${project.slug}`} className={styles.proofLink}>
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
      </div>
    </section>
  );
}

/** A short introduction with the way to the about page. */
export function AboutTeaser({ lang }: { lang: Locale }) {
  const t = homeCopy.about;
  return (
    <section id="over" className={cn(styles.section, "unfold")} aria-labelledby="about-teaser-title">
      <div className={styles.aboutGrid}>
        <h2 id="about-teaser-title" className={styles.heading}>
          {t.title[lang]}
        </h2>
        <div className={styles.aboutText}>
          <p className={styles.aboutQuote}>{about.intro[lang][0]}</p>
          <ArchButton variant="secondary" icon="arrowRight" href={`/${lang}/over`} className={styles.aboutMore}>
            {t.more[lang]}
          </ArchButton>
        </div>
      </div>
    </section>
  );
}

/** The closing call to action: one sentence and the way to the contact page. */
export function ContactBand({ lang }: { lang: Locale }) {
  const t = homeCopy.contact;
  return (
    <section id="contact-cta" className={cn(styles.section, "unfold")} aria-labelledby="contact-band-title">
      <div className={styles.band}>
        <ArcRule className="inset-0 h-full w-full opacity-60" d="M-20 1000 A 900 900 0 0 1 1020 1000" draw />
        <h2 id="contact-band-title" className={styles.bandHeading}>
          {t.title[lang]}
        </h2>
        <p className={styles.bandBody}>{t.body[lang]}</p>
        <ArchButton variant="primary" size="lg" icon="arrowNE" href={`/${lang}/contact`} className={styles.bandAction}>
          {t.action[lang]}
        </ArchButton>
      </div>
    </section>
  );
}
