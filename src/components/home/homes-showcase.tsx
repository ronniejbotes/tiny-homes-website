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

/* Per-product framing tweaks for the 4:3 crop, the safari tent's sail-like
   roofline (its signature silhouette) sits high in the hero, so bias the crop
   upward instead of using the default centre crop. */
const cropPosition: Record<string, string> = {
  "safari-tents": "object-[50%_35%]",
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

/* The houses with a published price, for the price table: no trade-only or
   price-on-request line, and no outdoor kitchens. */
const pricedHouses = products
  .filter((p) => !p.priceOnRequest && !p.tradeOnly && p.slug !== "outdoor-kitchens")
  .sort((a, b) => a.startingPrice - b.startingPrice);

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
          intro="From a flat-pack X-Fold you can set up before lunch to a flagship glamping capsule wrapped in 270° of glass, plus outdoor kitchens for entertaining and safari tents for lodges. Factory-built, delivered nationwide. All prices exclude VAT."
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
                        sizes="(min-width: 1024px) 45vw, (min-width: 640px) 50vw, 100vw"
                        className={cn(
                          "object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105",
                          cropPosition[product.slug],
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
                        {product.tradeOnly ? (
                          // Trade-only lines are not for sale to the public, so
                          // the card leads with who they are for rather than a
                          // price nobody browsing here can act on.
                          <>
                            {product.sizeLabel} ·{" "}
                            <span className="font-medium text-ink">
                              Businesses &amp; hospitality only
                            </span>
                          </>
                        ) : product.priceOnRequest ? (
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
            disagree with the cards or the product pages. Left out: safari
            tents (trade only, price on request) and the outdoor kitchens
            (not a house). Cheapest first. */}
        <Reveal delay={0.1} className="mx-auto mt-16 max-w-3xl">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="text-eyebrow mb-4 text-left text-clay-dark">
              Prefab house prices at a glance (all prices exclude VAT)
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
            People call these tiny houses, prefab houses, modular homes,{" "}
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
              compare the pod ranges side by side
            </Link>
            .
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
