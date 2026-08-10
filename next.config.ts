import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (typically ~20% smaller than WebP for photographic product
    // shots), falling back to WebP for browsers without AVIF support. Next.js
    // caches both formats it serves, so this only affects bytes sent to the
    // browser — matches the Accept header per-request.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    // Why this exists: Next.js sends `Cache-Control: s-maxage=31536000` on every
    // fully-static prerendered page (documented in
    // node_modules/next/dist/docs/01-app/02-guides/cdn-caching.md). That default
    // assumes the CDN is tied to the deployment and gets purged on every deploy —
    // true on Vercel, NOT true of Hostinger's `hcdn` edge.
    //
    // The failure it caused: hcdn cached the HTML for a year. Each redeploy
    // rebuilds `/_next/static/chunks/*` under fresh content hashes and deletes the
    // old files, but the edge kept serving the OLD HTML, which still pointed at
    // those deleted chunks. They 404'd, React never hydrated, and because every
    // section is server-rendered inside <Reveal> at opacity:0 waiting for JS to
    // animate it in, the whole site rendered as a blank cream page — and the
    // product pages tripped error.tsx ("The site didn't load").
    //
    // The fix: HTML must be revalidated rather than trusted for a year. Next still
    // sends an ETag, so revalidation is a cheap 304, not a re-render.
    //
    // Scope: only single-segment paths, which is every route this site has (`/`,
    // `/about`, `/contact`, `/privacy`, `/quote`, `/terms`, and the eight
    // `/[product]` pages) plus small root files like /sitemap.xml and /robots.txt,
    // which should not be frozen for a year either. Deliberately NOT matched:
    // `/_next/static/*` (content-hashed and immutable — Next refuses to let it be
    // overridden anyway), `/_next/image` (the optimiser's own cache), and the
    // 132 MB of `/images/*`, `/videos/*` and `/models/*` under public/, all of
    // which are nested deeper than one segment and keep their long-lived caching.
    // That matters: §12 of docs/DEPLOY-HOSTINGER.md notes the account-wide 20 MB/s
    // I/O ceiling, so the media must stay cacheable at the edge. HTML is ~100 KB
    // and is not what saturates that budget.
    const revalidateHtml = [
      {
        key: "Cache-Control",
        value: "public, max-age=0, must-revalidate",
      },
    ];
    return [
      { source: "/", headers: revalidateHtml },
      { source: "/:path", headers: revalidateHtml },
    ];
  },
  async redirects() {
    // Preserve SEO equity from the old WordPress site's URLs. Every one of
    // these is indexed WITH a trailing slash (e.g. /about-us/), but sources are
    // written without one: Next prepends its own internal `/:path+/` -> `/:path+`
    // 308 ahead of this list, so /about-us/ is stripped to /about-us before
    // these are matched. Adding "/" variants here would be dead code.
    return [
      // Canonical host. www.tinyhomesa.com served a byte-identical copy of the
      // whole site under a 200 (verified by matching sha1 on 2026-08-10), so
      // every page existed at two addresses and Google had to pick one itself.
      // Listed FIRST so the host is normalised before any path rule runs,
      // otherwise a www request matches a path redirect below and needs a
      // second hop to reach the apex.
      //
      // `permanent: true` emits a 308, which Google treats as a 301 for
      // canonicalisation. If this has no effect in production, the host header
      // is being rewritten upstream and the redirect belongs in the Hostinger
      // panel instead — this rule is harmless either way, as it cannot match.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.tinyhomesa.com" }],
        destination: "https://tinyhomesa.com/:path*",
        permanent: true,
      },

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

      // DIY garages are withdrawn from sale (owner decision 2026-08-04): the
      // design needs an engineer's sign-off before we can carry public and
      // property liability under the CPA. Deliberately NOT permanent, because
      // the line is expected back once that is in place and a 308 would
      // consolidate /garages into the homepage in Google's index.
      { source: "/garages", destination: "/", permanent: false },

      // Speculative — these paths were never live on the old site (they 404 there
      // today). Kept purely as defensive aliases for stale off-site links.
      { source: "/about-tiny-homes-sa", destination: "/about", permanent: true },
      { source: "/request-a-call", destination: "/contact", permanent: true },
    ];
  },
};

export default nextConfig;
