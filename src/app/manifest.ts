import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import images from "@/data/images.json";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tiny Homes SA — Prefab Tiny Homes South Africa",
    short_name: "Tiny Homes SA",
    description: site.description,
    start_url: "/",
    display: "standalone",
    // Brand tokens: forest / cream (see globals.css @theme).
    theme_color: "#1e3a2b",
    background_color: "#faf6ef",
    icons: [
      {
        src: images.brand.favicon,
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
