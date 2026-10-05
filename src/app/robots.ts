import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Everything may be crawled except the API and the hidden egg ledger. */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/nl/geheim", "/en/geheim"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
