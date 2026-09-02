import { MapPin, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { site } from "@/lib/site";

/**
 * Where we deliver, written out.
 *
 * Structured data alone will not rank a page for "tiny homes Gauteng" or
 * "prefab homes Botswana": a search engine needs the words on the page, and
 * until now the site only ever said "nationwide". The provinces carry the
 * local-intent searches, which are where the buyers are.
 *
 * Cross-border is real work we take, confirmed by the owner, so the copy states
 * it plainly rather than hedging. What it does not do is imply a fixed rate:
 * every run is priced per project, because transport and customs vary by
 * destination. South Africa stays the primary market and leads the section.
 */
export function DeliveryCoverage() {
  return (
    <section aria-labelledby="coverage-heading" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Where we deliver"
          title="Anywhere the truck can reach"
          intro="Your home is trucked to your site anywhere in South Africa. Delivery is quoted separately on distance and access, at cost, with no markup."
          id="coverage-heading"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Reveal className="rounded-3xl border border-border bg-parchment p-6 sm:p-8">
            <h3 className="flex items-center gap-3 font-display text-xl text-ink">
              <Truck className="h-5 w-5 text-clay" aria-hidden="true" />
              All nine South African provinces
            </h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
              From the Cape coast to the Limpopo bushveld. If a truck and a crane can reach the
              site, we can put a home on it.
            </p>
            <Stagger as="ul" className="mt-6 flex flex-wrap gap-2.5">
              {site.deliveryRegions.provinces.map((province) => (
                <StaggerItem as="li" key={province}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-cream px-4 py-2 text-sm font-medium text-ink">
                    <MapPin className="h-3.5 w-3.5 text-clay" aria-hidden="true" />
                    {province}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>

          <Reveal delay={0.08} className="rounded-3xl border border-border bg-forest p-6 text-cream sm:p-8">
            <h3 className="font-display text-xl text-cream">Across southern Africa</h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-cream/75">
              We deliver across the border too. Each run is quoted per project, including the
              transport and the customs paperwork, so tell us where the site is and we will price it.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {site.deliveryRegions.countries.map((country) => (
                <li
                  key={country}
                  className="rounded-full border border-cream/25 px-4 py-2 text-sm font-medium text-cream/90"
                >
                  {country}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
