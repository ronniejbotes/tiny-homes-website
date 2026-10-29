import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { StatsStrip } from "@/components/home/stats-strip";
import { ForBusinesses } from "@/components/home/for-businesses";
import { HomesShowcase } from "@/components/home/homes-showcase";
import { CustomiseTeaser } from "@/components/home/customise-teaser";
import { HowItWorks } from "@/components/home/how-it-works";
import { DeliveryCoverage } from "@/components/home/delivery-coverage";
import { WhyTinyLiving } from "@/components/home/why-tiny-living";
import { GalleryStrip } from "@/components/home/gallery-strip";
import { VideoCarousel } from "@/components/home/video-carousel";
import { ShowroomInvite } from "@/components/home/showroom-invite";
import { homeFaqs } from "@/components/home/home-faqs";
import { Accordion } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { products } from "@/data/products";
import { productItemListSchema } from "@/lib/schema";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { BUSINESS_ENQUIRY_HREF } from "@/lib/enquiry";
import images from "@/data/images.json";

/* Same manifest image the visible hero uses (hero.tsx), the 2048px night-pool shot. */
const heroImage =
  images.products["glamping-capsules"].find((img) =>
    img.src.endsWith("exterior-night-pool.jpg"),
  ) ?? images.products["glamping-capsules"][0];

/* A price-on-request product would carry a 0 sentinel; never let it win the
   range. Garages are a DIY steel-kit line, not a home, excluded so the "From …" CTA
   under "Your tiny home starts here" names the cheapest actual home. */
const lowestStartingPrice = Math.min(
  ...products
    .filter((p) => !p.priceOnRequest && p.slug !== "garages")
    .map((p) => p.startingPrice),
);

const homeTitle = "Tiny Homes SA | Prefab Houses & Cabins South Africa";
/** Kept to 120–160 characters: Google truncates beyond that, and SEO auditors
 *  flag it. The provinces and cross-border detail live in the page copy and in
 *  the LocalBusiness areaServed schema, which is where they actually rank. */
const homeDescription =
  "Prefab tiny homes from R54 900 ex VAT: X-Folds, cabins, expandable homes and glamping capsules. Delivered nationwide, with a showroom in Centurion, Gauteng.";

export const metadata: Metadata = {
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "/",
    siteName: site.name,
    title: homeTitle,
    description: homeDescription,
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
    title: homeTitle,
    description: homeDescription,
    images: [{ url: heroImage.src, alt: heroImage.alt }],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/* The shared builder the /housing-pods hub uses: each product with its offer,
   brand and card photo. */
const itemListJsonLd = productItemListSchema("Tiny Homes SA product range", products);

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <Hero />
      <StatsStrip />
      <ForBusinesses />
      <HomesShowcase />
      <CustomiseTeaser />
      <HowItWorks />
      <WhyTinyLiving />
      <DeliveryCoverage />
      <GalleryStrip />
      <VideoCarousel />
      <ShowroomInvite />

      <section aria-labelledby="faq-heading" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            id="faq-heading"
            eyebrow="Questions, answered"
            title="Frequently asked questions"
            intro="The practical details: delivery, timelines, foundations and pricing, answered straight."
          />
          <Reveal className="mt-10 lg:mt-14" delay={0.1}>
            <Accordion items={[...homeFaqs]} />
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="cta-heading" className="bg-forest bg-grain py-28 text-cream sm:py-36">
        <Container className="text-center">
          <Reveal>
            <p className="text-eyebrow text-sage">
              From <span className="nums-tabular">{formatZAR(lowestStartingPrice)}</span> ex VAT
            </p>
            <h2
              id="cta-heading"
              className="text-display mx-auto mt-4 max-w-3xl text-4xl sm:text-6xl lg:text-7xl"
            >
              Your tiny home starts here.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
              Tell us where you want to live smaller, or how many units your business needs,
              and we&apos;ll handle the spec, the supply and the delivery, anywhere in South
              Africa.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {/* Business buyers first (owner, 29 Oct 2026); the instant quote
                  for anyone buying one for themselves. The "Book a viewing"
                  button that sat here went with the booker. */}
              <ButtonLink href={BUSINESS_ENQUIRY_HREF} variant="accent" size="lg">
                Business enquiry
              </ButtonLink>
              <ButtonLink href="/quote" variant="outline-dark" size="lg">
                Get an instant quote
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
