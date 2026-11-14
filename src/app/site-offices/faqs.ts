import { getProduct } from "@/data/products";
import type { ProductFaq } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * FAQs for /site-offices (W13 competitor pass, 15 November 2026).
 *
 * Rendered by the accordion AND serialised into FAQPage JSON-LD on the same
 * page, so both come from this one list and cannot disagree (the pattern of
 * staff-accommodation/faqs.ts).
 *
 * Every answer restates something the site already says: products.ts (the
 * X-Fold and expandable-home specs, prices, options and their "Site office"
 * use cases), the staff accommodation guide ("Site offices" and its buy-or-
 * hire FAQ), the terms page (what a delivery includes) and site.ts (delivery
 * regions, lead time). Nothing about stacking: "stackable two units high"
 * still waits on the supplier's load rating (claims sweep), so this page
 * does not repeat it. No hire service is offered or implied.
 *
 * Prices are read from the catalogue, never typed.
 */

function productOf(slug: string) {
  const product = getProduct(slug);
  if (!product) throw new Error(`site-offices/faqs.ts: unknown product slug "${slug}"`);
  return product;
}

/** A priced size; throws rather than print a 0 sentinel. */
function variantOf(slug: string, variantId: string) {
  const variant = productOf(slug).variants?.find((v) => v.id === variantId);
  if (!variant || variant.priceOnRequest) {
    throw new Error(`site-offices/faqs.ts: no priced variant "${variantId}" on "${slug}"`);
  }
  return variant;
}

/** A priced option; throws rather than print a missing price. */
function optionOf(slug: string, optionId: string) {
  const option = productOf(slug).options?.find((o) => o.id === optionId);
  if (!option || !option.price) {
    throw new Error(`site-offices/faqs.ts: no priced option "${optionId}" on "${slug}"`);
  }
  return option;
}

export const xFold = productOf("folding-homes");
export const expandable = productOf("expandable-homes");
export const compact = variantOf("expandable-homes", "b20-slim");
export const sixMetre = variantOf("expandable-homes", "b20");
export const twelveMetre = variantOf("expandable-homes", "b40");
export const glassFront = optionOf("expandable-homes", "glass-front-wall");

export const siteOfficeFaqs: ProductFaq[] = [
  {
    q: "How much does a site office cost?",
    a: `An X-Fold site office is ${formatZAR(xFold.startingPrice)} ex VAT: an insulated 15 m² room, wired with two plug points, a light fitting and a small DB board, with no plumbing. An expandable unit with its own bathroom starts at ${formatZAR(compact.price)} ex VAT for the open-plan 18 m². The 37 m² 6m is ${formatZAR(sixMetre.price)} and the 74 m² 12m is ${formatZAR(twelveMetre.price)}, both ex VAT. VAT, transport, the base each unit stands on and the service connections come on top of the unit price.`,
  },
  {
    q: "Does a site office come with a toilet?",
    a: "The expandable units do: every size has a bathroom, with the plumbing and electrics installed in the factory, so each one needs water, sewerage and power brought to it. The X-Fold has no plumbing. Your team uses the toilets already on site, or a local installer fits a wet room into the unit.",
  },
  {
    q: "How quickly can a site office be working?",
    a: `Allow around ${site.leadTimeDays} days from deposit to move-in. On delivery day, an X-Fold is offloaded by crane or forklift and two workers unfold it in minutes, so the office can open the day it lands. The 6m (37 m²) and 12m (74 m²) expandable units open out on site within hours, and the compact 18 m² is placed and connected. Connecting the wiring needs a certificate of compliance from a registered electrician.`,
  },
  {
    q: "Can a site office move to the next job?",
    a: "The X-Fold can. It folds back down, travels flat and unfolds again at the next site, which is what it is designed for. If you might move an expandable unit later, ask us before you order.",
  },
  {
    q: "Should we buy or hire a site office?",
    a: "Over a short project, hiring is usually the better deal. Over a long programme, or across several sites one after another, buying usually wins, and you own the unit at the end. Compare the hire rate over the real length of the job against the purchase price plus transport. Between jobs, an X-Fold also works as a lockable, insulated storeroom.",
  },
  {
    q: "Can an expandable unit have a glass front?",
    a: `Yes. A full glass front wall replaces a front wall panel for ${formatZAR(glassFront.price)} ex VAT, for a reception frontage. Window and door placement is also your choice.`,
  },
];
