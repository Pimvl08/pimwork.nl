import type { Locale } from "@/i18n/config";
import { labCopy } from "./copy";
import { LabStage } from "./LabStage";

/**
 * The lab as its own page. Five experiments share one stage; the tabs sit on
 * a compass arc above it and only the chosen experiment is ever loaded.
 */
export function LabPage({ lang }: { lang: Locale }) {
  return (
    <main id="main" className="plate relative isolate pt-[calc(var(--section-y)+3rem)]" aria-labelledby="lab-title">
      <header className="flex max-w-[60rem] flex-col gap-5">
        <h1 id="lab-title" className="text-[length:var(--step-4)] leading-[1.02]">
          {labCopy.title[lang]}
        </h1>
        <p className="measure font-serif text-[length:var(--step-1)] leading-snug text-ink-soft">{labCopy.lead[lang]}</p>
      </header>
      <LabStage lang={lang} />
    </main>
  );
}
