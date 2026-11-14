import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Check, Dot, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { PhoneLabel } from "@/components/ui/phone-label";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  productItemListSchema,
  webPageSchema,
} from "@/lib/schema";
import { getProductImages } from "@/components/product/product-images";
import manifest from "@/data/images.json";
import { getBlogPost, type BlogPost } from "@/data/blog";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { BUSINESS_ENQUIRY_HREF, VIEWING_HREF } from "@/lib/enquiry";
import {
  compact,
  expandable,
  glassFront,
  siteOfficeFaqs,
  sixMetre,
  twelveMetre,
  xFold,
} from "./faqs";

/**
 * /site-offices: the commercial page for contractors and businesses buying
 * site offices (W13 competitor pass, 15 November 2026).
 *
 * Why it exists: in Brave's South African results for "site offices for sale
 * south africa" (15 Nov) every result above the fold is a supplier's own
 * site-office page, and we had none: the job was only a use-case card on
 * /folding-homes and /expandable-homes and an H2 in the staff guide. The
 * owner's direction of 29 October 2026 is business and multi-unit buyers
 * first. Pass record: seo-program plans/tiny-homes/competitor-beat/2026-11-15.md.
 *
 * Every fact here is already on the site: products.ts (the X-Fold's and the
 * expandable home's specs, prices, options, and their "Site office" and
 * "Secure storeroom" use cases), the staff accommodation guide ("Site offices"
 * and the buy-or-hire FAQ), the terms page (what a delivery includes) and
 * site.ts (delivery regions, lead time, guarantee, finance, showroom). No
 * projects, clients, counts or testimonials (T-104 is with the owner), no
 * stacking (the load rating is still owed), no hire service. Prices are read
 * from the catalogue, never typed. A new claim here needs the owner first.
 */

/** A manifest image by file name; throws at build time rather than render a gap. */
function imageOf(slug: string, file: string) {
  const image = getProductImages(slug).find((img) => img.src.endsWith(`/${file}`));
  if (!image) throw new Error(`site-offices: no image "${file}" for "${slug}"`);
  return image;
}

/* The client's own catalogue pictures (BLOG-IMAGES.md, source 1). None of
   them is a delivered project, and no caption or alt says it is. */
const heroImage = {
  ...imageOf("folding-homes", "exterior-colour-options.jpg"),
  alt: "Four X-Fold units in different colours standing side by side on a paved yard.",
};
const xFoldShell = {
  ...imageOf("folding-homes", "interior-shell-empty-v2.jpg"),
  alt: "Empty X-Fold interior with white wall boards, a vinyl floor, a steel door, a window and a small DB board, and no plumbing.",
};
const unfoldDiagram = {
  ...imageOf("folding-homes", "unfold-mechanism-diagram.jpg"),
  alt: "Drawing of an X-Fold three ways: standing assembled with its door open, folded flat for transport, and half-unfolded with its walls opening in an X shape.",
};
/* The empty expandable shell from the configurator pair: the room an office
   is fitted out in, with the bathroom door open (human-reader review, 15 Nov
   2026, swapped in for the furnished cutaway, which read as a house). */
const expandableShell = manifest.configurator["expandable-homes"].empty;

