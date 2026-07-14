import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
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

/* Per-product framing tweaks for the 4:3 crop — the safari tent's sail-like
   roofline (its signature silhouette) sits high in the hero, so bias the crop
   upward instead of using the default centre crop. */
const cropPosition: Record<string, string> = {
  "safari-tents": "object-[50%_35%]",
};

/* Alternating wide/narrow rows on lg for an editorial, asymmetric rhythm —
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

export function HomesShowcase() {
  return (
    <section id="homes" aria-label="Our homes" className="scroll-mt-24 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Our range"
          title="Eight ways to build it better"
          intro="From a flat-pack folding home you can set up before lunch to a flagship glamping capsule wrapped in 270° of glass — plus outdoor kitchens for entertaining and safari tents for lodges. Factory-built, delivered nationwide. All prices exclude VAT."
        />

        <Stagger className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-12 lg:gap-y-16">
          {products.map((product, i) => {
            const image = heroImageFor(product.slug);
            return (
              <StaggerItem key={product.slug} className={spanClasses[i % spanClasses.length]}>
                <Link href={`/${product.slug}`} className="group block rounded-3xl">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand">
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
                        {product.priceOnRequest ? (
                          <>
                            {product.sizeLabel} ·{" "}
                            <span className="font-medium text-ink">Price on request</span>
                          </>
                        ) : (
                          <>
                            {product.sizeLabel} · From{" "}
                            <span className="font-medium text-ink">
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
      </Container>
    </section>
  );
}
