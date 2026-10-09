import Image from "next/image";
import Link from "next/link";
import homeStyles from "@/components/home/home.module.css";
import { ArcRule } from "@/components/ui/ArcRule";
import { ArchButton } from "@/components/ui/ArchButton";
import { Icon } from "@/components/ui/Icon";
import { FigureRule, Section } from "@/components/work/parts";
import styles from "@/components/work/work.module.css";
import { visitLine } from "@/content/person";
import { getProject, projectHref } from "@/content/projects";
import { sampleSites } from "@/content/sample-sites";
import { getService, type Service } from "@/content/services";
import type { Locale } from "@/i18n/config";
import { servicesCopy } from "./copy";

/**
 * One service as a full page, laid out like a project page: what it solves,
 * for whom, how Pim works, the projects that show it, and the way to the
 * contact page. The sample sites block only appears once there is a sample.
 */
export function ServicePage({ service, lang }: { service: Service; lang: Locale }) {
  const t = servicesCopy[lang];
  const id = (part: string) => `service-${part}`;
  const proof = service.proof.flatMap((item) => {
    const project = getProject(item.slug);
    return project ? [{ project, blurb: item.blurb[lang] }] : [];
  });
  const extra = service.extra ? getService(service.extra.service) : undefined;
  const samples = service.sampleSites ? sampleSites : [];

  return (
    <article className={styles.detail} aria-labelledby="service-title">
      <div className={styles.topbar}>
        <Link href={`/${lang}/diensten`} className={styles.backLink}>
          <Icon name="arrowLeft" size={18} />
          <span>{t.back}</span>
        </Link>
      </div>

      <header className={styles.pageHead}>
        <h1 id="service-title" className={styles.pageTitle}>
          {service.title[lang]}
        </h1>
        <p className={styles.pageLead}>{service.intro[lang]}</p>
      </header>

      <div className={styles.sections} style={{ marginTop: "clamp(3rem, 7vw, 5.5rem)" }}>
        <Section id={id("problem")} title={t.problem} as="h2">
          <p className={styles.prose}>{service.problem[lang]}</p>
        </Section>

        <Section id={id("audience")} title={t.audience} as="h2">
          <p className={styles.prose}>{service.audience[lang]}</p>
        </Section>

        <Section id={id("how")} title={t.how} as="h2">
          <p className={styles.prose}>{service.how[lang]}</p>
          {service.points?.length ? (
            <ol className={styles.figureList}>
              {service.points.map((point, i) => (
                <li key={point.title.nl} className={styles.figureItem}>
                  <FigureRule />
                  <span className={styles.figureNo} aria-hidden="true">
                    {i + 1}
                  </span>
                  <p className={styles.benefitText}>
                    {point.title[lang]}. <span className="text-ink-soft">{point.body[lang]}</span>
                  </p>
                </li>
              ))}
            </ol>
          ) : null}
        </Section>

        {service.example ? (
          <Section id={id("example")} title={t.example} as="h2">
            <p className={styles.prose}>{service.example[lang]}</p>
          </Section>
        ) : null}

        {samples.length ? (
          <Section id={id("samples")} title={t.samples} as="h2">
            <ul className="grid gap-10">
              {samples.map((site) => (
                <li key={site.url} className="grid max-w-[48rem] gap-3">
                  {site.image ? (
                    <Image
                      src={site.image.src}
                      width={site.image.width}
                      height={site.image.height}
                      alt={site.image.alt[lang]}
                      sizes="(min-width: 56rem) 48rem, 100vw"
                      className="h-auto w-full border border-[var(--rule)]"
                    />
                  ) : null}
                  <p className="label text-ink-mute">
                    {t.sampleLabel} · {site.trade[lang]}
                  </p>
                  <p className={styles.lede}>{site.name}</p>
                  <p className={styles.prose}>{site.description[lang]}</p>
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className={homeStyles.proofLink}>
                    <span>{t.visitSample}</span>
                    <Icon name="arrowNE" size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {proof.length ? (
          <Section id={id("built")} title={t.built} as="h2">
            <ul className="grid gap-6">
              {proof.map(({ project, blurb }) => (
                <li key={project.slug} className="grid gap-1">
                  <Link href={projectHref(lang, project)} className={`${homeStyles.proofLink} ${styles.lede}`}>
                    <span>{project.name}</span>
                    <Icon name="arrowNE" size={16} />
                  </Link>
                  <p className={styles.prose}>{blurb}</p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {service.extra && extra ? (
          <Section id={id("extra")} title={t.extra} as="h2">
            <p className={styles.prose}>{service.extra.body[lang]}</p>
            <div>
              <ArchButton href={`/${lang}/diensten/${extra.slug}`} variant="secondary" icon="arrowRight">
                {extra.name[lang]}
              </ArchButton>
            </div>
          </Section>
        ) : null}
      </div>

      <section className={homeStyles.band} style={{ marginTop: "clamp(4rem, 9vw, 7rem)" }} aria-labelledby={id("closing")}>
        <ArcRule className="inset-0 h-full w-full opacity-60" d="M-20 1000 A 900 900 0 0 1 1020 1000" draw />
        <h2 id={id("closing")} className={homeStyles.bandHeading}>
          {service.closing.title[lang]}
        </h2>
        <p className={homeStyles.bandBody}>
          {service.closing.body[lang]} {visitLine[lang]}
        </p>
        <ArchButton variant="primary" size="lg" icon="arrowNE" href={`/${lang}/contact`} className={homeStyles.bandAction}>
          {t.contact}
        </ArchButton>
      </section>
    </article>
  );
}
