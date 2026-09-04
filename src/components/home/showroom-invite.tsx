import { ArrowRight, BadgeCheck, Building2, MapPin, PhoneCall } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { site } from "@/lib/site";
import { HOURS_SHORT_LABEL } from "@/lib/viewing";

/**
 * The trust section.
 *
 * Buying a house off a website is a large act of faith, and pretending nobody
 * has that thought does not remove it — it just leaves it unanswered at the
 * moment someone is deciding. Naming it outright and answering with an
 * address, a registered name, a phone number and a bookable slot converts the
 * doubt into the strongest thing this business has: units you can go and stand
 * inside.
 *
 * Placed straight after the video carousel on purpose. Footage is exactly the
 * kind of proof a sceptical reader discounts, so the pivot from "here's our
 * video" to "anyone can shoot a video, here's our address" lands where the
 * doubt actually is.
 */

const proofs = [
  {
    icon: MapPin,
    label: "A real showroom, not a PO box",
    value: `${site.showroom.name}, ${site.showroom.city}, ${site.showroom.region}`,
  },
  {
    icon: Building2,
    label: "A registered company",
    value: site.legalName,
  },
  {
    icon: BadgeCheck,
    label: "Homes on site you can walk through",
    value: "Stand inside one, measure it, open the cupboards",
  },
  {
    icon: PhoneCall,
    label: "A phone a person answers",
    value: site.phoneDisplay,
  },
];

export function ShowroomInvite() {
  return (
    <section
      aria-labelledby="showroom-invite-heading"
      className="bg-ink bg-grain py-24 text-cream sm:py-32"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-20">
          <Reveal>
            <p className="text-eyebrow text-clay-light">Still not sure about us?</p>
            <h2
              id="showroom-invite-heading"
              className="text-display mt-4 text-4xl sm:text-5xl lg:text-6xl"
            >
              Think this is a scam?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream/75">
              Fair enough. Anyone can put up a website and a handful of flattering
              photographs, and you have never met us. So don&apos;t take our word for any of
              it — take the drive instead.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-cream/75">
              Our homes are standing in Centurion. Book a slot, walk through one, kick the
              walls, ask us the awkward questions. Then decide.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="/book-a-viewing" variant="accent" size="lg">
                Book a viewing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonAnchor
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                variant="outline-dark"
                size="lg"
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                {site.phoneDisplay}
              </ButtonAnchor>
            </div>

            <p className="mt-6 text-sm text-cream/55">
              Free · No obligation · {HOURS_SHORT_LABEL}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <ul className="divide-y divide-cream/12 rounded-3xl border border-cream/15 bg-cream/[0.04]">
              {proofs.map((proof) => (
                <li key={proof.label} className="flex items-start gap-4 p-5 sm:p-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream/10 text-sage">
                    <proof.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="text-eyebrow block text-sage">{proof.label}</span>
                    <span className="mt-1.5 block text-[1.0625rem] leading-snug text-cream">
                      {proof.value}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
