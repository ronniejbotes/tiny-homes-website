import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Phone, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import {
  JsonLd,
  breadcrumbSchema,
  collectionPageSchema,
  faqPageSchema,
  productItemListSchema,
} from "@/lib/schema";
import { getHeroImage } from "@/components/product/product-images";
import { podRanges, podPriceFrom, podPriceTo } from "@/data/housing-pods";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { podFaqs } from "./faqs";

/**
 * /housing-pods — the hub page for the pod vocabulary.
 *
 * The range has always contained pods; the site has never had a page that
 * says so. "Housing pod for sale", "pod house price" and "living pod South
 * Africa" are the terms buyers here actually type, and each product page
 * targets its own catalogue name instead, which is a name nobody searches.
 * A search engine cannot rank a term that no page is about.
 *
 * This is a real page, not a doorway: it defines the word, says which of our
 * products genuinely are pods and which are not, prices them honestly against
 * each other, and answers the questions that actually block the purchase. The
 * cards link out to the product pages, so it strengthens them rather than
 * competing with them for the same queries.
 */

const heroImage = getHeroImage("apple-cabins");

const title = "Housing Pods for Sale in South Africa";
const description = `Housing pods for sale from ${formatZAR(podPriceFrom)} ex VAT: living pods, granny pods, resort pods and luxury glamping pods, delivered nationwide, with a showroom in Centurion.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "housing pod for sale",
    "housing pods South Africa",
    "pod house South Africa",
    "living pod South Africa",
    "pod home price",
    "granny pod South Africa",
    "glamping pods for sale South Africa",
    "prefab pod house",
    "modular pod home",
    "pods for sale South Africa",
  ],
  alternates: { canonical: "/housing-pods" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.name,
    title,
    description,
    url: "/housing-pods",
    ...(heroImage
      ? {
          images: [
            {
              url: heroImage.src,
              width: heroImage.width,
              height: heroImage.height,
              alt: heroImage.alt,
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    ...(heroImage ? { images: [heroImage.src] } : {}),
  },
};

/** What every pod on this page includes, and what none of them do. Both halves
 *  matter: the second is the one that stops a refund conversation later. */
const included = [
  "An insulated, weatherproof structure, finished inside",
  "Electrical installation, with lighting and plug points",
  `A ${site.guarantee}, with after-sales support`,
  "Delivery to your site on a truck, quoted on distance and access",
];

const notIncluded = [
  "Groundwork: a level slab or properly levelled precast plinths",
  "The connections themselves — municipal or borehole water, sewerage, and the tie-in to your DB board",
  "Council plan approval, where your municipality requires it",
  "VAT, and transport, which is quoted separately for your site",
];

export default function HousingPodsPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({
            name: `${title} | ${site.name}`,
            description,
            path: "/housing-pods",
          }),
          productItemListSchema(
            "Housing pods for sale in South Africa",
            podRanges.map((range) => range.product),
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Housing Pods", path: "/housing-pods" },
          ]),
          faqPageSchema(podFaqs),
        ]}
      />

      {/* ---------------------------------------------------------- hero */}
      <section className="relative isolate overflow-hidden bg-forest text-cream">
        {heroImage && (
          <>
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-forest/85 via-forest/70 to-forest"
            />
          </>
        )}
        <Container className="relative pt-36 pb-20 sm:pt-44 sm:pb-28">
          <Reveal className="max-w-3xl">
            <p className="text-eyebrow text-sage">
              From <span className="nums-tabular">{formatZAR(podPriceFrom)}</span> ex VAT
            </p>
            <h1 className="text-display mt-4 text-4xl sm:text-6xl lg:text-7xl">
              Housing pods for sale in South Africa
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/80 sm:text-xl">
              &ldquo;Pod&rdquo; covers a lot of ground — a R55 000 room at the bottom of the
              garden and a R1 million glass capsule on a game farm both get called one. We
              build five ranges that answer the search, from{" "}
              <span className="nums-tabular">{formatZAR(podPriceFrom)}</span> to{" "}
              <span className="nums-tabular">{formatZAR(podPriceTo)}</span> ex VAT. Below is
              which is which, what each one actually includes, and what it costs.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/quote" variant="accent" size="lg">
                Get an instant price
              </ButtonLink>
              <ButtonLink href="/book-a-viewing" variant="outline-dark" size="lg">
                See one in Centurion
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm text-cream/60">
              Delivered to all nine provinces. Showroom in Centurion, Gauteng.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ------------------------------------------------ what is a pod? */}
      <section aria-labelledby="what-is-a-pod" className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <Reveal>
              <p className="text-eyebrow mb-4 text-clay">The word</p>
              <h2 id="what-is-a-pod" className="text-display text-4xl text-ink sm:text-5xl">
                What is a housing pod?
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-stone">
                <p>
                  A housing pod is a small, self-contained living unit built in a factory and
                  delivered finished, rather than built up on your site brick by brick. It
                  arrives on a truck, it is craned or rolled into position on a prepared
                  base, and it is connected to water and power. That is the whole idea: the
                  building work happens somewhere else.
                </p>
                <p>
                  Beyond that, the word is doing no real work. South Africans use{" "}
                  <strong className="font-medium text-ink">pod</strong>,{" "}
                  <strong className="font-medium text-ink">living pod</strong>,{" "}
                  <strong className="font-medium text-ink">pod house</strong>,{" "}
                  <strong className="font-medium text-ink">granny pod</strong>,{" "}
                  <strong className="font-medium text-ink">capsule</strong> and{" "}
                  <strong className="font-medium text-ink">tiny home</strong> more or less
                  interchangeably, and manufacturers each pick the one that flatters what
                  they happen to make. So the useful question is not whether something is a
                  pod. It is what you are putting on the property, and what has to be true
                  the day it lands.
                </p>
                <p>
                  Practically, the pods on the market here split three ways: a{" "}
                  <em>bare insulated room</em> you fit out yourself, a{" "}
                  <em>self-contained dwelling</em> with its own bathroom and kitchen, and a{" "}
                  <em>finished guest unit</em> built to be let out from the day it arrives.
                  They are three different purchases at three very different prices, and
                  buying the wrong one is the most expensive mistake in this market.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-border bg-parchment p-7 sm:p-9">
                <h3 className="font-display text-2xl text-ink">
                  What every pod here includes
                </h3>
                <ul className="mt-5 space-y-3">
                  {included.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-stone">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <h3 className="mt-9 font-display text-2xl text-ink">
                  What it does not include
                </h3>
                <ul className="mt-5 space-y-3">
                  {notIncluded.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-stone">
                      <X className="mt-1 h-4 w-4 shrink-0 text-clay" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-7 text-sm leading-relaxed text-stone">
                  Ask about our turnkey service and we can arrange the groundwork,
                  connections and installation for you, or you can use your own contractors
                  with a Tiny Homes site manager guiding the process.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------- price compare */}
      <section aria-labelledby="pod-prices" className="bg-parchment py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="pod-prices"
            eyebrow="Prices, side by side"
            title="What a housing pod costs"
            intro="Every price below is ex VAT, for the unit delivered. Transport to your site is quoted separately on distance and access."
          />

          <Reveal delay={0.08} className="mt-10 lg:mt-14">
            {/* Wide table on a phone is a horizontal scroller rather than a
                squeezed one: the price column is the reason the table exists
                and it must never wrap to three lines. */}
            <div className="overflow-x-auto rounded-3xl border border-border bg-cream">
              <table className="w-full min-w-[46rem] border-collapse text-left">
                <caption className="sr-only">
                  Housing pod ranges compared by price, size and what they are best suited to
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      Range
                    </th>
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      In pod terms
                    </th>
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      Size
                    </th>
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      From (ex VAT)
                    </th>
                    <th scope="col" className="px-6 py-5 text-sm font-medium text-stone">
                      Best for
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {podRanges.map(({ product, podType, bestFor }) => (
                    <tr key={product.slug} className="align-top transition-colors hover:bg-sand/30">
                      <th scope="row" className="px-6 py-5 font-normal">
                        <Link
                          href={`/${product.slug}`}
                          className="font-display text-lg text-ink underline decoration-border underline-offset-4 transition-colors hover:text-clay"
                        >
                          {product.name}
                        </Link>
                      </th>
                      <td className="px-6 py-5 text-[0.9375rem] text-stone">{podType}</td>
                      <td className="px-6 py-5 text-[0.9375rem] text-stone">
                        {product.sizeLabel}
                      </td>
                      <td className="nums-tabular px-6 py-5 font-medium text-ink">
                        {formatZAR(product.startingPrice)}
                      </td>
                      <td className="px-6 py-5 text-[0.9375rem] text-stone">{bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-stone">
              Prices are for the product only and exclude VAT, earthworks and the provision
              of services. Larger sizes and extras carry their own prices — the{" "}
              <Link href="/quote" className="underline underline-offset-2 hover:text-ink">
                quote builder
              </Link>{" "}
              prices a specific configuration in a couple of minutes.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------- the ranges */}
      <section aria-labelledby="pod-ranges" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="pod-ranges"
            eyebrow="The five ranges"
            title="Which pod is which"
            intro="Two of these are pods in the shape you are probably picturing. The other three are not, and we would rather say so here than have you find out on delivery day."
          />

          <Stagger className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-2" as="ul">
            {podRanges.map(({ product, podType, podPitch, notAPod }) => {
              const image = getHeroImage(product.slug);
              return (
                <StaggerItem key={product.slug} as="li">
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-parchment">
                    {image && (
                      <Link href={`/${product.slug}`} className="relative block aspect-[16/9]">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="(min-width: 1024px) 40rem, 100vw"
                          className="object-cover"
                        />
                      </Link>
                    )}
                    <div className="flex flex-1 flex-col p-7 sm:p-8">
                      <p className="text-eyebrow text-clay">{podType}</p>
                      <h3 className="mt-3 font-display text-2xl text-ink sm:text-3xl">
                        <Link
                          href={`/${product.slug}`}
                          className="transition-colors hover:text-clay"
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <p className="nums-tabular mt-2 text-lg font-medium text-ink">
                        From {formatZAR(product.startingPrice)} ex VAT
                        <span className="ml-3 text-sm font-normal text-stone">
                          {product.sizeLabel}
                        </span>
                      </p>
                      <p className="mt-4 text-[0.9375rem] leading-relaxed text-stone">
                        {podPitch}
                      </p>
                      {notAPod && (
                        <p className="mt-4 rounded-2xl border border-border bg-cream px-5 py-4 text-sm leading-relaxed text-stone">
                          <span className="font-medium text-ink">Straight answer: </span>
                          {notAPod}
                        </p>
                      )}
                      <Link
                        href={`/${product.slug}`}
                        className="mt-auto inline-flex items-center gap-2 pt-6 font-medium text-clay transition-colors hover:text-clay-dark"
                      >
                        See the {product.shortName.toLowerCase()} in full
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </section>

      {/* --------------------------------------------------- how to buy */}
      <section aria-labelledby="pod-buying" className="bg-parchment py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="pod-buying"
            eyebrow="Before you buy"
            title="Four things worth checking first"
            intro="The questions that decide whether a pod works on your property — and the ones that cost money if you leave them until after the deposit."
          />
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14" as="ul">
            {[
              {
                h: "Can a truck reach the spot?",
                p: "A pod is delivered whole. Every one of these ranges except the X-Fold arrives as a finished unit that has to be lifted or rolled into its final position, so the route in — gate width, overhead cables, slope, soft ground — decides as much as the plot itself. Send us photos of the access and we will tell you before you order, not after.",
              },
              {
                h: "What is the base standing on?",
                p: "Most units sit on a level concrete slab or properly levelled precast plinths, and the larger cabins and capsules are professionally assembled on a prepared foundation. Getting this wrong is the one site error that is genuinely difficult to fix afterwards. We confirm the exact requirement for your model when you order.",
              },
              {
                h: "Where are the services coming from?",
                p: "A pod is only self-contained once water, sewerage and power reach it. Some ranges arrive with plumbing installed at the factory and some — the X-Fold — carry electrics only. Off-grid is a real option across the range: solar, gas geysers and rainwater tanks are sized and quoted for your site.",
              },
              {
                h: "Does your municipality want plans?",
                p: "Approval rules for a second structure are set locally and genuinely differ between municipalities, so the only reliable answer comes from your own building control department. Ask them before you commit — it is a free phone call, and it is the answer everything else depends on.",
              },
            ].map((item) => (
              <StaggerItem key={item.h} as="li">
                <div className="h-full rounded-3xl border border-border bg-cream p-7">
                  <h3 className="font-display text-xl text-ink">{item.h}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">{item.p}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.15} className="mt-10">
            <p className="text-[0.9375rem] leading-relaxed text-stone">
              We have written this up in more detail:{" "}
              <Link
                href="/blog/where-can-you-put-a-housing-pod"
                className="font-medium text-clay underline underline-offset-4 hover:text-clay-dark"
              >
                where you can put a housing pod
              </Link>
              , and{" "}
              <Link
                href="/blog/housing-pod-vs-container-home-vs-wendy-house"
                className="font-medium text-clay underline underline-offset-4 hover:text-clay-dark"
              >
                how a pod compares to a container home or a wendy house
              </Link>
              .
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------------- FAQs */}
      <section aria-labelledby="pod-faq" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="pod-faq"
            eyebrow="Housing pods, answered"
            title="Frequently asked questions"
          />
          <Reveal className="mt-10 lg:mt-14" delay={0.1}>
            <Accordion items={[...podFaqs]} />
          </Reveal>
        </Container>
      </section>

      {/* ----------------------------------------------------------- CTA */}
      <section
        aria-labelledby="pod-cta"
        className="bg-forest bg-grain py-24 text-cream sm:py-32"
      >
        <Container className="text-center">
          <Reveal>
            <p className="text-eyebrow text-sage">
              Pods from <span className="nums-tabular">{formatZAR(podPriceFrom)}</span> ex VAT
            </p>
            <h2
              id="pod-cta"
              className="text-display mx-auto mt-4 max-w-3xl text-4xl sm:text-6xl"
            >
              Come and stand inside one.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
              Photographs of pods all look the same. Fifteen minutes in one tells you
              whether the size works for you. The units are on site at our showroom in{" "}
              {site.showroom.city}, and viewing is free with no obligation to buy.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/book-a-viewing" variant="accent" size="lg">
                Book a free viewing
              </ButtonLink>
              <ButtonLink href="/quote" variant="outline-dark" size="lg">
                Price one online
              </ButtonLink>
              <ButtonAnchor
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                variant="outline-dark"
                size="lg"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> {site.phoneDisplay}
              </ButtonAnchor>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
