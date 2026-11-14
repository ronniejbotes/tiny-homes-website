import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Building2,
  Check,
  Dot,
  HardHat,
  Phone,
  ShieldCheck,
  Tractor,
  UserRound,
} from "lucide-react";
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
import { getBlogPost, type BlogPost } from "@/data/blog";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { BUSINESS_ENQUIRY_HREF, VIEWING_HREF } from "@/lib/enquiry";
import { compact, compactPrice, expandable, sixMetre, staffFaqs, twelveMetre, xFold } from "./faqs";

/**
 * /staff-accommodation: the commercial page for business buyers housing staff
 * (T-109, 14 November 2026).
 *
 * Why it exists: the 14 Nov competitor pass (seo-program
 * plans/tiny-homes/competitor-beat/2026-11-14.md) found that the suppliers
 * winning "prefab homes south africa" and the staff-accommodation searches
 * all have a commercial page per business use, split by sector, and we had
 * only a blog guide. The owner's direction of 29 October 2026 is business
 * buyers first.
 *
 * Every fact here is already on the site: products.ts (the X-Fold and the
 * expandable home: sizes, prices, specs, use cases), the staff accommodation
 * guide (the ablution decision, cost per bed, phased delivery), the business
 * buyer's guide (what a multi-unit enquiry needs), the terms page (what a
 * delivery includes), and site.ts (delivery regions, lead time, guarantee,
 * finance, showroom). No projects, clients, counts or testimonials: none are
 * on record (T-104 is with the owner). No beds-per-unit figure: the catalogue
 * gives floor area and bedrooms only. Prices are read from the catalogue,
 * never typed. A new claim here needs the owner first.
 */

/** A manifest image by file name; throws at build time rather than render a gap. */
function imageOf(slug: string, file: string) {
  const image = getProductImages(slug).find((img) => img.src.endsWith(`/${file}`));
  if (!image) throw new Error(`staff-accommodation: no image "${file}" for "${slug}"`);
  return image;
}

/* The client's own catalogue pictures (BLOG-IMAGES.md, source 1). The aerial
   is a render, and its alt and the hero caption say so: it must never read
   as a delivered project. */
const heroImage = {
  ...imageOf("folding-homes", "site-installations-aerial.jpg"),
  alt: "Render of rows of white X-Fold units on a cleared site in dry bushveld, seen from above.",
};
const xFoldRoom = imageOf("folding-homes", "interior-shell-furnished-v2.jpg");
const xFoldShell = {
  ...imageOf("folding-homes", "interior-shell-empty-v2.jpg"),
  alt: "Empty X-Fold interior with white wall boards, a vinyl floor, a steel door, a window and a small DB board, and no plumbing.",
};
const expandableCutaway = {
  ...imageOf("expandable-homes", "brochure-dollhouse.jpg"),
  alt: "Cutaway drawing of a two-bedroom Expandable Home showing the bedrooms, bathroom, kitchen and living area.",
};

/** The worked example's unit count. Arithmetic on published prices, not an order. */
const EXAMPLE_UNITS = 6;
const EXAMPLE_WORD = "six";

