import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AboutPlate } from "@/components/plates/AboutPlate";
import { ContactPlate } from "@/components/plates/ContactPlate";
import { DataPlate } from "@/components/plates/DataPlate";
import { HeroPlate } from "@/components/plates/HeroPlate";
import { LabPlate } from "@/components/plates/LabPlate";
import { MachinePlate } from "@/components/plates/MachinePlate";
import { MediaPlate } from "@/components/plates/MediaPlate";
import { WorkPlate } from "@/components/plates/WorkPlate";
import { isLocale } from "@/i18n/config";

/**
 * The home page is one long sheet of plates. Rendering is per request
 * (connection()) because every response carries a fresh CSP nonce.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  await connection();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <main id="main">
      <HeroPlate lang={lang} />
      <AboutPlate lang={lang} />
      <WorkPlate lang={lang} />
      <LabPlate lang={lang} />
      <MediaPlate lang={lang} />
      <DataPlate lang={lang} />
      <MachinePlate lang={lang} />
      <ContactPlate lang={lang} />
    </main>
  );
}
