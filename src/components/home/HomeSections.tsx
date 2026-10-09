import { ArcRule } from "@/components/ui/ArcRule";
import { ArchButton } from "@/components/ui/ArchButton";
import { ServiceList } from "@/components/services/ServiceList";
import { about, privacy, visitLine } from "@/content/person";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { homeCopy } from "./copy";
import styles from "./home.module.css";

/**
 * "Wat ik voor je kan bouwen": the five services, each linking to its own
 * page and to the real projects that show it. A sticky introduction on the
 * left, the editorial list on the right.
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
        <ServiceList lang={lang} headingLevel="h3" />
      </div>
    </section>
  );
}

/** How client data is handled: AVG, nothing leaves the company, an NDA without discussion. */
export function Privacy({ lang }: { lang: Locale }) {
  return (
    <section id="gegevens" className={cn(styles.section, "unfold")} aria-labelledby="privacy-title">
      <div className={styles.aboutGrid}>
        <h2 id="privacy-title" className={styles.heading}>
          {privacy.title[lang]}
        </h2>
        <div className={styles.aboutText}>
          {privacy.body[lang].map((paragraph) => (
            <p key={paragraph} className={cn(styles.lead, styles.privacyText)}>
              {paragraph}
            </p>
          ))}
        </div>
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
        <p className={styles.bandBody}>
          {t.body[lang]} {visitLine[lang]}
        </p>
        <ArchButton variant="primary" size="lg" icon="arrowNE" href={`/${lang}/contact`} className={styles.bandAction}>
          {t.action[lang]}
        </ArchButton>
      </div>
    </section>
  );
}
