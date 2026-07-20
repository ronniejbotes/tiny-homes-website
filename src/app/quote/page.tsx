import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { QuoteForm } from "@/components/quote/quote-form";
import { JsonLd, webPageSchema, breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import images from "@/data/images.json";

const pageDescription =
  "Build your prefab tiny home, pick your size and extras for an instant estimate, then send it for a formal quote with delivery anywhere in South Africa.";

export const metadata: Metadata = {
  title: "Get an Instant Quote Now",
  description: pageDescription,
  alternates: { canonical: "/quote" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.name,
    title: "Get an Instant Quote Now | Tiny Homes SA",
    description: pageDescription,
    url: `${site.url}/quote`,
    images: [
      {
        url: `${site.url}${images.products["expandable-homes"][0].src}`,
        width: images.products["expandable-homes"][0].width,
        height: images.products["expandable-homes"][0].height,
        alt: images.products["expandable-homes"][0].alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get an Instant Quote Now | Tiny Homes SA",
    description: pageDescription,
    images: [`${site.url}${images.products["expandable-homes"][0].src}`],
  },
};

export default function QuotePage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema("WebPage", {
            name: "Get an Instant Quote Now",
            description: pageDescription,
            path: "/quote",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Get a Quote", path: "/quote" },
          ]),
        ]}
      />

      <section className="pb-20 pt-28 sm:pb-28 sm:pt-36" aria-labelledby="quote-heading">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-eyebrow mb-4 text-clay">Instant quote</p>
            <h1 id="quote-heading" className="text-display text-5xl text-ink sm:text-6xl lg:text-7xl">
              Get an instant quote now
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-stone">
              Choose your home, size and extras to see an estimated price straight away, then send us
              your details and delivery address. We&apos;ll come back with a formal quotation —
              including delivery to your site — typically within 90 days of deposit. All prices
              exclude VAT.
            </p>
          </Reveal>

          <div className="mt-14 sm:mt-16">
            <QuoteForm />
          </div>
        </Container>
      </section>
    </>
  );
}
