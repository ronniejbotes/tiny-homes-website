import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { QuoteForm } from "@/components/quote/quote-form";
import { JsonLd, webPageSchema, breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import images from "@/data/images.json";

const pageDescription =
  "Build your prefab tiny home, pick your size and extras, and get a full quote including VAT on screen and by email straight away. Road delivery to your site is quoted separately, at cost.";

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
          {/* Hidden on paper: when the issued quote is printed, the document's
              own letterhead is the header; a page title above it reads like a
              screenshot of a website, not a quotation. */}
          <Reveal className="max-w-3xl print:hidden">
            <p className="text-eyebrow mb-4 text-clay">Instant quote</p>
            <h1 id="quote-heading" className="text-display text-5xl text-ink sm:text-6xl lg:text-7xl">
              Get an instant quote now
            </h1>
          </Reveal>

          {/* The standfirst is handed to the form rather than rendered here, so
              it can step aside once a quote has been issued, because "choose your home,
              size and extras" reads as a stale instruction above a finished
              quotation. It is still server-rendered: passing JSX as a prop to a
              client component keeps it in the initial HTML. */}
          <QuoteForm
            intro={
              <Reveal className="max-w-3xl">
                <p className="mt-6 text-lg leading-relaxed text-stone">
                  Choose your home, size and extras, then add your details, and your quote appears on
                  screen straight away, with VAT included and every extra itemised, and a copy
                  lands in your inbox moments later.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-stone">
                  That price already includes shipping into South Africa. What it doesn&apos;t
                  include is road delivery to your site, because that depends on where you are, so
                  we price it separately and email that quote through to you. We pass it on at cost
                  with no markup, so you&apos;re welcome to arrange your own truck too.
                </p>
              </Reveal>
            }
          />
        </Container>
      </section>
    </>
  );
}
