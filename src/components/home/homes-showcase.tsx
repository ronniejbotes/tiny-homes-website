import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import manifest from "@/data/images.json";

type ManifestImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: string;
  hero: boolean;
};

const productImages = manifest.products as Record<string, ManifestImage[]>;

function heroImageFor(slug: string): ManifestImage | undefined {
  const images = productImages[slug];
  return images?.find((img) => img.hero) ?? images?.[0];
}

/* The glamping capsule hero is a 2400 x 1018 panorama. object-cover fills the
   4:3 frame by height, so on lg the photo is drawn about 1.77 times the card's
   width: some 1,200px in its 681px card at 1440. "45vw" fetched a 750px file
   and stretched it 1.6 times. Its lg slot is sized for the drawn width; phones
   and tablets keep the shared values. */
const lgSizes: Record<string, string> = {
  "glamping-capsules": "83vw",
};

/* Alternating wide/narrow rows on lg for an editorial, asymmetric rhythm,
   cycled with modulo so the grid stays balanced however many products exist. */
const spanClasses = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7",
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7",
];

/* The houses with a published price, for the price table: no price-on-request
   line, and no outdoor kitchens. */
const pricedHouses = products
  .filter((p) => !p.priceOnRequest && p.slug !== "outdoor-kitchens")
  .sort((a, b) => a.startingPrice - b.startingPrice);

/* The smallest expandable size with two bedrooms as standard (variant b20,
   the same one home-faqs.ts names). Throws at build time rather than
   rendering "undefined" into the sentence under the price list. The space
   becomes a non-breaking one so "37" and "m²" never split across lines on a
   phone (they did at 360px). */
const twoBedroomSize = (() => {
  const size = products
    .find((p) => p.slug === "expandable-homes")
    ?.variants?.find((v) => v.id === "b20")?.size;
  if (!size) throw new Error('homes-showcase.tsx: no size for expandable-homes variant "b20"');
  return size.replace(/ /g, "\u00a0");
})();

const footnoteLink =
  "font-medium text-clay underline decoration-clay/30 underline-offset-4 transition-colors hover:text-clay-dark hover:decoration-clay";

