import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products, type Product } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { getHeroImage } from "./product-images";

/** The next three products in the catalogue, cyclically from the current one. */
export function RelatedProducts({ current }: { current: Product }) {
  const index = products.findIndex((p) => p.slug === current.slug);
  const related = [1, 2, 3].map(
    (offset) => products[(index + offset) % products.length],
  );

  return (
    <section aria-label="Explore other homes" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Keep exploring"
          title="Explore the rest of the range"
          intro="Nine product lines, from flat-pack starters to flagship glamping suites, outdoor kitchens, DIY garages and safari tents. All prices exclude VAT."
        />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => {
            const hero = getHeroImage(p.slug);
            return (
              <StaggerItem key={p.slug} className="flex">
                <Link
                  href={`/${p.slug}`}
                  className="group flex w-full flex-col overflow-hidden rounded-3xl border border-border bg-parchment transition-shadow duration-200 hover:shadow-[var(--shadow-soft)]"
                >
                  {hero && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={hero.src}
                        alt={hero.alt}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                        className="object-cover transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-xl text-ink">{p.name}</h3>
                      <p className="shrink-0 text-sm font-medium text-stone">
                        {p.sizeLabel}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-stone">
                      {p.tagline}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      <p className="text-ink">
                        {p.priceOnRequest ? (
                          <span className="font-medium">Price on request</span>
                        ) : (
                          <>
                            <span className="font-medium">
                              From {formatZAR(p.startingPrice)}
                            </span>{" "}
                            <span className="text-xs text-stone">ex VAT</span>
                          </>
                        )}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-clay">
                        View
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
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
