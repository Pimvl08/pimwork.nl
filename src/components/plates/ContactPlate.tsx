import type { Locale } from "@/i18n/config";

/** Placeholder plate, replaced by its feature build. */
export function ContactPlate({ lang }: { lang: Locale }) {
  return (
    <section id="contact" className="plate" aria-label="Contact" data-lang={lang}>
      <h2 className="text-[length:var(--step-4)] italic">Contact</h2>
    </section>
  );
}