export function HomesShowcase() {
  return (
    <section
      id="homes"
      aria-label="Our homes"
      className="scroll-mt-24 overflow-x-clip py-28 sm:py-36"
    >
      <Container>
        <SectionHeading
          eyebrow="Our range"
          title="Our prefab houses, cabins and capsules"
          intro="From a flat-pack X-Fold you can set up before lunch to a flagship glamping capsule wrapped in 270° of glass, plus outdoor kitchens for entertaining. Factory-built, delivered nationwide. All prices exclude VAT."
        />

        <Stagger className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-12 lg:gap-y-16">
          {products.map((product, i) => {
            const image = heroImageFor(product.slug);
            /* Alternating left/right drift on entrance for an editorial rhythm.
               Kept small and paired with overflow-x-clip on the section so the
               transient offset can never spill into a mobile scrollbar. */
            const drift = i % 2 === 0 ? -20 : 20;
            return (
              <StaggerItem
                key={product.slug}
                x={drift}
                className={spanClasses[i % spanClasses.length]}
              >
                <Link href={`/${product.slug}`} className="group block rounded-3xl">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand shadow-[var(--shadow-soft)] transition-shadow duration-500 ease-[var(--ease-smooth)] group-hover:shadow-[var(--shadow-hover)]">
                    {image && (
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes={`(min-width: 1024px) ${lgSizes[product.slug] ?? "45vw"}, (min-width: 640px) 50vw, 100vw`}
                        className={cn(
                          "object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105",
                        )}
                      />
                    )}
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                        {product.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-stone">
                        {product.priceOnRequest ? (
                          <>
                            {product.sizeLabel} ·{" "}
                            <span className="font-medium text-ink">Price on request</span>
                          </>
                        ) : (
                          <>
                            {product.sizeLabel} · From{" "}
                            <span className="nums-tabular font-medium text-ink">
                              {formatZAR(product.startingPrice)}
                            </span>{" "}
                            ex VAT
                          </>
                        )}
                      </p>
                      <p className="mt-2 max-w-md leading-relaxed text-stone">
                        {product.tagline}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-ink",
                        "transition-colors duration-200 group-hover:border-clay group-hover:bg-clay group-hover:text-cream",
                      )}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* The cards above, again as one plain table, because "prefab house
            prices" is what a large share of visitors searched for and a table
            is what both they and Google read fastest. Nothing is typed here:
            every name, size and price comes off products.ts, so it can never
            disagree with the cards or the product pages. Left out: the
            outdoor kitchens (not a house). Cheapest first. */}
        <Reveal delay={0.1} className="mx-auto mt-16 max-w-3xl">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Prefab house price list
          </h3>
          <table className="mt-5 w-full border-collapse text-left text-sm">
            <caption className="text-eyebrow mb-4 text-left text-clay-dark">
              Every home for sale, cheapest first (all prices exclude VAT)
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-3 pr-4 font-medium text-ink">Range</th>
                <th scope="col" className="py-3 pr-4 font-medium text-ink">Size</th>
                <th scope="col" className="py-3 font-medium text-ink">From</th>
              </tr>
            </thead>
            <tbody>
              {pricedHouses.map((p) => (
                <tr key={p.slug} className="border-b border-border">
                  <th scope="row" className="py-3 pr-4 font-normal">
                    <Link
                      href={`/${p.slug}`}
                      className="text-ink underline decoration-border underline-offset-4 transition-colors hover:decoration-clay"
                    >
                      {p.name}
                    </Link>
                  </th>
                  <td className="py-3 pr-4 text-stone">{p.sizeLabel}</td>
                  <td className="nums-tabular whitespace-nowrap py-3 text-ink">
                    {formatZAR(p.startingPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* In the words of the guide it links, so the two never disagree. */}
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-stone">
            Each price is for the unit alone. Treat everything around it as outside the
            price until a quote says otherwise: the base it stands on, the connections to
            water, sewerage and power,{" "}
            <Link
              href="/blog/building-approval-south-africa-what-you-need"
              className={footnoteLink}
            >
              council approval
            </Link>
            , transport to your site and VAT, as our guide to{" "}
            <Link href="/blog/what-is-included-in-a-prefab-house-price" className={footnoteLink}>
              what is included in a prefab house price
            </Link>{" "}
            sets out.
          </p>
          {/* The 2-bedroom searches belong to /expandable-homes (it sells the
              37 m² and 74 m² with layouts and prices), but the home page ranks
              for them too. One line in the searcher's words sends them on. No
              price here: the size is read from products.ts, like the table. */}
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
            Two bedrooms come standard from the {twoBedroomSize} expandable home: see the{" "}
            <Link href="/expandable-homes" className={footnoteLink}>
              2-bedroom tiny house prices
            </Link>
            .
          </p>
        </Reveal>

        {/* A vocabulary footnote, not a billboard. The cards above are named
            for the catalogue, and buyers arrive using other words for the same
            buildings. Each of those words links to the range it means, so the
            page that answers "capsule house" or "prefab cabins" is the one that
            gets the link, not this one; "mobile homes" goes to the guide that
            says which units can move again. "Pod" is listed alongside the
            others rather than singled out. Small type on purpose — the ranges
            are what this section is selling. */}
        <Reveal delay={0.1} className="mt-12">
          <p className="mx-auto max-w-2xl text-center text-[0.9375rem] leading-relaxed text-stone">
            People call these tiny houses, prefab or prefabricated houses, modular homes,{" "}
            <Link href="/blog/mobile-homes-south-africa" className={footnoteLink}>
              mobile homes
            </Link>
            ,{" "}
            <Link href="/expandable-homes" className={footnoteLink}>
              granny flats
            </Link>
            ,{" "}
            <Link href="/nature-cabins" className={footnoteLink}>
              prefab cabins
            </Link>
            ,{" "}
            <Link href="/apple-cabins" className={footnoteLink}>
              eco pods
            </Link>
            ,{" "}
            <Link href="/glamping-capsules" className={footnoteLink}>
              capsule houses
            </Link>
            ,{" "}
            <Link href="/folding-homes" className={`${footnoteLink} whitespace-nowrap`}>
              ready-made rooms
            </Link>{" "}
            and housing pods. If it was the last of those you came looking for,{" "}
            <Link href="/housing-pods" className={footnoteLink}>
              compare our pod houses side by side
            </Link>
            .
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
