import { facts } from "@/content/person";
import type { Locale } from "@/i18n/config";
import { aboutCopy } from "./copy";
import { visibleFacts } from "./logic";
import styles from "./about.module.css";

/** Facts as figure labels. Only facts with a value appear; empty ones are left out. */
export function FactList({ lang }: { lang: Locale }) {
  const shown = visibleFacts(facts, lang);
  if (shown.length === 0) return null;
  return (
    <div>
      <h2 id="about-facts" className="sr-only">
        {aboutCopy.facts.title[lang]}
      </h2>
      <dl className={styles.facts} aria-labelledby="about-facts">
        {shown.map((fact) => (
          <div key={fact.id} className={styles.fact}>
            <dt className="label text-ink-mute">{fact.label}</dt>
            <dd className="mt-1.5 text-[length:var(--step-0)] leading-snug text-ink">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
