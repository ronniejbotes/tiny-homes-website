/**
 * The "housing pod" view of the catalogue.
 *
 * "Pod" is not one of our product names, and it is not one thing. It is the
 * word a large share of South African buyers type into Google for what we
 * actually sell — the searches run to "housing pod for sale", "pod house
 * price", "living pod South Africa", "glamping pod" — and until now the site
 * answered none of them: the word appears in a handful of keyword arrays and
 * two FAQ answers, and nowhere a search engine can rank a page on it.
 *
 * This file maps that vocabulary onto the real range without inventing a
 * product. Every entry points at a product that already exists in
 * products.ts, and every price is READ from there rather than typed here, so
 * the pod page cannot drift from the catalogue the way a hand-maintained
 * landing page would. `podType` is the honest label for what that product is
 * in pod language; `podPitch` says why it answers the pod search; `notAPod`
 * is set where calling it a pod would be a stretch and the copy says so out
 * loud, because a page that calls all seven products "pods" reads as spam to
 * a reader and to Google.
 */

import { getProduct, type Product } from "@/data/products";

export interface PodEntry {
  /** Product this pod entry describes. Must exist in products.ts. */
  slug: string;
  /** What this product is, in pod vocabulary. Becomes the card's eyebrow. */
  podType: string;
  /** Why someone searching for a pod should look at this one. */
  podPitch: string;
  /** The single job it is best at, for the comparison table's last column. */
  bestFor: string;
  /**
   * Set where the product is genuinely not pod-shaped. The copy then says so
   * rather than quietly implying otherwise: buyers arrive with a curved
   * capsule in mind, and a folding steel box is a good answer to their budget
   * but a bad answer to their picture. Saying which is which is what makes
   * the page worth reading.
   */
  notAPod?: string;
}

/**
 * Ordered cheapest first, because the pod search is overwhelmingly a price
 * search: "housing pod for sale" and "pod house price" are the same query
 * with different words, and the first thing that page has to answer is what
 * the cheapest one costs.
 */
export const podEntries: PodEntry[] = [
  {
    slug: "folding-homes",
    podType: "Entry-level pod",
    podPitch:
      "The cheapest way into a pod-sized building in the range. It arrives flat on a truck and unfolds into a weather-tight, insulated 15 m² room in minutes, wired for electricity with two plug points, a light fitting and a small DB board. It carries no plumbing, so a bathroom is a local installer's job.",
    bestFor: "The lowest possible price per room",
    notAPod:
      "Square, not curved. The X-Fold is a folding steel room rather than a moulded capsule, so if the picture in your head is a rounded pod with a glass end, this is not it — but it is a quarter of the price of anything that is.",
  },
  {
    slug: "expandable-homes",
    podType: "Family pod / granny pod",
    podPitch:
      "What most people mean when they search for a pod to put in the garden for a parent or an adult child: a self-contained second dwelling with its own bathroom and kitchen, plumbing and electrics installed at the factory. It arrives as one module and expands on site within hours, from 18 m² up to 74 m².",
    bestFor: "A self-contained second dwelling",
    notAPod:
      "Boxy rather than rounded, and the largest sizes are bigger than the word 'pod' usually implies. Included here because a granny pod is what it is bought for.",
  },
  {
    slug: "apple-cabins",
    podType: "Resort pod",
    podPitch:
      "The shape people picture when they say pod: an angular shell wrapped in curved, floor-to-ceiling panoramic glass. Luxurious bathroom fittings are included in all three sizes and a kitchenette in the two larger ones, and it arrives fully assembled and ready for occupation within hours.",
    bestFor: "Guest suites and short-stay letting",
  },
  {
    slug: "glamping-capsules",
    podType: "Luxury glamping pod",
    podPitch:
      "The top of the pod market, where the unit itself is the reason for the booking. Rooms sit either side of the bathroom, each wrapped in 270° oversized floor-to-ceiling double glazing. The bathroom, its premium fittings, a geyser, multi-layer insulation and intelligent front-door access are standard; kitchen and air conditioning are extras.",
    bestFor: "Lodges, resorts and nightly rates",
  },
  {
    slug: "nature-cabins",
    podType: "Fully-fitted cabin",
    podPitch:
      "The alternative for a buyer who wants nothing left to do on arrival. A 26 m² timber-look steel cabin with a viewing terrace, assembled in under three days, with the bathroom, kitchen, air conditioning and a storage water heater all fitted as standard rather than sold as extras.",
    bestFor: "Moving in with nothing left to add",
    notAPod:
      "A cabin, plainly — pitched roof, terrace, no curves. It sits on this page because it competes for the same money as a large pod and answers the same question differently.",
  },
];

/** A pod entry joined to its live product record. */
export interface PodRange extends PodEntry {
  product: Product;
}

/**
 * The pod entries with their products attached, cheapest first.
 *
 * Throws at build time on an unknown slug rather than silently dropping the
 * card: a pod page missing a range is a page that quietly stops answering the
 * query it was built for, and a static build is the right place to catch it.
 */
export const podRanges: PodRange[] = podEntries.map((entry) => {
  const product = getProduct(entry.slug);
  if (!product) {
    throw new Error(`housing-pods.ts: no product in products.ts for slug "${entry.slug}"`);
  }
  return { ...entry, product };
});

/** Cheapest pod in the range, for the "from R…" line. Never a 0 sentinel: every
 *  product listed here is priced, and a price-on-request entry would break the
 *  claim the whole page is built on. */
export const podPriceFrom = Math.min(...podRanges.map((r) => r.product.startingPrice));

/** Top of the pod range, across variants rather than base prices. */
export const podPriceTo = Math.max(
  ...podRanges.flatMap((r) =>
    r.product.variants?.length
      ? r.product.variants.map((v) => v.price)
      : [r.product.startingPrice],
  ),
);
