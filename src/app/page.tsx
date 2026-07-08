import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { StatsStrip } from "@/components/home/stats-strip";
import { HomesShowcase } from "@/components/home/homes-showcase";
import { CustomiseTeaser } from "@/components/home/customise-teaser";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyTinyLiving } from "@/components/home/why-tiny-living";
import { GalleryStrip } from "@/components/home/gallery-strip";
import { homeFaqs } from "@/components/home/home-faqs";
import { Accordion } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import images from "@/data/images.json";

/* Same manifest image the visible hero uses (hero.tsx). */
const heroImage = images.products["nature-cabins"][0];

const lowestStartingPrice = Math.min(...products.map((p) => p.startingPrice));

const homeTitle = "Tiny Homes SA | Prefab Tiny Homes & Cabins South Africa";
const homeDescription =
  "Prefab tiny homes from R54 950 ex VAT. Folding homes, cabins, domes and glamping capsules built in Centurion, delivered across South Africa in ±90 days.";

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

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Tiny Homes SA product range",
  itemListElement: products.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.name,
    url: `${site.url}/${p.slug}`,
    item: {
      "@type": "Product",
      name: p.name,
      description: p.summary,
      url: `${site.url}/${p.slug}`,
      offers: {
        "@type": "Offer",
        price: p.startingPrice,
        priceCurrency: "ZAR",
        availability: "https://schema.org/InStock",
      },
    },
  })),
};

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
      <HomesShowcase />
      <CustomiseTeaser />
      <HowItWorks />
      <WhyTinyLiving />
      <GalleryStrip />

      <section aria-labelledby="faq-heading" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="faq-heading"
            eyebrow="Questions, answered"
            title="Frequently asked questions"
            intro="The practical details — delivery, timelines, foundations and pricing — answered straight."
          />
          <Reveal className="mt-10 lg:mt-14" delay={0.1}>
            <Accordion items={[...homeFaqs]} />
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="cta-heading" className="bg-forest bg-grain py-24 text-cream sm:py-32">
        <Container className="text-center">
          <Reveal>
            <p className="text-eyebrow text-sage">From {formatZAR(lowestStartingPrice)} ex VAT</p>
            <h2
              id="cta-heading"
              className="text-display mx-auto mt-4 max-w-3xl text-4xl sm:text-6xl lg:text-7xl"
            >
              Your tiny home starts here.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
              Tell us where you want to live smaller — we&apos;ll handle the design, the build
              and the delivery, anywhere in South Africa.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/contact" variant="accent" size="lg">
                Request a call
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
