import type { MetadataRoute } from "next";

/** Install metadata. Colours are the graphite theme's paper tokens. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pim",
    short_name: "Pim",
    description: "Wat Pim bouwt met code en AI.",
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
