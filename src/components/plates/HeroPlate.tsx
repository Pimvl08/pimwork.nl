import type { Locale } from "@/i18n/config";

/** Placeholder plate, replaced by its feature build. */
export function HeroPlate({ lang }: { lang: Locale }) {
  return (
    <section id="cover" className="plate" aria-label="Hero" data-lang={lang}>
      <h2 className="text-[length:var(--step-4)] italic">Hero</h2>
    </section>
  );
}
