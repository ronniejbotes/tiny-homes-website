import { Building2, CalendarClock, Mail } from "lucide-react";
import type { Product } from "@/data/products";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { ButtonAnchor } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/**
 * The three rules that separate a trade-only product from the rest of the
 * range, stated once, high on the page, before anyone reads a spec sheet and
 * assumes they can put one in their garden and buy it online.
 *
 * Rendered directly under the hero on products carrying `tradeOnly`. The
 * viewing line points at `site.safariTentsEmail` rather than /book-a-viewing
 * on purpose: no tent stands at the showroom, so the booker cannot show
 * anyone one. That page carries the same warning in reverse.
 */
export function TradeOnlyNotice({ product }: { product: Product }) {
  const mailto = `mailto:${site.safariTentsEmail}?subject=${encodeURIComponent(
    `${product.name} viewing request`,
  )}`;

  const rules = [
    {
      icon: Building2,
      title: "Businesses and hospitality only",
      body: "Lodges, glamping resorts, private reserves, bush camps, boutique hotels and event venues. We don't supply safari tents to private buyers.",
    },
    {
      icon: CalendarClock,
      title: "Not available to order",
      body: "There is no online order or instant quote for a tent. Every project starts with a consultation and ends with an itemised quotation.",
    },
    {
      icon: Mail,
      title: "Viewings by arrangement",
      body: "No tent stands at our Centurion showroom, so booking a showroom viewing won't show you one. A tent viewing is arranged individually.",
    },
  ];

  return (
    <section aria-labelledby="trade-only-heading" className="pb-4 sm:pb-8">
      <Container>
        <Reveal className="rounded-3xl border border-clay/30 bg-parchment/70 p-6 sm:p-9">
          <p className="text-eyebrow text-clay">Trade offering</p>
          <h2
            id="trade-only-heading"
            className="text-display mt-3 text-2xl text-ink sm:text-3xl"
          >
            How {product.name.toLowerCase()} are sold
          </h2>
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-stone">
            {product.name} work differently to the rest of our range. They are supplied to
            businesses and hospitality operators, they cannot be ordered through this site, and
            seeing one is a booking we make with you rather than a slot at the showroom.
          </p>

          <ul className="mt-7 grid gap-5 sm:grid-cols-3">
            {rules.map((rule) => (
              <li key={rule.title} className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay text-cream">
                  <rule.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-medium text-ink">{rule.title}</span>
                  <span className="mt-1 block text-[0.9375rem] leading-relaxed text-stone">
                    {rule.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
            <ButtonAnchor href={mailto} variant="accent" size="lg">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email {site.safariTentsEmail}
            </ButtonAnchor>
            <p className="text-[0.9375rem] leading-relaxed text-stone">
              Tell us about your operation and we&apos;ll set up a time to view the tents.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