const title = "Site Offices for Sale in South Africa";
const description = `Site offices for building sites, mines and farms: X-Fold offices at ${formatZAR(xFold.startingPrice)} and units with a bathroom from ${formatZAR(compact.price)}, ex VAT. Delivered nationwide.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "site offices for sale",
    "site office for sale South Africa",
    "portable site office",
    "construction site office",
    "prefab site office",
    "project office unit",
    "mobile office South Africa",
  ],
  alternates: { canonical: "/site-offices" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.name,
    title,
    description,
    url: "/site-offices",
    images: [
      {
        url: heroImage.src,
        width: heroImage.width,
        height: heroImage.height,
        alt: heroImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [heroImage.src],
  },
};

const linkClasses =
  "font-medium text-clay-dark underline decoration-clay/30 underline-offset-4 transition-colors hover:text-clay hover:decoration-clay";

const kitchenNote = "basic stainless-steel cabinetry and a sink, no appliances";

/** One row per unit a contractor would price as an office. Sizes and prices from products.ts. */
const units = [
  {
    name: xFold.shortName,
    href: `/${xFold.slug}`,
    size: xFold.sizeLabel,
    rooms: "One room",
    services: "Wired: 2 plug points, a light, a small DB board. No plumbing",
    setup: "Unfolds in minutes, folds back down",
    price: xFold.startingPrice,
  },
  {
    name: "Compact expandable",
    href: `/${expandable.slug}`,
    size: compact.size,
    rooms: "One open-plan room",
    services: "Bathroom and a small basic kitchen, plumbing and electrics installed",
    setup: "Placed and connected",
    price: compact.price,
  },
  {
    name: "6m Expandable Home",
    href: `/${expandable.slug}`,
    size: sixMetre.size,
    rooms: "Two bedrooms as standard",
    services: `Fitted bathroom, kitchen (${kitchenNote}), plumbing and electrics installed`,
    setup: "Expands on site within hours",
    price: sixMetre.price,
  },
  {
    name: "12m Expandable Home",
    href: `/${expandable.slug}`,
    size: twelveMetre.size,
    rooms: "Two bedrooms as standard, layouts up to four",
    services: `Fitted bathroom, kitchen (${kitchenNote}), plumbing and electrics installed`,
    setup: "Expands on site within hours",
    price: twelveMetre.price,
  },
];

/** A point that is a limit, not a feature, renders with a plain dot, not a tick. */
const LIMIT = "limit:";

const xFoldPoints = [
  "An insulated 15 m² room, 5.8 × 2.48 m outside, with a steel door and two PVC windows",
  "Two plug points, a light fitting and a small DB board, already wired when it arrives",
  `${LIMIT}No plumbing: your team uses the site's toilets, or a local installer fits a wet room`,
  "Two workers unfold it in minutes, so the office opens the day the unit lands",
  "Folds back down and travels flat to the next site",
];

const expandablePoints = [
  "A bathroom and a kitchen in every size, with plumbing and electrics installed in the factory",
  "75 mm EPS insulated walls, double-glazed windows and a sliding glass entry door as standard",
  `Add a full glass front wall for a reception frontage, ${formatZAR(glassFront.price)} ex VAT`,
  "The 6m (37 m²) and 12m (74 m²) arrive as one module and open out on site within hours",
];

/** The guides this page sends a contractor to next, titles read from blog.ts. */
const guides = [
  "staff-accommodation-units-south-africa",
  "buying-prefab-buildings-for-a-business",
  "what-is-included-in-a-prefab-house-price",
  "building-approval-south-africa-what-you-need",
]
  .map((slug) => getBlogPost(slug))
  .filter((post): post is BlogPost => Boolean(post));

