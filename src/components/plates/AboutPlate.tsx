import type { ReactNode } from "react";
import { FactList } from "@/components/about/FactList";
import { InterestFan } from "@/components/about/InterestFan";
import { MeasureTable } from "@/components/about/MeasureTable";
import { Portrait } from "@/components/about/Portrait";
import { Timeline } from "@/components/about/Timeline";
import { aboutCopy } from "@/components/about/copy";
import { countWord, monthOf } from "@/components/about/logic";
import styles from "@/components/about/about.module.css";
import { PlateHeading } from "@/components/ui/PlateHeading";
import { projects } from "@/content/projects";
import type { Locale } from "@/i18n/config";

/** Bio sentences with the counts and months filled in from projects.ts. */
function bioSentences(lang: Locale): string[] {
  const froms = projects.map((p) => p.period.from).sort();
  const tos = projects.map((p) => p.period.to).sort();
  const first = monthOf(froms[0]);
  const last = monthOf(tos[tos.length - 1]);
  const months = aboutCopy.timeline.months[lang];
  return aboutCopy.bio[lang].map((sentence) =>
    sentence
      .replace("{count}", countWord(projects.length, lang))
      .replace("{fromMonth}", months[first.month])
      .replace("{toMonth}", months[last.month])
      .replace("{year}", String(last.year)),
  );
}

/** A sub-plate heading: figure numeral plus italic name, like the board. */
function SubHeading({ id, numeral, children, lead }: { id: string; numeral: string; children: ReactNode; lead?: string }) {
  return (
    <div className="mb-10 flex flex-col gap-3 md:mb-12">
      <h3 id={id} className="flex items-baseline gap-[0.45em] text-[length:var(--step-2)] italic">
        <span className="numeral text-[0.5em] text-ink-mute" aria-hidden="true">
          {numeral}
        </span>
        <span>{children}</span>
      </h3>
      {lead ? <p className="measure text-ink-soft">{lead}</p> : null}
    </div>
  );
}

/**
 * Plate 01, "Wie / Who". One arc rules the composition: the arched portrait
 * frame beside a short bio and checkable facts, then the interests fanned
 * along an arc, the projects on a compass timeline and a measurement table.
 */
export function AboutPlate({ lang }: { lang: Locale }) {
  const c = aboutCopy;
  return (
    <section id="about" className={`plate ${styles.root}`} aria-labelledby="about-title">
      <PlateHeading numeral="01" id="about-title" lead={c.lead[lang]}>
        {c.title[lang]}
      </PlateHeading>

      <div className="mt-16 grid items-end gap-x-[clamp(2.5rem,6vw,6rem)] gap-y-14 md:mt-20 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Portrait lang={lang} />
        <div className="flex flex-col gap-10">
          <p className="measure text-[length:var(--step-1)] leading-[1.45] text-ink-soft">
            {bioSentences(lang).map((sentence, i) => (
              <span key={i}>
                {i > 0 ? " " : null}
                {sentence}
              </span>
            ))}
          </p>
          <FactList lang={lang} />
        </div>
      </div>

      <div className="mt-[clamp(5rem,10vw,9rem)]">
        <SubHeading id="about-interests" numeral="1.1" lead={c.interests.lead[lang]}>
          {c.interests.title[lang]}
        </SubHeading>
        <InterestFan lang={lang} />
      </div>

      <div className="mt-[clamp(4rem,8vw,7rem)]">
        <SubHeading id="about-timeline" numeral="1.2" lead={c.timeline.lead[lang]}>
          {c.timeline.title[lang]}
        </SubHeading>
        <Timeline lang={lang} />
      </div>

      <div className="mt-[clamp(4rem,8vw,7rem)] max-w-[56rem]">
        <SubHeading id="about-measures" numeral="1.3" lead={c.measures.lead[lang]}>
          {c.measures.title[lang]}
        </SubHeading>
        <MeasureTable lang={lang} />
      </div>
    </section>
  );
}
