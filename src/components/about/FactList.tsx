import { OpenSlot } from "@/components/ui/OpenSlot";
import { facts, person } from "@/content/person";
import type { Locale } from "@/i18n/config";
import { aboutCopy } from "./copy";
import styles from "./about.module.css";

/**
 * Facts as figure labels. Every filled fact carries its source, revealed on
 * hover and keyboard focus (always visible on touch screens), so each claim
 * can be checked. Facts without a value render an open slot.
 */
export function FactList({ lang }: { lang: Locale }) {
  const t = aboutCopy.facts;
  return (
    <div>
      <h3 id="about-facts" className="sr-only">
        {t.title[lang]}
      </h3>
      <dl className={styles.facts} aria-labelledby="about-facts">
        {facts.map((fact) => {
          const value = fact.value?.[lang] ?? null;
          const focusable = Boolean(fact.source) && fact.id !== "github";
          return (
            <div
              key={fact.id}
              className={styles.fact}
              data-open={value === null || undefined}
              tabIndex={focusable ? 0 : undefined}
            >
              <dt className="label text-ink-mute">{fact.label[lang]}</dt>
              <dd className="mt-1.5 text-[length:var(--step-0)] italic leading-snug text-ink">
                {value === null ? (
                  <OpenSlot lang={lang} compact />
                ) : fact.id === "github" ? (
                  <a href={person.github.href} target="_blank" rel="noopener noreferrer" className="underline">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
              {fact.source ? (
                <dd className={styles.source}>
                  {t.source[lang]}: {fact.source}
                </dd>
              ) : null}
            </div>
          );
        })}
      </dl>
      <p className="mt-4 text-[length:var(--step--1)] italic text-ink-mute [@media(hover:none)]:hidden">{t.hint[lang]}</p>
    </div>
  );
}
