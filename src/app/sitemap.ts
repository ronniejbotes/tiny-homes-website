import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { productSlugs } from "@/data/products";
import { blogPostsByDate } from "@/data/blog";

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
    /* The pod hub, below the product pages at 0.9. It exists to catch a
       vocabulary the catalogue names miss and to feed the products it links
       to — the seven ranges are still what this site is selling, and nothing
       here should suggest a comparison page outranks them. */
    {
      url: `${site.url}/housing-pods`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${site.url}/blog`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    /* Posts carry their OWN lastmod, not the deploy timestamp: a post that has
       not been edited since March should not tell Google it changed on every
       unrelated deploy, which is how a sitemap teaches a crawler to stop
       trusting the field. `dateModified` falls back to the publish date. */
    ...blogPostsByDate.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(`${post.dateModified ?? post.datePublished}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${site.url}/quote`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/book-a-viewing`,
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
