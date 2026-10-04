import type { Locale } from "@/i18n/config";

/** Placeholder plate, replaced by its feature build. */
export function LabPlate({ lang }: { lang: Locale }) {
  return (
    <section id="lab" className="plate" aria-label="Lab" data-lang={lang}>
      <h2 className="text-[length:var(--step-4)] italic">Lab</h2>
    </section>
  );
}
