import { ArchButton } from "@/components/ui/ArchButton";
import { ArcRule } from "@/components/ui/ArcRule";
import { person } from "@/content/person";
import type { Locale } from "@/i18n/config";
import { mailConfig } from "@/lib/mail";
import { ContactForm } from "./ContactForm";
import { contactCopy as copy } from "./copy";
import styles from "./contact.module.css";

/** True when the server has a mail connection; only this boolean leaves the server. */
function canSend(): boolean {
  return mailConfig() !== null;
}

/**
 * The contact page: the form posts to /api/contact, phone and email stay beside it as
 * the channels that always work. While no mail connection is set up, the side
 * note says so plainly and moves above the form on small screens.
 */
export function ContactPage({ lang, renderedAt }: { lang: Locale; renderedAt: number }) {
  const sending = canSend();
  const note = sending ? copy.alt : copy.offline;
  return (
    <main id="main" className={`plate relative isolate pt-[calc(var(--section-y)+3rem)] ${styles.plate}`}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-20 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <header className="flex flex-col gap-5">
          <h1 className="text-[length:var(--step-4)] italic leading-[1.02]">{copy.title[lang]}</h1>
          <p className="measure text-[length:var(--step-1)] leading-snug text-ink-soft">{copy.lead[lang]}</p>
        </header>
        {/* The arc lives in the empty cell beside the heading, so it never
            crosses the heading, the form or the side note. */}
        <div className="relative hidden lg:block">
          <ArcRule className="inset-0 h-full w-full" d="M0 1000 A 1000 1000 0 0 1 1000 0" draw />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-14 md:mt-16 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
        <div className={sending ? undefined : "order-2 lg:order-1"}>
          <ContactForm lang={lang} renderedAt={renderedAt} />
        </div>

        <aside aria-labelledby="contact-alt-title" className={`${styles.aside} ${sending ? "" : "order-1 lg:order-2"}`}>
          <h2 id="contact-alt-title" className="text-[length:var(--step-2)] italic leading-tight">
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
        </aside>
      </div>
    </main>
  );
}
