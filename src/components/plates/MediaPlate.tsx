import type { Locale } from "@/i18n/config";

/** Placeholder plate, replaced by its feature build. */
export function MediaPlate({ lang }: { lang: Locale }) {
  return (
    <section id="media" className="plate" aria-label="Media" data-lang={lang}>
      <h2 className="text-[length:var(--step-4)] italic">Media</h2>
    </section>
  );
}
