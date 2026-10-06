import { ArchButton } from "@/components/ui/ArchButton";
import { ArcRule } from "@/components/ui/ArcRule";
import { person, privacy } from "@/content/person";
import type { Locale } from "@/i18n/config";
import { ContactForm } from "./ContactForm";
import { contactCopy as copy } from "./copy";
import styles from "./contact.module.css";

/**
 * The contact page: the form posts to /api/contact, phone and email stay
 * beside it for people who would rather call or write directly.
 */
export function ContactPage({ lang, renderedAt }: { lang: Locale; renderedAt: number }) {
  const note = copy.alt;
  return (
    <main id="main" className={`plate relative isolate pt-[calc(var(--section-y)+3rem)] ${styles.plate}`}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-20 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <header className="flex flex-col gap-5">
          <h1 className="text-[length:var(--step-4)] leading-[1.02]">{copy.title[lang]}</h1>
          <p className="measure font-serif text-[length:var(--step-1)] leading-snug text-ink-soft">{copy.lead[lang]}</p>
        </header>
        {/* The arc lives in the empty cell beside the heading, so it never
            crosses the heading, the form or the side note. */}
        <div className="relative hidden lg:block">
          <ArcRule className="inset-0 h-full w-full" d="M0 1000 A 1000 1000 0 0 1 1000 0" draw />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-14 md:mt-16 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <ContactForm lang={lang} renderedAt={renderedAt} />
        </div>

        <aside aria-labelledby="contact-alt-title" className={styles.aside}>
          <h2 id="contact-alt-title" className="text-[length:var(--step-2)] leading-tight">
            {note.heading[lang]}
          </h2>
          <p className="measure mt-4 text-ink-soft">{note.body[lang]}</p>
          <p className="data mt-5 text-[length:var(--step--1)] text-ink-mute">
            {person.phone.display}
            <br />
            {person.email}
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <ArchButton variant="secondary" icon="phone" href={person.phone.href}>
              {note.call[lang]}
            </ArchButton>
            <ArchButton variant="secondary" icon="mail" href={`mailto:${person.email}`}>
              {note.mail[lang]}
            </ArchButton>
          </div>
          <h3 className="mt-12 text-[length:var(--step-1)] leading-tight">{privacy.title[lang]}</h3>
          <p className="measure mt-3 text-ink-soft">{privacy.body[lang].join(" ")}</p>
        </aside>
      </div>
    </main>
  );
}
