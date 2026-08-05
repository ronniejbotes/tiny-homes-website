/**
 * Dump the catalogue, site details, image manifest and floor-plan geometry to
 * data.json for the Python brochure generators.
 *
 * Plans come from the site's own plans.ts through getPlan(), resolved per
 * variant, so a brochure floor plan is drawn from exactly the geometry the
 * configurator draws on the website.
 */
import { products } from "/Users/ronjames/Documents/GitHub/tiny-homes-website/src/data/products.ts";
import { site, nav } from "/Users/ronjames/Documents/GitHub/tiny-homes-website/src/lib/site.ts";
import { getPlan } from "/Users/ronjames/Documents/GitHub/tiny-homes-website/src/components/configurator/floorplan/plans.ts";
import images from "/Users/ronjames/Documents/GitHub/tiny-homes-website/src/data/images.json" with { type: "json" };
import { writeFileSync } from "node:fs";

/** Products whose plan geometry is real. Apple cabins and glamping capsules
    ship manufacturer CAD sheets instead (images.layoutPlans), and safari tents
    and outdoor kitchens have no drawn plan at all. */
const DRAWN = new Set(["folding-homes", "expandable-homes", "nature-cabins"]);

const plans = {};
for (const p of products) {
  if (!DRAWN.has(p.slug)) continue;
  plans[p.slug] = { default: getPlan(p) };
  for (const v of p.variants ?? []) plans[p.slug][v.id] = getPlan(p, v.id);
}

writeFileSync(
  "/Users/ronjames/Documents/GitHub/tiny-homes-website/scripts/brochure/data.json",
  JSON.stringify({ products, site, nav, images, plans }, null, 1),
);

console.log(
  "products:\n" +
    products
      .map(
        (p) =>
          `  ${p.slug} (R${p.startingPrice}${p.priceOnRequest ? " POR" : ""}, variants:${p.variants?.length ?? 0}, ` +
          `opts:${p.options.length}, specs:${p.specs.length}, uses:${p.useCases.length}, faqs:${p.faqs.length})`,
      )
      .join("\n"),
);
console.log("plans:", Object.entries(plans).map(([k, v]) => `${k}[${Object.keys(v).join(",")}]`).join(" "));
