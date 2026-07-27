import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (typically ~20% smaller than WebP for photographic product
    // shots), falling back to WebP for browsers without AVIF support. Next.js
    // caches both formats it serves, so this only affects bytes sent to the
    // browser — matches the Accept header per-request.
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // Preserve SEO equity from the old WordPress site's URLs. Every one of
    // these is indexed WITH a trailing slash (e.g. /about-us/), but sources are
    // written without one: Next prepends its own internal `/:path+/` -> `/:path+`
    // 308 ahead of this list, so /about-us/ is stripped to /about-us before
    // these are matched. Adding "/" variants here would be dead code.
    return [
      // Verified live + indexed on the old WordPress site; all would 404 at cutover.
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/terms-and-conditions-tiny-homes-sa", destination: "/terms", permanent: true },

      // The Dome is discontinued and its page is gone, so both the old
      // WordPress URL (/thedome, indexed) and the current one (/the-dome, also
      // indexed) would 404. The dome was a glamping product and glamping
      // capsules are the closest remaining line, so sending both there keeps
      // the inbound link equity and lands visitors on something relevant
      // instead of a dead end.
      { source: "/thedome", destination: "/glamping-capsules", permanent: true },
      { source: "/the-dome", destination: "/glamping-capsules", permanent: true },

      // Rank Math's sitemap URLs. /sitemap_index.xml is the one currently
      // submitted in Search Console, so it must keep resolving after cutover.
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/page-sitemap.xml", destination: "/sitemap.xml", permanent: true },

      // Speculative — these paths were never live on the old site (they 404 there
      // today). Kept purely as defensive aliases for stale off-site links.
      { source: "/about-tiny-homes-sa", destination: "/about", permanent: true },
      { source: "/request-a-call", destination: "/contact", permanent: true },
    ];
  },
};

export default nextConfig;
