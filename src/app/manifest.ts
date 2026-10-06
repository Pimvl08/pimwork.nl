import type { MetadataRoute } from "next";

/** Install metadata. Colours are the graphite theme's paper tokens. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PimWork",
    short_name: "PimWork",
    description: "Software die werk uit handen neemt.",
    start_url: "/nl",
    scope: "/",
    display: "standalone",
    background_color: "#121211",
    theme_color: "#121211",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
