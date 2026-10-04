import type { Locale } from "@/i18n/config";

/** Placeholder plate, replaced by its feature build. */
export function MachinePlate({ lang }: { lang: Locale }) {
  return (
    <section id="machine" className="plate" aria-label="Machine" data-lang={lang}>
      <h2 className="text-[length:var(--step-4)] italic">Machine</h2>
    </section>
  );
}
