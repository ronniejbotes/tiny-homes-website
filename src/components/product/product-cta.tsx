import { ArrowRight, Mail, Phone } from "lucide-react";
import type { Product } from "@/data/products";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function ProductCta({ product }: { product: Product }) {
  const trade = product.tradeOnly === true;
  const viewingMailto = `mailto:${site.safariTentsEmail}?subject=${encodeURIComponent(
    `${product.name} enquiry`,
  )}`;

  return (
    <section aria-label="Get started" className="bg-forest py-20 text-cream sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-eyebrow mb-4 text-sage">Next step</p>
          <h2 className="text-display text-4xl text-cream sm:text-5xl lg:text-6xl">
            {trade
              ? `Planning ${product.name.toLowerCase()} for your operation?`
              : `Ready to start your ${product.shortName} journey?`}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-cream/75">
            {trade
              ? "Tell us about the lodge, resort or venue and what you're trying to build. We'll talk it through, arrange a time for you to come and view the tents, and follow it with an itemised quotation."
              : "Tell us about your site and we'll call you back with honest advice, a delivery estimate and a formal quotation, with no pressure, no obligation."}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {/* Trade-only products are never ordered and never at the
                showroom, so neither the quote builder nor the showroom booker
                belongs here — the email that arranges a viewing does. */}
            {trade ? (
              <ButtonAnchor href={viewingMailto} variant="accent" size="lg">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {site.safariTentsEmail}
              </ButtonAnchor>
            ) : (
              <>
                <ButtonLink
                  href={product.priceOnRequest ? "/contact" : `/quote?product=${product.slug}`}
                  variant="accent"
                  size="lg"
                >
                  {product.priceOnRequest ? "Request a call" : "Get an instant quote"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/book-a-viewing" variant="outline-dark" size="lg">
                  Book a viewing
                </ButtonLink>
              </>
            )}
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
                kitchens and safari tents are quoted per order/project. */}
            {trade
              ? "Businesses and hospitality only · Not available to order online · Viewings by arrangement, not at the showroom"
              : product.slug === "outdoor-kitchens"
                ? "Delivered ready to use · Nationwide across South Africa"
                : `±${site.leadTimeDays} days from deposit to move-in · Delivered nationwide across South Africa`}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
