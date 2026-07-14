import { ArrowRight, Phone } from "lucide-react";
import type { Product } from "@/data/products";
import { site } from "@/lib/site";
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
            Ready to start your {product.shortName} journey?
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-cream/75">
            Tell us about your site and we&apos;ll call you back with honest
            advice, a delivery estimate and a formal quotation — no pressure,
            no obligation.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink
              href={`/contact?product=${product.slug}`}
              variant="accent"
              size="lg"
            >
              Request a call
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
            {/* The ±90-day claim is documented for the homes range only — the
                kitchens and safari tents are quoted per order/project. */}
            {product.slug === "safari-tents"
              ? "Lead time quoted per project · Supplied and installed nationwide across South Africa"
              : product.slug === "outdoor-kitchens"
                ? "Delivered ready to use · Nationwide across South Africa"
                : `±${site.leadTimeDays} days from deposit to move-in · Delivered nationwide across South Africa`}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
