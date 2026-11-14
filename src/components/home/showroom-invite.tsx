import Link from "next/link";
import { BadgeCheck, Building2, MapPin, Navigation, PhoneCall } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ButtonAnchor } from "@/components/ui/button";
import { site, showroomDirectionsUrl } from "@/lib/site";
import { VIEWING_HREF } from "@/lib/enquiry";
import { HOURS_LABEL } from "@/lib/hours";

/**
 * The trust section.
 *
 * Buying a house off a website is a large act of faith, and pretending nobody
 * has that thought does not remove it — it just leaves it unanswered at the
 * moment someone is deciding. Naming it outright and answering with an
 * address, a registered name, a phone number and a way to view converts the
 * doubt into the strongest thing this business has: units you can go and stand
 * inside.
 *
 * Viewings are walk-in since 13 November 2026 (owner: "allow walk in visits
 * from 9 am to 4 pm, no email necessary"): Monday to Friday, 09:00 to 16:00,
 * no appointment. That replaced the 29 October rule that a viewing was asked
 * for by email first. The online booker and its slots stay gone.
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
    value: `${site.showroom.name}, ${site.showroom.locality}, ${site.showroom.city}`,
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
            {/* This heading read "Think this is a scam?" until 2026-09-17 (T-21).
                The section stays exactly as it is — inviting a doubtful buyer to
                come and look is the most persuasive thing on this page — but the
                old wording put the brand name and the word "scam" side by side in
                the one heading Google and the AI assistants quote most readily.
                Keep the heading an invitation. Do not put the word back. */}
            <h2
              id="showroom-invite-heading"
              className="text-display mt-4 text-4xl sm:text-5xl lg:text-6xl"
            >
              Want to see one before you pay?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream/75">
              Fair enough. Anyone can put up a website and a handful of flattering
              photographs, and you have never met us. So don&apos;t take our word for any of
              it.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-cream/75">
              Our homes are standing at our showroom in {site.showroom.locality},{" "}
              {site.showroom.city}. Walk in any weekday between 09:00 and 16:00 and see one
              for yourself. There&apos;s no appointment to book and no need to email first.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonAnchor
                href={showroomDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="accent"
                size="lg"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Get directions
              </ButtonAnchor>
              <ButtonAnchor
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                variant="outline-dark"
                size="lg"
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                {site.phoneDisplay}
              </ButtonAnchor>
            </div>

            <p className="mt-6 text-base text-cream/75">
              Walk-in viewings {HOURS_LABEL}. If you&apos;d like someone to walk you round,
              you can email us first at{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-cream underline decoration-cream/40 underline-offset-4 transition-colors hover:decoration-cream"
              >
                {site.email}
              </a>
              .{" "}
              <Link
                href={VIEWING_HREF}
                className="font-medium text-cream underline decoration-cream/40 underline-offset-4 transition-colors hover:decoration-cream"
              >
                How to find us
              </Link>
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
