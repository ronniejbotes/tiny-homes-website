import { pricedVariants, products, type Product, type ProductVariant } from "@/data/products";

/**
 * The home page's price and size range, read from products.ts and never typed
 * (W56, 15 Nov 2026: the first screen and the price list answer "prefab houses
 * south africa" with the whole range). Server-only: the hero is a client
 * component, so page.tsx passes it the numbers rather than letting it import
 * the catalogue.
 *
 * "Houses" are the homes with a published price: no price-on-request line,
 * and no outdoor kitchens (not a house). Cheapest first.
 */
export const pricedHouses: Product[] = products
  .filter((p) => !p.priceOnRequest && p.slug !== "outdoor-kitchens")
  .sort((a, b) => a.startingPrice - b.startingPrice);

/** A range's lowest and highest published price, across its priced sizes. */
export function priceRangeOf(product: Product): { low: number; high: number } {
  const priced = pricedVariants(product);
  if (!priced.length) return { low: product.startingPrice, high: product.startingPrice };
  const prices = priced.map((v) => v.price);
  return { low: Math.min(...prices), high: Math.max(...prices) };
}

/** Every floor area the houses come in, in m², from each size or the size label. */
function areasOf(product: Product): number[] {
  const labels = product.variants?.length
    ? pricedVariants(product).map((v) => v.size)
    : [product.sizeLabel];
  return labels
    .filter((s) => s.includes("m²"))
    .map((s) => parseFloat(s))
    .filter((n) => Number.isFinite(n));
}

const allAreas = pricedHouses.flatMap(areasOf);
if (!allAreas.length) throw new Error("price-range.ts: no floor areas found in products.ts");

export const houseLowPrice = Math.min(...pricedHouses.map((p) => priceRangeOf(p).low));
export const houseHighPrice = Math.max(...pricedHouses.map((p) => priceRangeOf(p).high));
export const smallestArea = Math.min(...allAreas);
export const largestArea = Math.max(...allAreas);

/** The single dearest size, for the sentence that names the top of the range. */
export const dearestHouse: { product: Product; variant?: ProductVariant } = (() => {
  let best: { product: Product; variant?: ProductVariant; price: number } | undefined;
  for (const product of pricedHouses) {
    const sizes = pricedVariants(product);
    if (!sizes.length) {
      if (!best || product.startingPrice > best.price) best = { product, price: product.startingPrice };
      continue;
    }
    for (const variant of sizes) {
      if (!best || variant.price > best.price) best = { product, variant, price: variant.price };
    }
  }
  if (!best) throw new Error("price-range.ts: no priced house in products.ts");
  return { product: best.product, variant: best.variant };
})();
