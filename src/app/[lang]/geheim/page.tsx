import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArcRule } from "@/components/ui/ArcRule";
import { ArchButton } from "@/components/ui/ArchButton";
import { PlateHeading } from "@/components/ui/PlateHeading";
import { isLocale } from "@/i18n/config";
import { secretCopy } from "./copy";
import { EggLedger } from "./EggLedger";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = secretCopy[isLocale(lang) ? lang : "nl"];
  return { title: t.meta, robots: { index: false, follow: false } };
}

/** Plate 99: the hidden plate that lists the easter eggs. Not indexed. */
export default async function SecretPage({ params }: { params: Promise<{ lang: string }> }) {
  await connection();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = secretCopy[lang];

  return (
    <main id="main" className="plate relative isolate min-h-[100dvh] pt-[calc(var(--section-y)+3rem)]">
      <ArcRule className="-z-10 inset-x-0 top-0 h-[55%] opacity-60" draw />
      <div className="flex max-w-[72rem] flex-col gap-12">
        <PlateHeading numeral="99" as="h1" lead={t.lead}>
          {t.title}
        </PlateHeading>
        <EggLedger lang={lang} />
        <p className="measure text-[length:var(--step--1)] text-ink-mute">{t.note}</p>
        <div className="flex flex-wrap gap-4">
          <ArchButton href={`/${lang}`} variant="secondary" icon="arrowLeft">
            {t.back}
          </ArchButton>
        </div>
      </div>
    </main>
  );
}
