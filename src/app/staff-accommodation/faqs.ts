import { getProduct } from "@/data/products";
import type { ProductFaq } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * FAQs for /staff-accommodation (T-109, 14 November 2026).
 *
 * Rendered by the accordion AND serialised into FAQPage JSON-LD on the same
 * page, so both come from this one list and cannot disagree (the pattern of
 * home-faqs.ts and housing-pods/faqs.ts).
 *
 * Every answer restates something the site already says: products.ts (specs,
 * use cases, FAQs), the staff accommodation guide and the business buyer's
 * guide, the terms page (what a delivery includes) and site.ts (delivery
 * regions, lead time). No beds-per-unit figure: the catalogue gives floor
 * area and bedrooms only, and the owner has not given one (reader question,
 * 13 Nov 2026). The questions are worded for staff housing so they do not
 * repeat the homepage, /housing-pods or the guide's own FAQ.
 *
 * Prices are read from the catalogue, never typed.
 */

function productOf(slug: string) {
  const product = getProduct(slug);
  if (!product) throw new Error(`staff-accommodation/faqs.ts: unknown product slug "${slug}"`);
  return product;
}

/** A priced size; throws rather than print a 0 sentinel. */
function variantOf(slug: string, variantId: string) {
  const variant = productOf(slug).variants?.find((v) => v.id === variantId);
  if (!variant || variant.priceOnRequest) {
    throw new Error(`staff-accommodation/faqs.ts: no priced variant "${variantId}" on "${slug}"`);
  }
  return variant;
}

export const xFold = productOf("folding-homes");
export const expandable = productOf("expandable-homes");
export const compact = variantOf("expandable-homes", "b20-slim");
export const sixMetre = variantOf("expandable-homes", "b20");
export const twelveMetre = variantOf("expandable-homes", "b40");
export const compactPrice = compact.price;
export const sixMetrePrice = sixMetre.price;
export const twelveMetrePrice = twelveMetre.price;

const countries = site.deliveryRegions.countries;
const countryList = `${countries.slice(0, -1).join(", ")} and ${countries[countries.length - 1]}`;

export const staffFaqs: ProductFaq[] = [
  {
    q: "How much does a staff accommodation unit cost?",
    a: `An X-Fold is ${formatZAR(xFold.startingPrice)} ex VAT per unit: an insulated, wired 15 m² room with no plumbing. A self-contained expandable home starts at ${formatZAR(compactPrice)} ex VAT for the 18 m² open-plan unit with its own bathroom and small basic kitchen. The two-bedroom 6m (37 m²) is ${formatZAR(sixMetrePrice)} and the 12m (74 m²) is ${formatZAR(twelveMetrePrice)}. On top of the unit price come VAT, transport, the base each unit stands on and the service connections, and for X-Folds the ablutions.`,
  },
  {
    q: "Which staff units come with a bathroom?",
    a: "The expandable homes. Every size has a bathroom and a kitchen, with the plumbing and electrics installed in the factory. The X-Fold arrives wired for electricity but with no plumbing, so staff use a shared ablution block, or a local installer fits a wet room into each unit. Our [staff accommodation guide](/blog/staff-accommodation-units-south-africa) works through that choice.",
  },
  {
    q: "How long does a staff accommodation order take?",
    a: `Allow around ${site.leadTimeDays} days from deposit to move-in. Once the units are on site, two workers unfold an X-Fold in minutes, and the 6m (37 m²) and 12m (74 m²) expandable homes expand on site within hours. You can order the full number and take delivery in phases.`,
  },
  {
    q: "Can staff units be stacked, or moved to the next site?",
    a: "X-Folds stack up to two units high where ground space is tight, and they fold back down and travel flat, so they can follow a construction or mining job from one site to the next. Expandable homes don't stack. They can be relocated, though not folded down to the same footprint.",
  },
  {
    q: "Can you install a multi-unit order for us?",
    a: "For X-Folds, our team unfolds and sets up each unit on your prepared, level base as part of the delivery. Installing the other units is quoted separately. Ask whether our turnkey service covers your area and your units: where it does, we can arrange the groundwork, plinths, connections and installation. You can also use your own contractors.",
  },
  {
    q: "Do you deliver staff units to remote sites?",
    a: `We deliver to all nine provinces, and across the border into ${countryList}, quoted per project. Delivery is quoted for your site on distance and access, and for a multi-unit order we quote it as one run rather than unit by unit. X-Folds travel flat and are offloaded by crane or forklift, which we arrange and quote with the delivery. Expandable homes arrive as a module and need a truck close by.`,
  },
];
