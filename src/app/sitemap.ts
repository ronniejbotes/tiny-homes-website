import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { productSlugs } from "@/data/products";

/**
 * Content ships with the code, so "last deployed" is the truthful lastmod. This route uses no
 * request-time APIs, so Next prerenders it and freezes this value at `next build`, which the
 * Hostinger Node app runs on every deploy. Read at module scope rather than inside the handler
 * so all URLs share one timestamp and it can never churn per request if the route is re-rendered.
 */
const LAST_DEPLOYED = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = LAST_DEPLOYED;

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
    {
      url: `${site.url}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
