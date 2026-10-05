import { MachineConsole } from "@/components/machine/MachineConsole";
import { machineCopy as c } from "@/components/machine/copy";
import { ArcRule } from "@/components/ui/ArcRule";
import { PlateHeading } from "@/components/ui/PlateHeading";
import type { Locale } from "@/i18n/config";

/** Plate 06: AI as Pim's daily tool, and a terminal that can be questioned. */
export function MachinePlate({ lang }: { lang: Locale }) {
  return (
    <section id="machine" className="plate relative isolate" aria-labelledby="machine-title">
      {/* The arc lives in the plate's top padding band, so it never crosses the heading or content. */}
      <ArcRule className="-z-10 inset-x-0 top-0 h-[var(--section-y)] w-full opacity-60" d="M-20 960 A 1500 1500 0 0 1 1020 60" />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-8">
          <PlateHeading numeral="06" id="machine-title" lead={c.lead[lang]}>
            {c.title[lang]}
          </PlateHeading>
          <p className="measure text-ink-soft">{c.body[lang]}</p>
          <dl className="unfold flex flex-col gap-4 border-t border-rule pt-6">
            {c.modes[lang].map((m) => (
              <div key={m.term} className="grid grid-cols-[5.5rem_1fr] gap-4">
                <dt className="label text-ink">{m.term}</dt>
                <dd className="text-ink-soft">{m.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <MachineConsole lang={lang} />
      </div>
    </section>
  );
}
