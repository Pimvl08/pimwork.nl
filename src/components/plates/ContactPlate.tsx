import { ContactForm } from "@/components/contact/ContactForm";
import { contactCopy as copy } from "@/components/contact/copy";
import styles from "@/components/contact/contact.module.css";
import { ArchButton } from "@/components/ui/ArchButton";
import { ArcRule } from "@/components/ui/ArcRule";
import { PlateHeading } from "@/components/ui/PlateHeading";
import { person } from "@/content/person";
import type { Locale } from "@/i18n/config";

/** Server time of this render, handed to the form for the timing check. */
function renderTime(): number {
  return Date.now();
}

/**
 * Plate 07: write Pim. The form posts to /api/contact; GitHub stays visible
 * next to it as the channel that always works.
 */
export function ContactPlate({ lang }: { lang: Locale }) {
  const renderedAt = renderTime();
  return (
    <section id="contact" className={`plate relative ${styles.plate}`} aria-labelledby="contact-title">
      <ArcRule className="inset-0 -z-10 hidden md:block" d="M560 -10 A 760 760 0 0 0 1010 620" draw />
      <PlateHeading numeral="07" id="contact-title" lead={copy.lead[lang]}>
        {copy.title[lang]}
      </PlateHeading>

      <div className="mt-12 grid gap-14 md:mt-16 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
        <ContactForm lang={lang} renderedAt={renderedAt} githubHref={person.github.href} />

        <aside aria-labelledby="contact-alt-title" className={styles.aside}>
          <h3 id="contact-alt-title" className="text-[length:var(--step-2)] italic leading-tight">
            {copy.alt.heading[lang]}
          </h3>
          <p className="measure mt-4 text-ink-soft">{copy.alt.body[lang]}</p>
          <p className="data mt-5 text-[length:var(--step--1)] text-ink-mute">github.com/{person.github.handle}</p>
          <div className="mt-7">
            <ArchButton variant="secondary" icon="github" href={person.github.href}>
              {copy.alt.button[lang]}
            </ArchButton>
          </div>
        </aside>
      </div>
    </section>
  );
}
