import Link from "next/link";
import { BedDouble, Building2, HardHat, Mail, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonAnchor } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { businessEnquiryMailto } from "@/lib/enquiry";
import { site } from "@/lib/site";

/**
 * "For businesses" (owner, 29 October 2026): "Our main target for tiny homes
 * now is to deal with larger companies that will buy multiple units."
 *
 * Every sentence below restates something the site already says, so nothing
 * new is claimed here: no prices, discounts, client names or volumes. Sources:
 *   - Staff accommodation: the X-Fold and expandable-home use cases
 *     (products.ts, "Staff accommodation and living quarters").
 *   - Lodges and glamping: "cabins and capsules arrive fully built" (home FAQ),
 *     the Apple Cabin's "a resort adds keys without a building site" and the
 *     capsule's "a lodge adds suites without closing to guests".
 *   - Developers and estates: the expandable home's "Developer and rental
 *     projects" and the outdoor kitchen's "Developer amenity" use cases.
 *   - Delivery: site.deliveryRegions and the ±90-day lead time.
 * Keep it that way: a new claim here needs the owner first.
 *
 * The anchor (#business) is what the hero's "See what suits a business" link
 * scrolls to.
 */

const linkClasses =
  "font-medium text-clay-dark underline decoration-clay/30 underline-offset-4 transition-colors hover:text-clay hover:decoration-clay";

const uses = [
  {
    icon: HardHat,
    title: "Staff accommodation",
    body: (
      <>
        <Link href="/folding-homes" className={linkClasses}>
          X-Folds
        </Link>{" "}
        give on-site staff, farm workers or construction and mining crews an insulated room,
        and stack two high where ground space is tight.{" "}
        <Link href="/expandable-homes" className={linkClasses}>
          Expandable homes
        </Link>{" "}
        are self-contained units for mine, lodge, security or estate staff, each with its own
        bathroom and kitchen.
      </>
    ),
  },
  {
    icon: BedDouble,
    title: "Lodges and glamping operators",
    body: (
      <>
        <Link href="/glamping-capsules" className={linkClasses}>
          Glamping capsules
        </Link>
        ,{" "}
        <Link href="/nature-cabins" className={linkClasses}>
          nature cabins
        </Link>{" "}
        and{" "}
        <Link href="/apple-cabins" className={linkClasses}>
          Apple Cabins
        </Link>{" "}
        arrive fully built, so a lodge or resort adds suites without a building site.
      </>
    ),
  },
  {
    icon: Building2,
    title: "Developers and estates",
    body: (
      <>
        Expandable homes are straightforward to repeat across a rental or resort scheme: order
        in volume, take delivery in phases, and finish each unit identically.{" "}
        <Link href="/outdoor-kitchens" className={linkClasses}>
          Outdoor kitchens
        </Link>{" "}
        give an estate or apartment scheme a repeatable communal braai facility.
      </>
    ),
  },
  {
    icon: Truck,
    title: "Delivered where you need them",
    body: (
      <>
        We deliver to all nine South African provinces, and across the border on request, with
        delivery quoted for your site. Allow around{" "}
        {site.leadTimeDays} days from deposit to move-in.
      </>
    ),
  },
];

export function ForBusinesses() {
  return (
    <section
      id="business"
      aria-labelledby="business-heading"
      className="scroll-mt-24 border-b border-border bg-parchment py-20 sm:py-28"
    >
      <Container>
        <SectionHeading
          id="business-heading"
          eyebrow="For businesses"
          title="Buying several units for your business?"
          intro="Tell us your company name, what the units will be used for, where they will go and how many you need, and we'll come back to you with a formal quotation."
        />

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {uses.map((use) => (
            <StaggerItem key={use.title} className="flex">
              <div className="flex w-full flex-col rounded-3xl border border-border bg-cream p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-cream">
                  <use.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-ink">
                  {use.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-stone">{use.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <ButtonAnchor href={businessEnquiryMailto} variant="accent" size="lg">
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email a business enquiry
          </ButtonAnchor>
          <p className="text-base leading-relaxed text-stone">
            Opens an email with those questions filled in. Or write to{" "}
            <a href={`mailto:${site.email}`} className={linkClasses}>
              {site.email}
            </a>
            .
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
