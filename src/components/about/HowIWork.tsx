import { about } from "@/content/person";
import type { Locale } from "@/i18n/config";
import { aboutCopy } from "./copy";
import { figureNumeral } from "./logic";
import styles from "./about.module.css";

/**
 * "Hoe ik werk": how Pim builds, with the four principles as numbered
 * figures. The only place on the site that names the tools he builds with.
 */
export function HowIWork({ lang }: { lang: Locale }) {
  const how = about.howIWork;
  return (
    <section aria-labelledby="how-title" className={styles.how}>
      <h2 id="how-title" className="text-[length:var(--step-3)] leading-tight">
        {how.title[lang]}
      </h2>
      <p className="measure font-serif mt-6 text-[length:var(--step-1)] leading-snug text-ink">{how.lead[lang]}</p>
      <div className="measure mt-6 flex flex-col gap-5 text-ink-soft">
        {how.body[lang].map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <h3 id="how-principles" className="mt-[clamp(3rem,6vw,4.5rem)] text-[length:var(--step-2)] leading-tight">
        {aboutCopy.principles.title[lang]}
      </h3>
      <ol className={styles.principles} aria-labelledby="how-principles">
        {how.principles.map((principle, i) => (
          <li key={i} className={styles.principle}>
            <svg className={styles.principleArc} viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M0.5 19.5 Q50 -9 99.5 19.5" fill="none" stroke="currentColor" vectorEffect="non-scaling-stroke" pathLength={1} className="arc-draw" />
            </svg>
            <h4 className="flex items-baseline gap-3 font-normal">
              <span className="numeral text-[length:var(--step-0)] text-ink-mute" aria-hidden="true">
                {figureNumeral(i)}
              </span>
              <span className="font-serif text-[length:var(--step-1)] leading-snug text-ink">{principle.title[lang]}</span>
            </h4>
            <p className="mt-3 text-ink-soft">{principle.body[lang]}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
