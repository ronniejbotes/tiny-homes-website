#!/usr/bin/env node
/**
 * Post-deploy smoke test.
 *
 * Written after the July 2026 outage, where the site was blank for ~18 hours and
 * nothing in the build or the code was wrong. Hostinger's edge had cached the
 * HTML under Next's default `s-maxage=31536000`; a later deploy replaced the
 * content-hashed JS chunks, and the stale HTML kept asking for the deleted ones.
 * A plain "does the homepage return 200?" check would have stayed green the
 * whole time — the HTML was served fine, it was the assets it pointed at that
 * were gone.
 *
 * So this checks the thing that actually broke:
 *   1. every route in sitemap.xml returns 200
 *   2. every /_next/static asset each page references also returns 200
 *   3. the copy the CDN is serving matches the copy the origin is serving
 *
 * (3) is the one that matters. A page can pass (1) and (2) when fetched fresh
 * and still be broken for every real visitor, because real visitors get the
 * edge copy. Fetching each page both ways is what surfaces that gap.
 *
 * Usage:
 *   node scripts/smoke.mjs                      # checks https://tinyhomesa.com
 *   node scripts/smoke.mjs http://localhost:3000
 *
 * Exits 0 if everything passes, 1 otherwise, so CI or a cron can gate on it.
 */

const BASE = (process.argv[2] || "https://tinyhomesa.com").replace(/\/$/, "");

// The HTML arrives with entities escaped; `&amp;` in a URL means the query
// string falls apart and every image 400s. Decode before requesting anything.
const decodeEntities = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;

const failures = [];
const fail = (route, msg) => {
  failures.push({ route, msg });
  console.log(`  ${red("FAIL")} ${msg}`);
};

/**
 * `readBody: false` skips downloading the response — for asset checks the status
 * code is the whole answer, and some of those chunks are not small.
 *
 * Do not filter on `content-type` here. sitemap.xml is served as
 * `application/xml`, so an earlier version of this script that only read
 * `text/*` bodies silently found zero routes and then reported PASS.
 */
async function get(url, { readBody = true } = {}) {
  const res = await fetch(url, { redirect: "manual" });
  if (!readBody) {
    await res.arrayBuffer().catch(() => {});
    return { res, body: "" };
  }
  return { res, body: await res.text() };
}

/** Every /_next/static/... URL a page references, deduped and decoded. */
function staticAssets(html) {
  return [
    ...new Set(
      [...html.matchAll(/\/_next\/static\/[^"'\\\s>)]+/g)].map((m) =>
        decodeEntities(m[0]),
      ),
    ),
  ];
}

async function routesFromSitemap() {
  const { res, body } = await get(`${BASE}/sitemap.xml`);
  if (res.status !== 200) {
    throw new Error(`sitemap.xml returned ${res.status} — cannot enumerate routes`);
  }
  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = locs.map((u) => {
    try {
      return new URL(u).pathname || "/";
    } catch {
      return u;
    }
  });
  const unique = [...new Set(paths)].sort();
  // An empty route list must be an error, never a pass. A smoke test that goes
  // green because it checked nothing is worse than having no smoke test.
  if (unique.length === 0) {
    throw new Error("sitemap.xml parsed but contained no <loc> entries");
  }
  return unique;
}

async function checkRoute(route) {
  console.log(`\n${bold(route)}`);

  // The copy a real visitor gets: straight through the CDN.
  const cached = await get(`${BASE}${route}`);
  // The copy the origin currently generates. A unique query string is a cache
  // key the edge has never seen, so it has to go and ask.
  const fresh = await get(`${BASE}${route}?smoke=${Date.now()}`);

  const age = cached.res.headers.get("age");
  const hit = cached.res.headers.get("x-hcdn-cache-status");
  console.log(
    `  status ${cached.res.status} | edge ${hit ?? "n/a"} | age ${age ?? "0"}s`,
  );

  if (cached.res.status !== 200) {
    fail(route, `returned HTTP ${cached.res.status}`);
    return;
  }

  // A page that renders its error boundary still returns 200 — check the body.
  if (cached.body.includes("The site didn&#x27;t load") || cached.body.includes("The site didn't load")) {
    fail(route, "is serving the error boundary page");
  }

  const cachedAssets = staticAssets(cached.body);
  const freshAssets = staticAssets(fresh.body);

  if (cachedAssets.length === 0) {
    fail(route, "references no /_next/static assets at all (suspicious)");
    return;
  }

  let broken = 0;
  for (const asset of cachedAssets) {
    const { res } = await get(`${BASE}${asset}`, { readBody: false });
    if (res.status !== 200) {
      broken++;
      if (broken <= 5) fail(route, `asset ${res.status}: ${asset}`);
    }
  }
  if (broken > 5) fail(route, `...and ${broken - 5} more broken assets`);
  if (broken === 0) console.log(`  ${green("ok")} all ${cachedAssets.length} static assets resolve`);

  // The tell-tale of the outage: what the edge serves and what the origin
  // generates disagree. If the cached copy is broken and the fresh one is not,
  // the deploy landed but the CDN never noticed.
  const missingFromCache = freshAssets.filter((a) => !cachedAssets.includes(a));
  if (broken > 0 && missingFromCache.length > 0) {
    fail(
      route,
      `EDGE IS STALE — cached HTML points at ${broken} deleted asset(s) while the origin serves a newer build. Purge the Hostinger CDN cache.`,
    );
  }

  const cc = cached.res.headers.get("cache-control") ?? "";
  if (/s-maxage=\d{6,}/.test(cc)) {
    fail(
      route,
      `Cache-Control lets the edge pin this HTML for a very long time (${cc}). This is what caused the July 2026 outage.`,
    );
  }
}

async function main() {
  console.log(bold(`Smoke test: ${BASE}\n`));

  let routes;
  try {
    routes = await routesFromSitemap();
  } catch (e) {
    console.log(red(`Could not read sitemap: ${e.message}`));
    process.exit(1);
  }
  console.log(`${routes.length} routes from sitemap.xml`);

  for (const route of routes) {
    try {
      await checkRoute(route);
    } catch (e) {
      fail(route, `threw: ${e.message}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  if (failures.length === 0) {
    console.log(green(bold(`PASS — ${routes.length} routes, no broken assets.`)));
    process.exit(0);
  }
  console.log(red(bold(`FAIL — ${failures.length} problem(s):`)));
  for (const f of failures) console.log(`  ${yellow(f.route)}  ${f.msg}`);
  process.exit(1);
}

main();
