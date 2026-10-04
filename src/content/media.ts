import type { Bilingual } from "@/i18n/config";

/**
 * Real media from Pim's projects: screenshots and screen recordings captured
 * from the actual apps, and existing images from the project folders.
 * Files live in /public/media. Each entry records where it came from.
 */

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt: Bilingual<string>;
  /** Project slug this image belongs to, if any. */
  project?: string;
  /** How the file was made, for example "Playwright screenshot of dist/ build". */
  provenance: string;
  /** Tiny base64 blur placeholder (data:image/...), optional. */
  blurDataURL?: string;
}

export interface VideoAsset {
  /** Sources in order of preference. */
  sources: { src: string; type: string }[];
  poster: string;
  width: number;
  height: number;
  durationSeconds: number;
  title: Bilingual<string>;
  description: Bilingual<string>;
  project?: string;
  provenance: string;
}

export const images: ImageAsset[] = [];

export const videos: VideoAsset[] = [];

export function imagesFor(project: string): ImageAsset[] {
  return images.filter((image) => image.project === project);
}

export function videoFor(project: string): VideoAsset | undefined {
  return videos.find((video) => video.project === project);
}
