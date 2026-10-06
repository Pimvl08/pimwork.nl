import { cn } from "@/lib/cn";
import type { Locale } from "@/i18n/config";

const copy = {
  nl: { open: "Nog in te vullen", hint: "Deze plek is bewust leeg gelaten tot Pim hem invult." },
  en: { open: "To be filled in", hint: "This slot is deliberately empty until Pim fills it in." },
};

/**
 * An honest empty slot: a dashed arched frame that says what belongs here.
 * Used instead of invented filler wherever a fact is missing.
 */
export function OpenSlot({ lang, what, className, compact = false }: { lang: Locale; what?: string; className?: string; compact?: boolean }) {
  const t = copy[lang];
  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-2 text-ink-mute", className)}>
        <span aria-hidden="true" className="inline-block h-px w-6 border-t border-dashed border-ink-faint" />
        {t.open}
      </span>
    );
  }
  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-t-[999px] border border-dashed border-ink-faint px-6 pb-8 pt-14 text-center",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="label text-ink-mute">{t.open}</span>
        {what ? <span className="text-[length:var(--step-1)] text-ink">{what}</span> : null}
        <span className="max-w-[24ch] text-[length:var(--step--1)] text-ink-mute">{t.hint}</span>
      </div>
    </div>
  );
}
