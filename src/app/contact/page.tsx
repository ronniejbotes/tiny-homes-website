import type { Metadata } from "next";
import { ArrowRight, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { ContactCards } from "@/components/contact/contact-cards";
import { ShowroomMap } from "@/components/contact/showroom-map";
import { JsonLd, webPageSchema, breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import images from "@/data/images.json";

const pageDescription =
  "Call 083 660 3743 or WhatsApp Tiny Homes SA in Centurion, Gauteng for quotes on prefab tiny homes, delivered nationwide across South Africa in ±90 days. Visit our Centurion showroom.";

export const metadata: Metadata = {
  title: { absolute: "Contact Tiny Homes SA | Get a Prefab Home Quote" },
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
              Call or WhatsApp us and we&apos;ll help you choose the right home, price your
              configuration and plan delivery anywhere in South Africa, typically within 90 days
              of deposit. If you would rather put your details down in writing, the quote builder
              takes them and prices your unit on screen at the same time.
            </p>
          </Reveal>

          {/*
            The enquiry form that used to sit here has been removed.
            It asked for the same details as the quote builder but gave nothing
            back: it opened WhatsApp with a pre-filled message and left the
            visitor waiting on a reply. /quote collects the same information and
            returns a priced, itemised quotation on screen and by email, so
            everyone who wants to type rather than phone is better served there.
          */}
          <div className="mt-12 grid gap-12 sm:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <Reveal>
                <h2 className="text-display mb-6 text-2xl text-ink sm:text-3xl">Talk to us</h2>
              </Reveal>
              <ContactCards />
            </div>

            <div>
              <Reveal>
                <h2 className="text-display mb-4 text-2xl text-ink sm:text-3xl">
                  Rather write it down?
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="rounded-3xl border border-border bg-parchment p-6 sm:p-8">
                  <p className="text-lg leading-relaxed text-stone">
                    Build your quote online instead. Pick your home, size and extras, add your
                    details once, and your quotation appears on screen with every extra itemised
                    and VAT included. A copy lands in your inbox moments later, and we follow up
                    with a delivery price for your address.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-[0.9375rem] leading-relaxed text-stone">
                    {[
                      "A real price on screen, not a callback promise",
                      "Every extra listed line by line",
                      "Delivery quoted separately, at cost, with no markup",
                    ].map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <ButtonLink href="/quote" variant="accent" size="lg">
                      Build your quote
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </ButtonLink>
                    <ButtonAnchor
                      href={`tel:${site.phone.replace(/\s/g, "")}`}
                      variant="outline"
                      size="lg"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {site.phoneDisplay}
                    </ButtonAnchor>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-stone">
                    Prefer email? Write to{" "}
                    <a
                      href={`mailto:${site.email}`}
                      className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
                    >
                      {site.email}
                    </a>{" "}
                    and a real person will answer.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      <ShowroomMap />
    </>
  );
}
