import type { Locale } from "@/i18n/config";

/** Placeholder plate, replaced by its feature build. */
export function WorkPlate({ lang }: { lang: Locale }) {
  return (
    <section id="work" className="plate" aria-label="Work" data-lang={lang}>
      <h2 className="text-[length:var(--step-4)] italic">Work</h2>
    </section>
  );
}
