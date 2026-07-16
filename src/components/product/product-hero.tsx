import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bed, Ruler, Timer } from "lucide-react";
import type { Product } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import type { ProductImage } from "./product-images";

export function ProductHero({
  product,
  image,
}: {
  product: Product;
  image?: ProductImage;
}) {
  const chips: { icon: typeof Ruler; label: string }[] = [
    { icon: Ruler, label: product.sizeLabel },
    { icon: Timer, label: product.setupTime },
    ...(product.bedrooms ? [{ icon: Bed, label: product.bedrooms }] : []),
  ];

  return (
    <section className="pt-28 pb-14 sm:pt-36 sm:pb-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex items-center gap-2 text-sm text-stone">
                <li>
                  <Link
                    href="/"
                    className="inline-flex min-h-11 items-center transition-colors hover:text-ink"
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-ink">
                  {product.name}
                </li>
              </ol>
            </nav>

            <h1 className="text-display text-5xl text-ink sm:text-6xl lg:text-7xl">
              {product.name}
            </h1>
            <p className="mt-4 font-display text-xl text-clay sm:text-2xl">
              {product.tagline}
            </p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone">
              {product.summary}
            </p>

            <ul className="mt-7 flex flex-wrap gap-2.5">
              {chips.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-parchment px-4 py-2 text-sm font-medium text-ink"
                >
                  <Icon className="h-4 w-4 text-clay" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {product.priceOnRequest ? (
                <>
                  <p className="text-display text-3xl text-ink sm:text-4xl">
                    Price on request
                  </p>
                  <p className="text-sm text-stone">quoted to your site and brief</p>
                </>
              ) : (
                <>
                  <p className="text-display text-3xl text-ink sm:text-4xl">
                    From {formatZAR(product.startingPrice)}
                  </p>
                  <p className="text-sm text-stone">ex VAT</p>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {/* No options means no #configure section to anchor to — lead with the quote instead. */}
              {product.options.length > 0 ? (
                <>
                  <ButtonLink href="#configure" variant="accent" size="lg">
                    Customise yours
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </ButtonLink>
                  <ButtonLink
                    href={`/contact?product=${product.slug}`}
                    variant="outline"
                    size="lg"
                  >
                    Request a call
                  </ButtonLink>
                </>
              ) : (
                <>
                  <ButtonLink
                    href={`/contact?product=${product.slug}`}
                    variant="accent"
                    size="lg"
                  >
                    {product.priceOnRequest ? "Request a quote" : "Get a quote"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </ButtonLink>
                  <ButtonLink href="/#homes" variant="outline" size="lg">
                    Explore the range
                  </ButtonLink>
                </>
              )}
            </div>
          </Reveal>

          {/* LCP image: rendered statically (no Reveal) so the preloaded
              hero can paint before hydration. Entrance animation stays on
              the text column only. The image itself gets the same CSS-only
              ken-burns settle as the landing hero (globals.css) — a gentle
              scale-only zoom that starts after paint, so LCP timing is
              unaffected, and is fully removed for prefers-reduced-motion. */}
          {image && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[var(--shadow-lifted)]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 92vw"
                className="animate-hero-kenburns object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
