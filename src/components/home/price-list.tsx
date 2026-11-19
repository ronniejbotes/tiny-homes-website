import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { BUSINESS_ENQUIRY_HREF } from "@/lib/enquiry";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { dearestHouse, houseHighPrice, houseLowPrice, priceRangeOf, pricedHouses } from "./price-range";

/**
 * "Prefab house prices in South Africa" (W56, 15 Nov 2026). Search Console, 28
 * days to 13 Nov: "prefab houses south africa" 989 impressions at 4.2 on this
 * page, "prefabricated houses south africa prices" 270 at 5.3, "prefab houses
 * south africa prices" 67 at 3.9. The price list used to sit under the six
 * range cards, about ten phone screens down, with from-prices only; it is now
 * its own section straight after the business section, with each range's
 * price span, its size and what is in it. The hero links here (#prices).
 *
 * Every price, size and name comes off products.ts (price-range.ts), so the
 * list can never disagree with the cards or the product pages. The one typed
 * column is "what is in it", restated from each range's specs in products.ts:
 *   - X-Folds: Electrical "2 plug points, a light fitting and a small DB board";
 *     Plumbing "None".
 *   - Expandable Homes: bedrooms "Open plan – 4 bedrooms"; "Bathroom & kitchen:
 *     Included on every size" (basic kitchen: no appliances).
 *   - Apple Cabins: "Luxurious bathroom fittings included in all three sizes";
 *     "Kitchenette: Included in the 9 m and 11.8 m cabins", which are the
 *     20 m² and 26.5 m² sizes (variants apple-9 and apple-11-8).
 *   - Glamping Capsules: Layout "One or two rooms with a bathroom"; Kitchen
 *     "Optional on every model".
 *   - Nature Cabins: Bathroom "Fully fitted bathroom, included"; "Not
 *     included": kitchen, air conditioning and a water heater (owner, 21 Sep 2026).
 * A new priced range without an entry stops the build rather than printing a
 * blank cell.
 */
const whatIsInIt: Record<string, string> = {
  "folding-homes": "One insulated room, wired for electricity, no plumbing",
  "expandable-homes": "Open plan to four bedrooms, with a bathroom and a basic kitchen in every size",
  "apple-cabins": "A bathroom in every size, and a kitchenette in the 20 m² and 26.5 m² sizes",
  "glamping-capsules": "One or two rooms and a bathroom, with a kitchen as an option",
  "nature-cabins": "A fitted bathroom; a kitchen, air conditioning and a water heater are not included",
};
for (const p of pricedHouses) {
  if (!whatIsInIt[p.slug]) throw new Error(`price-list.tsx: no "what is in it" line for "${p.slug}"`);
}

/* The sentence names both ends of the range, so check they are still the
   units it names: the X-Fold at the bottom and a glamping capsule at the top.
   A catalogue change that moves either end stops the build, and the sentence
   gets rewritten rather than quietly naming the wrong unit. */
const cheapest = pricedHouses[0];
if (cheapest.slug !== "folding-homes" || cheapest.startingPrice !== houseLowPrice) {
  throw new Error("price-list.tsx: the cheapest house is no longer the X-Fold; rewrite the intro");
}
if (dearestHouse.product.slug !== "glamping-capsules" || !dearestHouse.variant) {
  throw new Error("price-list.tsx: the dearest house is no longer a glamping capsule size; rewrite the intro");
}
/* "Space D7 (11.5 m)" reads as "the 38 m² Space D7". */
const dearestName = dearestHouse.variant.name.replace(/\s*\(.*\)$/, "");
const dearestSize = dearestHouse.variant.size;

/* The self-contained entry point, the same expandable size home-faqs.ts names
   (b20, the 37 m² with two bedrooms as standard; the compact 18 m² was
   withdrawn on 17 Nov 2026). Throws rather than rendering "undefined" into
   the intro, and stops the build if b20 stops being the range's from-price. */
function expandable(variantId: string) {
  const v = products.find((p) => p.slug === "expandable-homes")?.variants?.find((x) => x.id === variantId);
  if (!v) throw new Error(`price-list.tsx: no expandable-homes variant "${variantId}"`);
  return v;
}
const selfContained = expandable("b20");
const expandableRange = products.find((p) => p.slug === "expandable-homes");
if (!expandableRange || selfContained.price !== expandableRange.startingPrice) {
  throw new Error("price-list.tsx: the 37 m² is no longer the cheapest expandable size; rewrite the intro");
}

/* Non-breaking spaces so "37" and "m²", or "R" and "54 900", never split
   across lines on a phone. */
const nb = (s: string) => s.replace(/ /g, " ");

