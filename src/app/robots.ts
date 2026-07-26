import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // robots.txt has no llms.txt directive and Next's serialiser emits no comments, so an
      // explicit Allow is the only standards-valid way to name /llms.txt here: it points AI
      // crawlers (which fetch robots.txt first) at the file and pins it as crawlable.
      allow: ["/", "/llms.txt"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
