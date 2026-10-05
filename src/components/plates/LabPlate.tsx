import { LabStage } from "@/components/lab/LabStage";
import { labCopy } from "@/components/lab/copy";
import { PlateHeading } from "@/components/ui/PlateHeading";
import type { Locale } from "@/i18n/config";

/**
 * Plate 03, "Lab". Five experiments share one stage; the tabs sit on a
 * compass arc above it and only the chosen experiment is ever loaded.
 */
export function LabPlate({ lang }: { lang: Locale }) {
  return (
    <section id="lab" className="plate" aria-labelledby="lab-title">
      <PlateHeading numeral="03" id="lab-title" lead={labCopy.lead[lang]}>
        {labCopy.title[lang]}
      </PlateHeading>
      <LabStage lang={lang} />
    </section>
  );
}
