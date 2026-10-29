import { ArrowRight, Phone } from "lucide-react";
import type { Product } from "@/data/products";
import { site } from "@/lib/site";
import { BUSINESS_ENQUIRY_HREF } from "@/lib/enquiry";
import { Container } from "@/components/ui/container";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function ProductCta({ product }: { product: Product }) {
  return (
    <section aria-label="Get started" className="bg-forest py-20 text-cream sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-eyebrow mb-4 text-sage">Next step</p>
          <h2 className="text-display text-4xl text-cream sm:text-5xl lg:text-6xl">
            {`Ready to start your ${product.shortName} journey?`}
          </h2>
          {/* Business buyers first (owner, 29 Oct 2026: larger companies buying
              multiple units are the main target), individual buyers second,
              with the same instant quote they had before. */}
          <p className="mt-5 text-lg leading-relaxed text-cream/75">
            Buying several units for a business? Send us a business enquiry with your company
            name, what the units will be used for, where they will go and how many you need.
            Buying one for yourself? Get an instant quote, or call us for honest advice and a
            delivery estimate.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href={BUSINESS_ENQUIRY_HREF} variant="accent" size="lg">
              Business enquiry
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              href={product.priceOnRequest ? "/contact" : `/quote?product=${product.slug}`}
              variant="outline-dark"
              size="lg"
            >
              {product.priceOnRequest ? "Request a call" : "Get an instant quote"}
            </ButtonLink>
            <ButtonAnchor
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              variant="outline-dark"
              size="lg"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {site.phoneDisplay}
            </ButtonAnchor>
          </div>
          <p className="mt-7 text-sm text-cream/75">
            {/* The ±90-day claim is documented for the homes range only;
                kitchens are quoted per order. */}
            {product.slug === "outdoor-kitchens"
              ? "Delivered ready to use · Nationwide across South Africa"
              : `±${site.leadTimeDays} days from deposit to move-in · Delivered nationwide across South Africa`}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
