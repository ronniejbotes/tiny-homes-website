import type { Metadata } from "next";
import { CalendarCheck, Eye, HandCoins, MapPin, Phone, Ruler, Tent } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ButtonAnchor } from "@/components/ui/button";
import { ViewingBooker } from "@/components/viewing/viewing-booker";
import { ShowroomMap } from "@/components/contact/showroom-map";
import { JsonLd, webPageSchema, breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import {
  FRIDAY_CLOSE_LABEL,
  FRIDAY_SLOT_TIMES_LABEL,
  HOURS_LABEL,
  SLOT_TIMES_LABEL,
} from "@/lib/viewing";
import images from "@/data/images.json";

const pageTitle = "Book a Showroom Viewing | Tiny Homes SA, Centurion";
const pageDescription =
  "See a tiny home in person before you spend a cent. Book a free one-hour viewing at our Centurion showroom, weekdays from 09:00. Confirmed instantly.";

const ogImage = images.products["expandable-homes"][0];

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: "/book-a-viewing" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.name,
    title: pageTitle,
    description: pageDescription,
    url: `${site.url}/book-a-viewing`,
    images: [
      {
        url: `${site.url}${ogImage.src}`,
        width: ogImage.width,
        height: ogImage.height,
        alt: ogImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [`${site.url}${ogImage.src}`],
  },
};

/** What actually happens when someone drives out, in the order it happens. */
const whatToExpect = [
  {
    icon: Eye,
    title: "Walk through a real one",
    body: "Not a render. Stand inside, open the cupboards, look at the joins and the finishes up close.",
  },
  {
    icon: Ruler,
    title: "Measure anything you like",
    body: "Bring a tape. Check the ceiling height, the door widths, whether your bed actually fits.",
  },
  {
    icon: HandCoins,
    title: "Get real numbers",
    body: "Prices, lead times and what delivery to your address would cost. Written down, not promised.",
  },
  {
    icon: CalendarCheck,
    title: "Leave without buying anything",
    body: "There is no deposit to view and nobody will chase you afterwards. Come and look.",
  },
];

export default function BookAViewingPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema("WebPage", {
            name: pageTitle,
            description: pageDescription,
            path: "/book-a-viewing",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Book a viewing", path: "/book-a-viewing" },
          ]),
        ]}
      />

      <section className="pb-16 pt-28 sm:pb-20 sm:pt-36" aria-labelledby="viewing-heading">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-eyebrow mb-4 text-clay">Book a viewing</p>
            <h1
              id="viewing-heading"
              className="text-display text-5xl text-ink sm:text-6xl lg:text-7xl"
            >
              Come and see one for yourself
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-stone">
              Buying a home off the internet takes a certain amount of faith, and you shouldn&apos;t
              have to take ours on trust. Our units are standing in Centurion. Pick a one-hour
              slot below, drive out, and decide once you&apos;ve stood inside one.
            </p>
            {/* Deliberately does not promise instant confirmation. Whether a
                slot is confirmed on the spot or comes back to the visitor
                depends on the diary being connected, and only the booker below
                knows that — so it makes that promise, and this does not. */}
            <p className="mt-4 text-lg leading-relaxed text-stone">
              Viewings are free and there&apos;s no obligation. Pick the time that suits you and
              we&apos;ll have someone ready to show you around.
            </p>

            {/* The homes are at the showroom; the safari tents are not. Said
                here, before anyone picks a slot, because someone who came for
                a tent would otherwise book a showroom viewing, drive out to
                Centurion and find nothing they came to see. */}
            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-clay/30 bg-parchment/70 p-5 sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-cream">
                <Tent className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-[0.9375rem] leading-relaxed text-stone">
                <span className="block font-medium text-ink">
                  Come for the homes, not the safari tents
                </span>
                <span className="mt-1 block">
                  There is no safari tent standing at the showroom, so a viewing booked here
                  won&apos;t show you one. Safari tents are supplied to businesses and hospitality
                  operators only and can&apos;t be ordered through the site. To see them, email{" "}
                  <a
                    href={`mailto:${site.safariTentsEmail}`}
                    className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
                  >
                    {site.safariTentsEmail}
                  </a>{" "}
                  and we&apos;ll arrange a time to take you to view the tents.
                </span>
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-10 sm:mt-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
            {/* min-w-0: a grid item defaults to min-width:auto, which would let
                the booker's scrolling day row widen the whole column. */}
            <Reveal className="min-w-0">
              <ViewingBooker />
            </Reveal>

            <div>
              <Reveal delay={0.08}>
                <h2 className="text-display text-2xl text-ink sm:text-3xl">
                  What happens when you get here
                </h2>
              </Reveal>
              <ul className="mt-6 space-y-5">
                {whatToExpect.map((item, index) => (
                  <Reveal key={item.title} delay={0.12 + index * 0.06}>
                    <li className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-cream">
                        <item.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-medium text-ink">{item.title}</span>
                        <span className="mt-1 block text-[0.9375rem] leading-relaxed text-stone">
                          {item.body}
                        </span>
                      </span>
                    </li>
                  </Reveal>
                ))}
              </ul>

              <Reveal delay={0.4}>
                <div className="mt-8 rounded-2xl border border-border bg-parchment/60 p-5 sm:p-6">
                  <p className="text-eyebrow text-clay">Where and when</p>
                  <p className="mt-3 flex items-start gap-3 text-ink">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-clay" aria-hidden="true" />
                    <span>
                      {/* The showroom, not site.address: that is the head office
                          and is not where a viewing happens. */}
                      <span className="block font-medium">{site.showroom.name}</span>
                      <span className="block text-sm text-stone">
                        {site.showroom.city}, {site.showroom.region}
                      </span>
                    </span>
                  </p>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-stone">
                    {HOURS_LABEL}, with viewings starting at {SLOT_TIMES_LABEL}.{" "}
                    {FRIDAY_SLOT_TIMES_LABEL
                      ? `On a Friday it's ${FRIDAY_SLOT_TIMES_LABEL} only${
                          FRIDAY_CLOSE_LABEL ? `, as we shut at ${FRIDAY_CLOSE_LABEL}` : ""
                        }. `
                      : ""}
                    Weekends and public holidays aren&apos;t something we can do at the moment.
                  </p>
                  <div className="mt-5">
                    <ButtonAnchor href={`tel:${site.phone.replace(/\s/g, "")}`} variant="outline">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {site.phoneDisplay}
                    </ButtonAnchor>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      <ShowroomMap showBooking={false} />
    </>
  );
}