const intro = `Our prefab houses cost from ${nb(formatZAR(houseLowPrice))} ex VAT for a ${nb(cheapest.sizeLabel)} X-Fold room to ${nb(formatZAR(houseHighPrice))} ex VAT for the ${nb(dearestSize)} ${nb(dearestName)}, the largest of our glamping capsules. A self-contained home with its own bathroom and kitchen starts at ${nb(formatZAR(selfContained.price))} ex VAT: the ${nb(selfContained.size)} expandable home, with two bedrooms as standard.`;

const noteLink =
  "font-medium text-clay underline decoration-clay/30 underline-offset-4 transition-colors hover:text-clay-dark hover:decoration-clay";

export function PriceList() {
  return (
    <section
      id="prices"
      aria-labelledby="prices-heading"
      className="scroll-mt-24 border-b border-border py-20 sm:py-28"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <SectionHeading
              id="prices-heading"
              eyebrow="Prices"
              title="Prefab house prices in South Africa"
              intro={intro}
            />

            <Reveal delay={0.1} className="mt-10">
              <table className="w-full border-collapse text-left text-base">
                <caption className="text-eyebrow mb-4 text-left text-clay-dark">
                  Every home for sale, cheapest first (all prices exclude VAT)
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="py-3 pr-4 font-medium text-ink">
                      Home
                    </th>
                    <th scope="col" className="py-3 text-right font-medium text-ink">
                      Price, ex VAT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricedHouses.map((p) => {
                    const { low, high } = priceRangeOf(p);
                    return (
                      <tr key={p.slug} className="border-b border-border align-top">
                        <th scope="row" className="py-4 pr-4 font-normal">
                          <Link
                            href={`/${p.slug}`}
                            className="-my-2 inline-block py-2 font-medium text-ink underline decoration-border underline-offset-4 transition-colors hover:decoration-clay"
                          >
                            {p.name}
                          </Link>
                          <span className="mt-1 block leading-snug text-stone">
                            <span className="whitespace-nowrap">{p.sizeLabel}</span> ·{" "}
                            {whatIsInIt[p.slug]}
                          </span>
                        </th>
                        <td className="nums-tabular py-4 text-right text-ink">
                          {low === high ? (
                            <span className="whitespace-nowrap">{formatZAR(low)}</span>
                          ) : (
                            <>
                              <span className="block whitespace-nowrap">{formatZAR(low)}</span>
                              <span className="block whitespace-nowrap text-stone">
                                to {formatZAR(high)}
                              </span>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* The same list as the guide it links, so the two never disagree.
                  Moved here with the table from homes-showcase.tsx; reworded
                  after the W56 human-reader review (the list's end was hard
                  to find). */}
              <p className="mt-5 text-base leading-relaxed text-stone">
                Each price is for the unit alone. Until a quote says otherwise, count these as
                extra: the base it stands on, the connections to water, sewerage and power,{" "}
                <Link href="/blog/building-approval-south-africa-what-you-need" className={noteLink}>
                  council approval
                </Link>
                , transport to your site, and VAT. Our guide to{" "}
                <Link href="/blog/what-is-included-in-a-prefab-house-price" className={noteLink}>
                  what is included in a prefab house price
                </Link>{" "}
                sets them out.
              </p>
              {/* The 2-bedroom searches belong to /expandable-homes (it sells
                  the 37 m² and 74 m² with layouts and prices), but the home
                  page ranks for them too. One line in the searcher's words
                  sends them on. */}
              <p className="mt-3 text-base leading-relaxed text-stone">
                Two bedrooms come standard from the {nb(selfContained.size)} expandable home: see the{" "}
                <Link href="/expandable-homes" className={noteLink}>
                  2-bedroom tiny house prices
                </Link>
                .
              </p>
              {/* Business buyers first (owner, 29 Oct 2026). The quotation
                  wording is /site-offices' and /staff-accommodation's. */}
              <p className="mt-3 text-base leading-relaxed text-stone">
                Buying several units for a business?{" "}
                <Link href={BUSINESS_ENQUIRY_HREF} className={noteLink}>
                  Send a business enquiry
                </Link>{" "}
                with how many you need and where they will go, and we&apos;ll reply with a formal
                quotation that prices the units and the delivery together.
              </p>
            </Reveal>
          </div>

          {/* A photograph of a real unit, not one of the styled renders: the
              supplier's yard photo the Business Profile uses for this range
              (W20, 15 Nov 2026). No claim about where it stands or which size
              it is. */}
          <Reveal delay={0.15} className="lg:col-span-4 lg:pt-28">
            <figure>
              <div className="relative aspect-[970/870] overflow-hidden rounded-3xl bg-sand">
                <Image
                  src="/images/products/expandable-homes/brochure-exterior-4.jpg"
                  alt="An Expandable Home opened out on a gravel yard, with wood-grain walls, black trim and glass double doors."
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-base leading-relaxed text-stone">
                An Expandable Home, opened out. Every size comes with its own bathroom and
                kitchen.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