export default function SiteOfficesPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema("WebPage", {
            name: `${title} | ${site.name}`,
            description,
            path: "/site-offices",
          }),
          productItemListSchema("Site office units", [xFold, expandable]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Site Offices", path: "/site-offices" },
          ]),
          faqPageSchema(siteOfficeFaqs),
        ]}
      />

      {/* ---------------------------------------------------------- hero */}
      <section className="relative isolate overflow-hidden bg-forest text-cream">
        {/* As on /staff-accommodation: on a phone object-cover fills a box
            about 815-845px tall, so the picture is drawn about 1,100px wide;
            it is the LCP element, so it is preloaded. */}
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          preload
          fetchPriority="high"
          sizes="(max-width: 639px) 1130px, 100vw"
          className="object-cover opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-forest/85 via-forest/70 to-forest"
        />
        <Container className="relative pt-36 pb-20 sm:pt-44 sm:pb-28">
          {/* No <Reveal> on the first screen: it starts at opacity 0 and
              waits for JavaScript (the /housing-pods fix of 18 Oct 2026). */}
          <div className="max-w-3xl">
            <p className="text-eyebrow text-sage">
              For contractors and business buyers · from{" "}
              <span className="nums-tabular">{formatZAR(xFold.startingPrice)}</span> ex VAT
            </p>
            <h1 className="text-display mt-4 text-4xl sm:text-6xl lg:text-7xl">
              Need an office on site?
              <span className="mt-3 block text-2xl text-cream/85 sm:text-4xl lg:text-5xl">
                Site offices for sale, for building sites, mines and farms
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/80 sm:text-xl">
              We sell two kinds of site office, built in a factory and delivered to all nine
              provinces. The {xFold.shortName} is an insulated 15 m² room at{" "}
              <span className="nums-tabular">{formatZAR(xFold.startingPrice)}</span> ex VAT. It
              arrives wired, unfolds in minutes and folds back down for the next job. The expandable unit has its own bathroom and
              kitchen, from <span className="nums-tabular">{formatZAR(compact.price)}</span> ex
              VAT.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={BUSINESS_ENQUIRY_HREF} variant="accent" size="lg">
                Business enquiry
              </ButtonLink>
              <ButtonLink href="/quote" variant="outline-dark" size="lg">
                Price one online
              </ButtonLink>
            </div>
            <p className="mt-6 text-base text-cream/70">
              Walk-in viewings at our showroom in {site.showroom.locality},{" "}
              {site.showroom.city}, Monday to Friday 09:00 to 16:00.
            </p>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ which unit */}
      <section aria-labelledby="office-units" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="office-units"
            eyebrow="Pick by the job"
            title="Which unit should be your office?"
            intro="A room for the plans and the laptop, or a building with its own toilet and kitchen. The four sizes below, side by side."
          />

          <Reveal delay={0.08} className="mt-10 lg:mt-14">
            {/* Phones first, as on /staff-accommodation: under `sm` each row
                is a card with its own labels; from `sm` up it is the table. */}
            <div className="rounded-3xl border border-border bg-parchment sm:overflow-x-auto">
              <table className="block w-full border-collapse text-left sm:table sm:min-w-[52rem]">
                <caption className="sr-only">
                  Site office units compared by size, rooms, services, setup and price
                </caption>
                <thead className="sr-only sm:not-sr-only sm:table-header-group">
                  <tr className="border-b border-border">
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      Unit
                    </th>
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      Floor area
                    </th>
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      Rooms
                    </th>
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      Services
                    </th>
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      On site
                    </th>
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      Per unit (ex VAT)
                    </th>
                  </tr>
                </thead>
                <tbody className="block divide-y divide-border sm:table-row-group">
                  {units.map((unit) => (
                    <tr key={unit.name} className="block px-5 py-5 align-top sm:table-row sm:p-0">
                      <th scope="row" className="block font-normal sm:table-cell sm:px-6 sm:py-5">
                        <Link
                          href={unit.href}
                          className="font-display text-lg text-ink underline decoration-border underline-offset-4 transition-colors hover:text-clay"
                        >
                          {unit.name}
                        </Link>
                      </th>
                      <td className="nums-tabular mt-3 block text-base text-stone sm:mt-0 sm:table-cell sm:px-6 sm:py-5">
                        <PhoneLabel>Floor area</PhoneLabel>
                        {unit.size}
                      </td>
                      <td className="mt-3 block text-base text-stone sm:mt-0 sm:table-cell sm:px-6 sm:py-5">
                        <PhoneLabel>Rooms</PhoneLabel>
                        {unit.rooms}
                      </td>
                      <td className="mt-3 block text-base text-stone sm:mt-0 sm:table-cell sm:px-6 sm:py-5">
                        <PhoneLabel>Services</PhoneLabel>
                        {unit.services}
                      </td>
                      <td className="mt-3 block text-base text-stone sm:mt-0 sm:table-cell sm:px-6 sm:py-5">
                        <PhoneLabel>On site</PhoneLabel>
                        {unit.setup}
                      </td>
                      <td className="nums-tabular mt-3 block font-medium text-ink sm:mt-0 sm:table-cell sm:px-6 sm:py-5">
                        <PhoneLabel>Per unit (ex VAT)</PhoneLabel>
                        {formatZAR(unit.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Stagger className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-2" as="ul">
            {[
              {
                product: xFold,
                eyebrow: "The office that moves with the job",
                image: xFoldShell,
                points: xFoldPoints,
                bestFor:
                  "A site manager's office or a plan room, on jobs that finish and move on.",
                link: "See the X-Fold in full",
              },
              {
                product: expandable,
                eyebrow: "A project office with its own bathroom",
                image: expandableShell,
                points: expandablePoints,
                bestFor:
                  "A longer project, or an office that needs its own toilet, a kitchen and more than one room.",
                link: "See the expandable home in full",
              },
            ].map(({ product, eyebrow, image, points, bestFor, link }) => (
              <StaggerItem key={product.slug} as="li">
                <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-parchment">
                  <Link href={`/${product.slug}`} className="relative block aspect-[16/10] bg-cream">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 40rem, 100vw"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-7 sm:p-8">
                    <p className="text-eyebrow text-clay-dark">{eyebrow}</p>
                    <h3 className="mt-3 font-display text-2xl text-ink sm:text-3xl">
                      <Link href={`/${product.slug}`} className="transition-colors hover:text-clay">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="nums-tabular mt-2 text-lg font-medium text-ink">
                      {product.slug === xFold.slug ? "" : "From "}
                      {formatZAR(product.startingPrice)} ex VAT{" "}
                      <span className="whitespace-nowrap text-sm font-normal text-stone">
                        {product.sizeLabel}
                      </span>
                    </p>
                    <ul className="mt-5 space-y-3">
                      {points.map((point) => (
                        <li key={point} className="flex gap-3 text-base leading-relaxed text-stone">
                          {point.startsWith(LIMIT) ? (
                            <Dot className="mt-1 h-4 w-4 shrink-0 text-stone" aria-hidden="true" />
                          ) : (
                            <Check className="mt-1 h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
                          )}
                          {point.startsWith(LIMIT) ? point.slice(LIMIT.length) : point}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-base leading-relaxed text-stone">
                      <span className="font-medium text-ink">Suits: </span>
                      {bestFor}
                    </p>
                    <Link
                      href={`/${product.slug}`}
                      className="mt-auto inline-flex min-h-11 items-center gap-2 pt-6 font-medium text-clay transition-colors hover:text-clay-dark"
                    >
                      {link}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ------------------------------------------- when the job moves */}
      <section aria-labelledby="office-moves" className="bg-parchment py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
            <Reveal>
              <p className="text-eyebrow mb-4 text-clay-dark">When the job moves</p>
              <h2 id="office-moves" className="text-display text-4xl text-ink sm:text-5xl">
                Buy once, use it on the next site
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-stone">
                <p>
                  An X-Fold travels flat. When the job is done it folds back down, goes onto a
                  truck and unfolds again at the next site, so the same office can follow a
                  contractor from project to project. Between jobs it works as a lockable,
                  insulated storeroom for tools and stock.
                </p>
                <p>
                  If you might move an expandable unit to a new site later, ask us before you
                  order.
                </p>
                <p>
                  Buying or hiring comes down to how long the job runs, and whether another one
                  follows it. Our{" "}
                  <Link href="/blog/staff-accommodation-units-south-africa" className={linkClasses}>
                    staff accommodation and site office guide
                  </Link>{" "}
                  sets out how to compare the two.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <figure>
                <Image
                  src={unfoldDiagram.src}
                  alt={unfoldDiagram.alt}
                  width={unfoldDiagram.width}
                  height={unfoldDiagram.height}
                  sizes="(min-width: 1024px) 32rem, 100vw"
                  className="mx-auto w-full max-w-md rounded-3xl bg-cream object-contain"
                />
                <figcaption className="mt-3 text-base leading-relaxed text-stone">
                  The X-Fold standing, folded flat for transport, and halfway through unfolding.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ the order */}
      <section aria-labelledby="office-order" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="office-order"
            eyebrow="From enquiry to an open office"
            title="What buying a site office involves"
            intro="The same steps for one office or several, in the order they happen."
          />

          <ol className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-2">
            {[
              {
                h: "Tell us the job",
                p: (
                  <>
                    <Link href={BUSINESS_ENQUIRY_HREF} className={linkClasses}>
                      Send a business enquiry
                    </Link>{" "}
                    with your company name, what the units are for, where they will stand and
                    how many you need. Ordering offices and crew rooms together? Put both in the
                    one enquiry. We reply with a formal quotation that prices the units and the delivery together.
                  </>
                ),
              },
              {
                h: "Prepare the ground",
                p: "Each unit stands on a level concrete slab or properly levelled precast plinths, and the truck has to get close. X-Folds come off the truck by crane or forklift, which we arrange and quote with the delivery. An expandable unit arrives as one module.",
              },
              {
                h: "Bring power, and water if needed",
                p: "An X-Fold needs power to its small DB board. An expandable unit needs water, sewerage and power to its factory-installed plumbing and electrics. These connections are not in the unit price, and connecting the wiring needs a certificate of compliance from a registered electrician.",
              },
              {
                h: "Delivery and setup",
                p: `Allow around ${site.leadTimeDays} days from deposit to move-in; several units can come in phases. Our team unfolds and sets up each X-Fold on your prepared base. The 6m and 12m expandable units open out on site within hours, the compact 18 m² is placed and connected, and installing the expandable units is quoted separately.`,
              },
            ].map((step, i) => (
              <li key={step.h} className="flex gap-5 rounded-3xl border border-border bg-parchment p-6 sm:p-7">
                <span
                  aria-hidden="true"
                  className="nums-tabular flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest font-display text-lg text-cream"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl text-ink">{step.h}</h3>
                  <p className="mt-2 text-base leading-relaxed text-stone">{step.p}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <Reveal>
              <div className="h-full rounded-3xl border border-border bg-parchment p-6 sm:p-7">
                <h3 className="font-display text-xl text-ink">Near the coast</h3>
                <p className="mt-3 text-base leading-relaxed text-stone">
                  Salt air corrodes the standard panels. On a coastal site the X-Fold needs the
                  metal carved board exterior, and the expandable unit the polyurethane metal
                  carved board walls. Tell us the site&rsquo;s location when you ask for a quote.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="h-full rounded-3xl border border-border bg-parchment p-6 sm:p-7">
                <h3 className="font-display text-xl text-ink">Rather hand it over?</h3>
                <p className="mt-3 text-base leading-relaxed text-stone">
                  Ask whether our turnkey service covers your area and your units. Where it
                  does, we can arrange the groundwork, plinths, connections and installation, or
                  you can use your own contractors.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-3xl border border-border bg-parchment p-6 sm:p-7">
                <h3 className="font-display text-xl text-ink">Guarantee and finance</h3>
                <p className="mt-3 text-base leading-relaxed text-stone">
                  A {site.guarantee}, with after-sales support. {site.finance}.
                </p>
              </div>
            </Reveal>
          </div>

          <p className="mt-10 max-w-3xl text-lg leading-relaxed text-stone">
            Housing the crew as well as running the site? Our page on{" "}
            <Link href="/staff-accommodation" className={linkClasses}>
              staff accommodation units
            </Link>{" "}
            covers rooms for the people who stay on site.
          </p>
        </Container>
      </section>

      {/* ---------------------------------------------------------- FAQs */}
      <section aria-labelledby="office-faq" className="bg-parchment py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="office-faq"
            eyebrow="Site offices, answered"
            title="Frequently asked questions"
          />
          <Reveal className="mt-10 lg:mt-14" delay={0.1}>
            <Accordion items={[...siteOfficeFaqs]} />
          </Reveal>

          <Reveal delay={0.12} className="mt-12">
            <h3 className="font-display text-2xl text-ink">Guides for business buyers</h3>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {guides.map((post) => (
                <li key={post.slug} className="flex">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex w-full flex-col rounded-3xl border border-border bg-cream p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-soft)]"
                  >
                    <span className="font-display text-lg text-ink">{post.title}</span>
                    <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-forest">
                      Read the guide
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      {/* ----------------------------------------------------------- CTA */}
      <section aria-labelledby="office-cta" className="bg-forest bg-grain py-24 text-cream sm:py-32">
        <Container className="text-center">
          <Reveal>
            <p className="text-eyebrow text-sage">Business enquiries</p>
            <h2 id="office-cta" className="text-display mx-auto mt-4 max-w-3xl text-4xl sm:text-6xl">
              How many offices, and where?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
              Tell us the site and how many units you need, and we&rsquo;ll price the units and
              the delivery together in a formal quotation.
            </p>
            <div className="mt-10 flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href={BUSINESS_ENQUIRY_HREF} variant="accent" size="lg">
                <Building2 className="h-4 w-4" aria-hidden="true" /> Business enquiry
              </ButtonLink>
              <ButtonAnchor
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                variant="outline-dark"
                size="lg"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> {site.phoneDisplay}
              </ButtonAnchor>
            </div>
            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-cream/70">
              Rather see our units in person first? Walk in to our showroom in{" "}
              {site.showroom.locality}, {site.showroom.city}, any weekday between 09:00 and
              16:00, no appointment needed.{" "}
              <Link
                href={VIEWING_HREF}
                className="font-medium text-cream underline decoration-cream/40 underline-offset-4 hover:decoration-cream"
              >
                Times and directions
              </Link>
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
