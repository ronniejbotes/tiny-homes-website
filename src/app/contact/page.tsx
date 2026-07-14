import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ContactCards } from "@/components/contact/contact-cards";
import { LeadForm } from "@/components/contact/lead-form";
import { JsonLd, organizationSchema, webPageSchema, breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import images from "@/data/images.json";

const pageDescription =
  "Call 083 660 3743 or WhatsApp Tiny Homes SA in Centurion, Gauteng for quotes on prefab tiny homes — delivered nationwide across South Africa in ±90 days.";

export const metadata: Metadata = {
  title: "Contact Tiny Homes SA | Get a Prefab Home Quote",
  description: pageDescription,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.name,
    title: "Contact Tiny Homes SA",
    description: pageDescription,
    url: `${site.url}/contact`,
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
    title: "Contact Tiny Homes SA",
    description: pageDescription,
    images: [`${site.url}${images.products["expandable-homes"][0].src}`],
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema("ContactPage", {
            name: "Contact Tiny Homes SA",
            description: pageDescription,
            path: "/contact",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />

      <section className="pb-20 pt-28 sm:pb-28 sm:pt-36" aria-labelledby="contact-heading">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-eyebrow mb-4 text-clay">Contact</p>
            <h1
              id="contact-heading"
              className="text-display text-5xl text-ink sm:text-6xl lg:text-7xl"
            >
              Let&apos;s plan your tiny home
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-stone">
              Call, WhatsApp or send the form below — we&apos;ll help you choose the right home,
              price your configuration and plan delivery anywhere in South Africa, typically within
              90 days of deposit.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-12 sm:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <Reveal>
                <h2 className="text-display mb-6 text-2xl text-ink sm:text-3xl">Talk to us</h2>
              </Reveal>
              <ContactCards />
            </div>

            <div>
              <Reveal>
                <h2 className="text-display mb-6 text-2xl text-ink sm:text-3xl">
                  Send an enquiry
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <LeadForm />
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