const title = "Staff Accommodation Units for Sale in South Africa";
const description = `Staff accommodation units for mines, farms, lodges, sites: X-Fold rooms at ${formatZAR(xFold.startingPrice)} and self-contained units from ${formatZAR(expandable.startingPrice)} ex VAT, delivered nationwide.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "staff accommodation units",
    "staff accommodation units for sale",
    "staff housing South Africa",
    "prefab staff accommodation",
    "mine camp accommodation",
    "farm worker housing units",
    "construction site accommodation",
    "lodge staff accommodation",
  ],
  alternates: { canonical: "/staff-accommodation" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.name,
    title,
    description,
    url: "/staff-accommodation",
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

/** One row per unit a business would price for staff. Sizes and prices from products.ts. */
const units = [
  {
    name: xFold.shortName,
    href: `/${xFold.slug}`,
    size: xFold.sizeLabel,
    rooms: "One room",
    bathroom: "None. Wired only: 2 plug points, a light, a small DB board",
    price: xFold.startingPrice,
  },
  {
    name: "Compact expandable",
    href: `/${expandable.slug}`,
    size: compact.size,
    rooms: "Open plan",
    bathroom: "Bathroom and a small basic kitchen",
    price: compact.price,
  },
  {
    name: "6m Expandable Home",
    href: `/${expandable.slug}`,
    size: sixMetre.size,
    rooms: "Two bedrooms",
    bathroom: `Fully fitted bathroom, kitchen (${kitchenNote})`,
    price: sixMetre.price,
  },
  {
    name: "12m Expandable Home",
    href: `/${expandable.slug}`,
    size: twelveMetre.size,
    rooms: "Two bedrooms standard, layouts up to four",
    bathroom: `Fully fitted bathroom, kitchen (${kitchenNote})`,
    price: twelveMetre.price,
  },
];

/** A point that is a limit, not a feature, renders with a plain dot, not a tick. */
const LIMIT = "limit:";

const xFoldPoints = [
  "An insulated 15 m² room, 5.8 × 2.48 m outside, with EPS panels: warmer in winter, cooler in summer",
  "Wired for electricity: two plug points, a light fitting and a small DB board",
  `${LIMIT}No plumbing: staff use a shared ablution block, or a local installer fits a wet room`,
  "Stacks up to two units high where ground space is tight",
  "Arrives flat; two workers unfold it in minutes, and it folds back down for the next site",
];

const expandablePoints = [
  "A bathroom and a kitchen in every size, so there is no shared ablution block to build",
  "Plumbing and electrics installed in the factory",
  "75 mm EPS insulated walls and double-glazed windows as standard; a polyurethane wall upgrade insulates better, and is required on coastal sites",
  "The 6m (37 m²) and 12m (74 m²) arrive as one module and expand on site within hours",
];

/** Uses by sector, as the products' own use-case cards and the guides state them. */
const sectors = [
  {
    icon: HardHat,
    title: "Mines and construction sites",
    body: "X-Folds give construction and mining crews an insulated room. They ship flat, stack two high where ground is tight, and fold back down when the job moves on. An X-Fold also works as the site office, wired and open the day it lands. For mine staff who stay put, expandable homes give each unit its own bathroom and kitchen.",
  },
  {
    icon: Tractor,
    title: "Farms",
    body: "Expandable homes reach remote farms as a single load, with no local build crew to organise, and the 6m and 12m open out within hours. Each is insulated and double-glazed, with a bathroom and a kitchen. X-Folds give farm workers an insulated room where the ablutions are shared.",
  },
  {
    icon: BedDouble,
    title: "Lodges and game farms",
    body: (
      <>
        Expandable homes give lodge staff a self-contained unit each, with its own bathroom and
        kitchen. Adding guest suites as well? List them separately in your enquiry, because{" "}
        <Link href="/glamping-capsules" className={linkClasses}>
          Glamping Capsules
        </Link>
        ,{" "}
        <Link href="/nature-cabins" className={linkClasses}>
          Nature Cabins
        </Link>{" "}
        and{" "}
        <Link href="/apple-cabins" className={linkClasses}>
          Apple Cabins
        </Link>{" "}
        each have their own site needs.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Estates and security",
    body: "Self-contained expandable homes for security or estate staff, each with its own bathroom and kitchen, finished identically and delivered in phases if that suits the estate's programme.",
  },
  {
    icon: UserRound,
    title: "Supervisors and managers",
    body: "The 6m (37 m²) and 12m (74 m²) expandable homes have two bedrooms as standard, so they suit a supervisor's unit or family accommodation beside the crew's rooms.",
  },
];

/** The guides this page sends a business buyer to next, titles read from blog.ts. */
const guides = [
  "staff-accommodation-units-south-africa",
  "buying-prefab-buildings-for-a-business",
  "building-approval-south-africa-what-you-need",
  "what-is-included-in-a-prefab-house-price",
]
  .map((slug) => getBlogPost(slug))
  .filter((post): post is BlogPost => Boolean(post));

export default function StaffAccommodationPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema("WebPage", {
            name: `${title} | ${site.name}`,
            description,
            path: "/staff-accommodation",
          }),
          productItemListSchema("Staff accommodation units", [xFold, expandable]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Staff Accommodation", path: "/staff-accommodation" },
          ]),
          faqPageSchema(staffFaqs),
        ]}
      />

      {/* ---------------------------------------------------------- hero */}
      <section className="relative isolate overflow-hidden bg-forest text-cream">
        {/* sizes and priority as on /housing-pods: on a phone object-cover
            fills a box about 815-845px tall, so the picture is drawn about
            1,100px wide; it is the LCP element, so it is preloaded. */}
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          preload
          fetchPriority="high"
          sizes="(max-width: 639px) 1130px, 100vw"
          className="object-cover opacity-45"
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
              For business buyers · from{" "}
              <span className="nums-tabular">{formatZAR(xFold.startingPrice)}</span> ex VAT a
              unit
            </p>
            <h1 className="text-display mt-4 text-4xl sm:text-6xl lg:text-7xl">
              Need to house staff on site?
              <span className="mt-3 block text-2xl text-cream/85 sm:text-4xl lg:text-5xl">
                Staff accommodation units for mines, farms, lodges, building sites and estates
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/80 sm:text-xl">
              We supply two kinds of unit for housing staff, built in a factory and delivered to all
              nine provinces: the {xFold.shortName}, an insulated 15 m² room at{" "}
              <span className="nums-tabular">{formatZAR(xFold.startingPrice)}</span> ex VAT,
              and the expandable home, a self-contained unit with its own bathroom and kitchen
              from <span className="nums-tabular">{formatZAR(compactPrice)}</span> ex VAT.
              Below: which unit suits which staff, what a multi-unit order involves, and what
              to have ready before you ask for a quote.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={BUSINESS_ENQUIRY_HREF} variant="accent" size="lg">
                Business enquiry
              </ButtonLink>
              <ButtonLink href="/quote" variant="outline-dark" size="lg">
                Price one online
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm text-cream/60">
              Delivered to all nine provinces. Walk-in viewings at our showroom in{" "}
              {site.showroom.locality}, {site.showroom.city}, Monday to Friday 09:00 to 16:00.
            </p>
            <p className="mt-2 text-xs text-cream/45">
              Pictured: a render of X-Folds set out in rows on a bushveld site.
            </p>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------- which units suit */}
      <section aria-labelledby="staff-units" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="staff-units"
            eyebrow="The two units"
            title="Which units suit staff housing"
            intro="The comparison below gives the floor area and rooms in each unit's specification. How many people share a room is your decision, so work out the cost per bed with your own number."
          />

          <Reveal delay={0.08} className="mt-10 lg:mt-14">
            {/* Phones first, as on /housing-pods: under `sm` each row is a
                card with its own labels; from `sm` up it is the table. */}
            <div className="rounded-3xl border border-border bg-parchment sm:overflow-x-auto">
              <table className="block w-full border-collapse text-left sm:table sm:min-w-[46rem]">
                <caption className="sr-only">
                  Staff accommodation units compared by size, rooms, bathroom and price
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
                      Bathroom and kitchen
                    </th>
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      Per unit (ex VAT)
                    </th>
                  </tr>
                </thead>
                <tbody className="block divide-y divide-border sm:table-row-group">
                  {units.map((unit) => (
                    <tr
                      key={unit.name}
                      className="block px-5 py-5 align-top sm:table-row sm:p-0"
                    >
                      <th scope="row" className="block font-normal sm:table-cell sm:px-6 sm:py-5">
                        <Link
                          href={unit.href}
                          className="font-display text-lg text-ink underline decoration-border underline-offset-4 transition-colors hover:text-clay"
                        >
                          {unit.name}
                        </Link>
                      </th>
                      <td className="nums-tabular mt-3 block text-[0.9375rem] text-stone sm:mt-0 sm:table-cell sm:px-6 sm:py-5">
                        <PhoneLabel>Floor area</PhoneLabel>
                        {unit.size}
                      </td>
                      <td className="mt-3 block text-[0.9375rem] text-stone sm:mt-0 sm:table-cell sm:px-6 sm:py-5">
                        <PhoneLabel>Rooms</PhoneLabel>
                        {unit.rooms}
                      </td>
                      <td className="mt-3 block text-[0.9375rem] text-stone sm:mt-0 sm:table-cell sm:px-6 sm:py-5">
                        <PhoneLabel>Bathroom and kitchen</PhoneLabel>
                        {unit.bathroom}
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
                eyebrow: "An insulated room, no plumbing",
                image: xFoldRoom,
                points: xFoldPoints,
                bestFor:
                  "Construction and mining crews, farm workers, and any site where the camp moves with the work.",
                link: "See the X-Fold in full",
              },
              {
                product: expandable,
                eyebrow: "Self-contained: a bathroom and kitchen in each",
                image: expandableCutaway,
                points: expandablePoints,
                bestFor:
                  "Mine, lodge, security or estate staff who need their own bathroom and kitchen. Also a supervisor's or family unit.",
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
                        <li
                          key={point}
                          className="flex gap-3 text-[0.9375rem] leading-relaxed text-stone"
                        >
                          {point.startsWith(LIMIT) ? (
                            <Dot className="mt-1 h-4 w-4 shrink-0 text-stone" aria-hidden="true" />
                          ) : (
                            <Check className="mt-1 h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
                          )}
                          {point.startsWith(LIMIT) ? point.slice(LIMIT.length) : point}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-[0.9375rem] leading-relaxed text-stone">
                      <span className="font-medium text-ink">Suits: </span>
                      {bestFor}
                    </p>
                    <Link
                      href={`/${product.slug}`}
                      className="mt-auto inline-flex items-center gap-2 pt-6 font-medium text-clay transition-colors hover:text-clay-dark"
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

      {/* ------------------------------------------------- ablutions */}
      <section aria-labelledby="staff-ablutions" className="bg-parchment py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <Reveal>
              <p className="text-eyebrow mb-4 text-clay-dark">Before you count units</p>
              <h2 id="staff-ablutions" className="text-display text-4xl text-ink sm:text-5xl">
                The ablution decision comes first
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-stone">
                <p>
                  The X-Fold arrives <strong className="font-medium text-ink">wired but not
                  plumbed</strong>. That keeps its price where it is, and it leaves two routes:
                  a shared ablution block serving several units, or a local installer fitting a
                  wet room into each one.
                </p>
                <p>
                  Expandable homes have a bathroom in every unit, so there is no ablution block
                  to build. Each unit then needs water, sewerage and power brought to it.
                </p>
                <p>
                  Our{" "}
                  <Link href="/blog/staff-accommodation-units-south-africa" className={linkClasses}>
                    staff accommodation guide
                  </Link>{" "}
                  works through the two routes in more detail.
                </p>
              </div>

              <div className="mt-9 rounded-3xl border border-border bg-cream p-7 sm:p-8">
                <h3 className="font-display text-2xl text-ink">
                  Cost per bed, not cost per unit
                </h3>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-stone">
                  Example at the published prices: {EXAMPLE_WORD} X-Folds come to{" "}
                  <span className="nums-tabular font-medium text-ink">
                    {formatZAR(EXAMPLE_UNITS * xFold.startingPrice)}
                  </span>{" "}
                  ex VAT for the units alone, and {EXAMPLE_WORD} compact expandable homes to{" "}
                  <span className="nums-tabular font-medium text-ink">
                    {formatZAR(EXAMPLE_UNITS * compactPrice)}
                  </span>{" "}
                  ex VAT.
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                  Then add transport, a base for each unit, the connections and, for X-Folds,
                  the ablutions, and divide the total by the number of people you house. A
                  cheaper unit that still needs plumbing added can cost more per bed than a
                  dearer one that comes with it, and neither price tag tells you that on its
                  own.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <figure>
                <Image
                  src={xFoldShell.src}
                  alt={xFoldShell.alt}
                  width={xFoldShell.width}
                  height={xFoldShell.height}
                  sizes="(min-width: 1024px) 36rem, 100vw"
                  className="w-full rounded-3xl object-cover"
                />
                <figcaption className="mt-3 text-sm leading-relaxed text-stone">
                  An X-Fold as it arrives: wired, with a small DB board, and no plumbing.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------- by sector */}
      <section aria-labelledby="staff-sectors" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="staff-sectors"
            eyebrow="By operation"
            title="Which suits your operation"
            intro="The same two units, matched to the work they are bought for."
          />
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3" as="ul">
            {sectors.map((sector) => (
              <StaggerItem key={sector.title} as="li" className="flex">
                <div className="flex w-full flex-col rounded-3xl border border-border bg-parchment p-6 sm:p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-cream">
                    <sector.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-xl text-ink">{sector.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">{sector.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ------------------------------------------- multi-unit order */}
      <section aria-labelledby="staff-order" className="bg-parchment py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="staff-order"
            eyebrow="A multi-unit order"
            title="What ordering several units involves"
            intro="From the first email to staff moving in, in the order it happens."
          />

          <ol className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-2">
            {[
              {
                h: "Tell us the job",
                // The four questions of BUSINESS_QUESTIONS, in its order.
                p: (
                  <>
                    <Link href={BUSINESS_ENQUIRY_HREF} className={linkClasses}>
                      Email us
                    </Link>{" "}
                    your company name, what the units will be used for, where they will go and
                    how many you&rsquo;re looking at, with the range if you know it. Give us the
                    full number even if you want them in phases. We come back with a formal
                    quotation, with the delivery quoted for the whole order.
                  </>
                ),
              },
              {
                h: "Get the site ready",
                p: "Every unit needs its own level concrete slab or properly levelled precast plinths. A truck has to reach the spot. X-Folds arrive flat and are offloaded by crane or forklift, which we arrange and quote with the delivery. Expandable homes arrive as a module and need a truck close by.",
              },
              {
                h: "Bring the services",
                p: "X-Folds need power to their small DB board. Expandable homes need water, sewerage and power to their factory-installed plumbing and electrics. The connections are not in the unit price, and connecting the wiring needs a certificate of compliance from a registered electrician.",
              },
              {
                h: "Delivery and setup",
                p: `Allow around ${site.leadTimeDays} days from deposit to move-in, and take delivery in phases if that suits the job. For X-Folds, our team unfolds and sets up each unit on your prepared base. The 6m (37 m²) and 12m (74 m²) expandable homes expand on site within hours, and the compact 18 m² is placed and connected; installing the expandable homes is quoted separately.`,
              },
            ].map((step, i) => (
              <li key={step.h} className="flex gap-5 rounded-3xl border border-border bg-cream p-6 sm:p-7">
                <span
                  aria-hidden="true"
                  className="nums-tabular flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest font-display text-lg text-cream"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl text-ink">{step.h}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">{step.p}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <Reveal>
              <div className="h-full rounded-3xl border border-border bg-cream p-6 sm:p-7">
                <h3 className="font-display text-xl text-ink">Rather hand it over?</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                  Ask whether our turnkey service covers your area and your units. Where it
                  does, we can arrange the groundwork, plinths, connections and installation,
                  or you can use your own contractors.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="h-full rounded-3xl border border-border bg-cream p-6 sm:p-7">
                <h3 className="font-display text-xl text-ink">Ask the municipality first</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                  Even temporary staff accommodation can be a land-use and building question,
                  and housing workers on your own land carries obligations to take up with
                  your own legal adviser. Our{" "}
                  <Link href="/blog/building-approval-south-africa-what-you-need" className={linkClasses}>
                    building approval guide
                  </Link>{" "}
                  sets out what to ask.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-3xl border border-border bg-cream p-6 sm:p-7">
                <h3 className="font-display text-xl text-ink">Guarantee and finance</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                  A {site.guarantee}, with after-sales support.{" "}
                  {site.finance}.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- FAQs */}
      <section aria-labelledby="staff-faq" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="staff-faq"
            eyebrow="Staff accommodation, answered"
            title="Frequently asked questions"
          />
          <Reveal className="mt-10 lg:mt-14" delay={0.1}>
            <Accordion items={[...staffFaqs]} />
          </Reveal>

          <Reveal delay={0.12} className="mt-12">
            <h3 className="font-display text-2xl text-ink">Guides for business buyers</h3>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {guides.map((post) => (
                <li key={post.slug} className="flex">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex w-full flex-col rounded-3xl border border-border bg-parchment p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-soft)]"
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
      <section
        aria-labelledby="staff-cta"
        className="bg-forest bg-grain py-24 text-cream sm:py-32"
      >
        <Container className="text-center">
          <Reveal>
            <p className="text-eyebrow text-sage">Business enquiries</p>
            <h2
              id="staff-cta"
              className="text-display mx-auto mt-4 max-w-3xl text-4xl sm:text-6xl"
            >
              How many people, and where?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
              Tell us how many people you need to house and where, and we&rsquo;ll price the
              units and the delivery together in a formal quotation.
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
            <p className="mx-auto mt-8 max-w-xl text-[0.9375rem] leading-relaxed text-cream/70">
              Rather see our homes in person first? They&rsquo;re on site at our showroom in{" "}
              {site.showroom.locality}, {site.showroom.city}: walk in any weekday between 09:00
              and 16:00, no appointment needed.{" "}
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
