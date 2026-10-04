import type { Locale } from "@/i18n/config";

/** Placeholder plate, replaced by its feature build. */
export function AboutPlate({ lang }: { lang: Locale }) {
  return (
    <section id="about" className="plate" aria-label="About" data-lang={lang}>
      <h2 className="text-[length:var(--step-4)] italic">About</h2>
    </section>
  );
}
