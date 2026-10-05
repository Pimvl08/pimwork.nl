import { about } from "@/content/person";
import { ArchButton } from "@/components/ui/ArchButton";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n/config";
import { aboutCopy } from "./copy";
import { FactList } from "./FactList";
import { HowIWork } from "./HowIWork";
import { Portrait } from "./Portrait";
import styles from "./about.module.css";

/**
 * The about page: who Pim is beside the arched portrait frame, the facts
 * that are known, how he works, and a way on to his work or to contact.
 */
export function AboutPage({ lang }: { lang: Locale }) {
  const c = aboutCopy;
  const [first, ...rest] = about.intro[lang];
  return (
    <main id="main" className={`plate relative isolate ${styles.root} ${styles.page}`}>
      <div className="grid items-start gap-x-[clamp(2.5rem,6vw,6rem)] gap-y-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="order-2 lg:order-1 lg:pt-4">
          <Portrait lang={lang} />
        </div>
        <div className="order-1 flex flex-col gap-8 lg:order-2">
          <h1 className="text-[length:var(--step-4)] italic leading-[1.02]">{c.title[lang]}</h1>
          {first ? <p className="measure text-[length:var(--step-1)] leading-[1.45] text-ink">{first}</p> : null}
          {rest.map((paragraph, i) => (
            <p key={i} className="measure text-ink-soft">
              {paragraph}
            </p>
          ))}
          <div className="mt-2 max-w-[44rem]">
            <FactList lang={lang} />
          </div>
        </div>
      </div>

      <HowIWork lang={lang} />

      <section aria-labelledby="about-next" className={styles.closing}>
        <h2 id="about-next" className="text-[length:var(--step-3)] italic leading-tight">
          {c.closing.title[lang]}
        </h2>
        <p className="measure mt-5 text-ink-soft">{c.closing.body[lang]}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <ArchButton href={`/${lang}/werk`} icon="arrowRight">
            {c.closing.work[lang]}
          </ArchButton>
          <ArchButton href={`/${lang}/contact`} variant="secondary" icon="mail">
            {c.closing.contact[lang]}
          </ArchButton>
        </div>
        <a href={`/portfolio-pim-${lang}.pdf`} download className={styles.download}>
          <Icon name="download" size={18} />
          <span>{c.closing.portfolio[lang]}</span>
        </a>
      </section>
    </main>
  );
}
