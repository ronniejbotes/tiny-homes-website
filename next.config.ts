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
    //
    // ORDER AND ABSOLUTE DESTINATIONS (changed 2026-09-17, T-22). The old-path
    // rules are listed BEFORE the www host rule, and each one is emitted TWICE
    // from the single list below:
    //
    //   1. scoped to `host = www.tinyhomesa.com`, with an absolute destination
    //      on the apex. The absolute destination is what collapses the host hop
    //      and the path hop into one.
    //   2. unscoped, with a RELATIVE destination, for every other host.
    //
    //   www.tinyhomesa.com/about-us -> https://tinyhomesa.com/about   (1 hop)
    //   tinyhomesa.com/about-us     -> /about                         (1 hop)
    //   www.tinyhomesa.com/anything -> falls through to the host rule (1 hop)
    //   localhost:3000/about-us     -> /about, still on localhost
    //
    // Measured live before the change on 2026-09-17: www.tinyhomesa.com/about-us/
    // took three hops (trailing slash, then host, then path) and
    // tinyhomesa.com/thedome/ took two. Do NOT move the host rule back above
    // these: a www request would then match it first and need a second hop to
    // reach its final page, which is what it was doing.
    //
    // WHY THE PAIR, instead of one absolute rule for everybody (fixed
    // 2026-09-17, review of T-22). An absolute destination with no `has` host
    // condition fires on EVERY host, so it sends non-production hosts to
    // production: http://localhost:3111/about-us returned a 308 to
    // https://tinyhomesa.com/about, and any preview deployment did the same.
    // Nothing user-facing was broken - these are dead legacy paths and
    // scripts/smoke.mjs does not exercise them - but docs/ documents a local
    // workflow (`node scripts/smoke.mjs http://localhost:3000`), and the next
    // person testing a redirect locally would have landed on production with no
    // clue why. Keep the host condition on any absolute destination added here.
    //
    // WHAT THIS DOES NOT FIX, and why. A request that arrives WITH a trailing
    // slash still costs one extra hop, because Next's own trailing-slash 308
    // runs before this list and nothing here can pre-empt it. So
    // /thedome/ -> /thedome -> /glamping-capsules stays at two hops. Removing
    // that hop means setting `skipTrailingSlashRedirect: true` and taking over
    // trailing-slash handling for the whole site in a proxy file — which would
    // put every address on the site behind code we have written, to save one
    // hop on a handful of old paths. That is a decision for the owner, not a
    // quiet config change, so it has not been made here.
    // [source, relative destination, permanent]
    const oldPaths: Array<[string, string, boolean]> = [
      // Verified live + indexed on the old WordPress site; all would 404 at cutover.
      ["/about-us", "/about", true],
      ["/contact-us", "/contact", true],
      ["/privacy-policy", "/privacy", true],
      ["/terms-and-conditions-tiny-homes-sa", "/terms", true],

      // The Dome is discontinued and its page is gone, so both the old
      // WordPress URL (/thedome, indexed) and the current one (/the-dome, also
      // indexed) would 404. The dome was a glamping product and glamping
      // capsules are the closest remaining line, so sending both there keeps
      // the inbound link equity and lands visitors on something relevant
      // instead of a dead end.
      ["/thedome", "/glamping-capsules", true],
      ["/the-dome", "/glamping-capsules", true],

      // Rank Math's sitemap URLs. /sitemap_index.xml is the one currently
      // submitted in Search Console, so it must keep resolving after cutover.
      // Confirmed still submitted on 2026-09-17: Search Console lists both
      // /sitemap.xml and /sitemap_index.xml, each reporting 28 addresses and
      // zero errors.
      ["/sitemap_index.xml", "/sitemap.xml", true],
      ["/page-sitemap.xml", "/sitemap.xml", true],

      // DIY garages are withdrawn from sale (owner decision 2026-08-04): the
      // design needs an engineer's sign-off before we can carry public and
      // property liability under the CPA. Deliberately NOT permanent, because
      // the line is expected back once that is in place and a 308 would
      // consolidate /garages into the homepage in Google's index. Question 12
      // to the owner decides whether this becomes permanent; until it is
      // answered, leave it exactly as it is.
      ["/garages", "/", false],

      // Speculative — these paths were never live on the old site (they 404 there
      // today). Kept purely as defensive aliases for stale off-site links.
      ["/about-tiny-homes-sa", "/about", true],
      ["/request-a-call", "/contact", true],
    ];

    const wwwHost = [{ type: "host" as const, value: "www.tinyhomesa.com" }];

    return [
      // www + an old path, answered in a single hop by an absolute destination.
      ...oldPaths.map(([source, destination, permanent]) => ({
        source,
        has: wwwHost,
        destination: `https://tinyhomesa.com${destination}`,
        permanent,
      })),

      // Every other host — the apex in production, plus localhost and any
      // preview deployment — keeps a relative destination and stays where it is.
      ...oldPaths.map(([source, destination, permanent]) => ({
        source,
        destination,
        permanent,
      })),

      // Canonical host, LAST so the specific old paths above can answer a www
      // request in a single hop. www.tinyhomesa.com served a byte-identical copy
      // of the whole site under a 200 (verified by matching sha1 on 2026-08-10),
      // so every page existed at two addresses and Google had to pick one itself.
      //
      // `permanent: true` emits a 308, which Google treats as a 301 for
      // canonicalisation. Confirmed firing in production on 2026-09-17:
      // www.tinyhomesa.com/ returns 308 to https://tinyhomesa.com/.
      {
        source: "/:path*",
        has: wwwHost,
        destination: "https://tinyhomesa.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
