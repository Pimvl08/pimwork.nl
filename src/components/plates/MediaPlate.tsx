import { Gallery, type GalleryProject } from "@/components/media/Gallery";
import { VideoShowcase } from "@/components/media/VideoShowcase";
import { mediaCopy } from "@/components/media/copy";
import { ArcRule } from "@/components/ui/ArcRule";
import { OpenSlot } from "@/components/ui/OpenSlot";
import { PlateHeading } from "@/components/ui/PlateHeading";
import { images, videos } from "@/content/media";
import { projects } from "@/content/projects";
import type { Locale } from "@/i18n/config";

/**
 * Plate 04: real screenshots and screen recordings of Pim's own projects.
 * Everything comes from src/content/media.ts (captured with
 * scripts/capture-media.mjs); without media the plate shows honest empty slots.
 */
export function MediaPlate({ lang }: { lang: Locale }) {
  const t = mediaCopy[lang];
  const withMedia = new Set([...images, ...videos].map((item) => item.project));
  const galleryProjects: GalleryProject[] = projects
    .filter((project) => images.some((image) => image.project === project.slug))
    .map((project) => ({ slug: project.slug, name: project.name }));
  const videoProjects = Object.fromEntries(
    projects
      .filter((project) => withMedia.has(project.slug))
      .map((project) => [project.slug, { name: project.name, href: `/${lang}/werk/${project.slug}` }]),
  );

  return (
    <section id="media" className="plate relative" aria-labelledby="media-title">
      <ArcRule className="pointer-events-none inset-x-0 top-0 h-[40vh] opacity-60" draw />
      <PlateHeading numeral="04" id="media-title" lead={t.lead}>
        {t.title}
      </PlateHeading>

      <div className="mt-[clamp(3rem,8vw,6rem)] flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-[length:var(--step-2)] italic">{t.galleryTitle}</h3>
          {images.length ? <p className="measure text-ink-soft">{t.galleryNote}</p> : null}
        </div>
        {images.length ? (
          <Gallery lang={lang} images={images} projects={galleryProjects} />
        ) : (
          <OpenSlot lang={lang} what={t.emptyImages} className="max-w-md" />
        )}
      </div>

      <div className="mt-[clamp(4rem,10vw,8rem)] flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-[length:var(--step-2)] italic">{t.videosTitle}</h3>
          {videos.length ? <p className="measure text-ink-soft">{t.videosNote}</p> : null}
        </div>
        {videos.length ? (
          <VideoShowcase lang={lang} videos={videos} projects={videoProjects} />
        ) : (
          <OpenSlot lang={lang} what={t.emptyVideos} className="max-w-md" />
        )}
      </div>

      <p className="measure mt-[clamp(3rem,7vw,5rem)] text-[length:var(--step--1)] italic text-ink-mute">{t.absent}</p>
    </section>
  );
}
