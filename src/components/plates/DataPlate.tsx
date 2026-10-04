import type { Locale } from "@/i18n/config";

/** Placeholder plate, replaced by its feature build. */
export function DataPlate({ lang }: { lang: Locale }) {
  return (
    <section id="data" className="plate" aria-label="Data" data-lang={lang}>
      <h2 className="text-[length:var(--step-4)] italic">Data</h2>
    </section>
  );
}
