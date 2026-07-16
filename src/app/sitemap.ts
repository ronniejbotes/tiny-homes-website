import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { productSlugs } from "@/data/products";

/** Date of the last content/pricing pass. Bump this when the site content changes. */
const SITE_UPDATED = new Date("2026-07-16");

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = SITE_UPDATED;

  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...productSlugs.map((slug) => ({
      url: `${site.url}/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    {
      url: `${site.url}/quote`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${site.url}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${site.url}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
