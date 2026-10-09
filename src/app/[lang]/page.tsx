import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AboutTeaser, ContactBand, Privacy, Services } from "@/components/home/HomeSections";
import { HeroPlate } from "@/components/plates/HeroPlate";
import { JsonLd } from "@/components/seo/JsonLd";
import { FeaturedWork } from "@/components/work/FeaturedWork";
import { isLocale } from "@/i18n/config";
import { professionalService } from "@/lib/structured-data";

/**
 * The home page, short on purpose: who Pim is, featured work, what he can
 * build, a little about him and the way to get in touch. Every section leads
 * to its own page. Rendering is per request (connection()) because every
 * response carries a fresh CSP nonce.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  await connection();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <main id="main">
      <JsonLd data={professionalService(lang)} />
      <HeroPlate lang={lang} />
      <FeaturedWork lang={lang} />
      <Services lang={lang} />
      <Privacy lang={lang} />
      <AboutTeaser lang={lang} />
      <ContactBand lang={lang} />
    </main>
  );
}
