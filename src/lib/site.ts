/** Public base URL, used for metadata, sitemap and OG images. */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  if (fromEnv && /^https?:\/\//.test(fromEnv)) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") return "https://pimwork.nl";
  return "http://localhost:3000";
}
