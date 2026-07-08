import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Check, Leaf, MapPin, Shield, Timer, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import images from "@/data/images.json";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Tiny Homes SA builds high-end prefab tiny homes in Centurion and delivers nationwide — six steel-built designs from R54 950 ex VAT, about 90 days to move-in.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Tiny Homes SA",
    description:
      "High-end prefab tiny homes built in Centurion, delivered across South Africa. Six designs from R54 950 ex VAT, around 90 days from deposit to move-in.",
    url: "/about",
    images: [
      {
        url: images.products["nature-cabins"][0].src,
        width: images.products["nature-cabins"][0].width,
        height: images.products["nature-cabins"][0].height,
        alt: images.products["nature-cabins"][0].alt,
      },
    ],
  },
};

const heroImage = images.gallery[1]; // installation-collage.png
const factoryImage = images.gallery[0]; // tiny-homes-gallery-1.jpg
const bathroomImage = images.gallery[3]; // interior-bathroom.jpg
const bandImage = images.products["nature-cabins"][0]; // exterior-timber-render.jpg

const minPrice = Math.min(...products.map((p) => p.startingPrice));
const maxPrice = Math.max(...products.map((p) => p.startingPrice));

const values = [
  {
    icon: Shield,
    title: "Quality in steel",
    body: "Every home in the range is built around a steel structure with insulated, fireproof wall panels — factory-precision construction made for South African conditions.",
  },
  {
    icon: Check,
    title: "Honest pricing",
    body: `Every price we publish is ex VAT, from the ${formatZAR(minPrice)} folding home to the ${formatZAR(maxPrice)} glamping capsule — and delivery is quoted upfront.`,
  },
  {
    icon: Timer,
    title: "Speed, without shortcuts",
    body: "About 90 days from deposit to move-in. On-site setup takes from 30 minutes for a folding home to two or three days for our largest capsules.",
  },
  {
    icon: Leaf,
    title: "Sustainability that works",
    body: "Solar-ready roofs, battery storage, gas geysers and rainwater tanks keep our homes running through load-shedding — or entirely off the grid.",
  },
];

const processSteps = [
  {
    title: "Discuss",
    body: "We talk through your site, your budget and what the home needs to do — garden office, guest suite, lodge accommodation or full-time living.",
  },
  {
    title: "Design",
    body: "Pick your model and layout, then configure finishes and modules — flooring, insulation, wet room, kitchen — to suit how you'll live in it.",
  },
  {
    title: "Quote",
    body: "You receive an itemised quote, priced ex VAT, with delivery estimated for your exact location.",
  },
  {
    title: "Build",
    body: "Your home is built under factory conditions in steel and insulated panelling — precise, weather-independent and quality-checked before it ships.",
  },
  {
    title: "Deliver & install",
    body: "We truck the finished home anywhere in South Africa and set it up on site — from 30 minutes to a few days, depending on the model.",
  },
];

const stats = [
  { value: "6", label: "home designs, one range" },
  { value: formatZAR(minPrice), label: "entry price, ex VAT" },
  { value: "±90 days", label: "from deposit to move-in" },
  { value: "Nationwide", label: "delivery from Centurion" },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema("AboutPage", {
            name: "About Tiny Homes SA",
            description:
              "The story and process behind Tiny Homes SA — high-end prefab tiny homes built in Centurion and delivered across South Africa.",
            path: "/about",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="pt-28 sm:pt-36" aria-labelledby="about-heading">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <Reveal>
              <p className="text-eyebrow mb-4 text-clay">About Tiny Homes SA</p>
              <h1 id="about-heading" className="text-display text-5xl text-ink sm:text-6xl lg:text-7xl">
                Rethinking how South Africa builds homes
              </h1>
              <div className="mt-7 max-w-xl space-y-5 text-lg leading-relaxed text-stone">
                <p>
                  Tiny Homes SA supplies high-end prefab tiny homes from our base in Raslouw,
                  Centurion — folding homes, expandable homes, nature cabins, domes, apple
                  cabins and glamping capsules, delivered anywhere in South Africa.
                </p>
                <p>
                  Conventional building takes too long, costs too much and leaves too much to
                  chance. Our answer is precision factory building: steel-framed, insulated
                  homes finished indoors, trucked to your site and standing in anything from
                  30 minutes to a few days. From deposit to move-in takes around 90 days.
                </p>
                <p>
                  The range spans six homes, from the {formatZAR(minPrice)} X-Fold folding home
                  to the {formatZAR(maxPrice)} flagship glamping capsule — every price
                  published ex VAT, with most models ready to run off-grid through
                  load-shedding on solar, battery and rainwater options.
                </p>
              </div>
            </Reveal>
            {/* LCP image: rendered statically (no Reveal) so the preloaded
                hero can paint before hydration. */}
            <div className="relative">
              <Image
                src={heroImage.src}
                width={heroImage.width}
                height={heroImage.height}
                alt={heroImage.alt}
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="w-full rounded-3xl object-cover shadow-[var(--shadow-lifted)]"
              />
            </div>
          </div>

          {/* Facts strip */}
          <Stagger className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-y border-border py-10 lg:grid-cols-4">
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <p className="text-display text-3xl text-forest sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm text-stone">{stat.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Mission */}
      <section className="mt-24 bg-forest py-24 text-cream sm:mt-32 sm:py-32" aria-labelledby="mission-heading">
        <Container>
          <Reveal className="mx-auto max-w-4xl text-center">
            <h2 id="mission-heading" className="text-eyebrow text-sage">
              Our mission
            </h2>
            <blockquote className="mt-8">
              <p className="text-display text-3xl leading-tight sm:text-5xl">
                &ldquo;A well-built home shouldn&rsquo;t take years to deliver or a lifetime
                to pay off.&rdquo;
              </p>
            </blockquote>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-cream/75">
              We use precision factory building to make high-end, sustainable living
              attainable for more South Africans — on farms, in gardens, at lodges and
              everywhere in between.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Values */}
      <section className="py-24 sm:py-32" aria-label="What we value">
        <Container>
          <SectionHeading
            eyebrow="What we value"
            title="Four commitments behind every home"
          />
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2">
            {values.map((value) => (
              <StaggerItem
                key={value.title}
                className="rounded-3xl border border-border bg-parchment p-7 sm:p-8"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-forest">
                  <value.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-2xl text-ink">{value.title}</h3>
                <p className="mt-3 leading-relaxed text-stone">{value.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Process timeline */}
      <section className="bg-parchment py-24 sm:py-32" aria-label="Our process">
        <Container>
          <SectionHeading
            eyebrow="The process"
            title="Deposit to move-in, in about 90 days"
            intro="The same five steps sit behind every build — from the first conversation to handover day."
            align="center"
          />
          <ol className="relative mx-auto mt-16 max-w-2xl list-none">
            <span
              className="absolute bottom-5 left-5 top-5 w-px bg-border"
              aria-hidden="true"
            />
            {processSteps.map((step, index) => (
              <Reveal
                as="li"
                key={step.title}
                className="relative pb-12 pl-16 last:pb-0"
                delay={index * 0.04}
              >
                <span
                  className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-semibold text-cream"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="pt-1.5 font-display text-2xl text-ink">{step.title}</h3>
                <p className="mt-2.5 leading-relaxed text-stone">{step.body}</p>
              </Reveal>
            ))}
          </ol>

          <div className="mx-auto mt-16 grid max-w-4xl gap-5 md:grid-cols-2">
            <Reveal>
              <Image
                src={factoryImage.src}
                width={factoryImage.width}
                height={factoryImage.height}
                alt={factoryImage.alt}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="h-full w-full rounded-3xl object-cover"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <Image
                src={bathroomImage.src}
                width={bathroomImage.width}
                height={bathroomImage.height}
                alt={bathroomImage.alt}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="max-h-96 w-full rounded-3xl object-cover md:max-h-full"
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Delivery */}
      <section className="bg-forest py-24 text-cream sm:py-32" aria-label="Nationwide delivery">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <SectionHeading
              dark
              eyebrow="Nationwide delivery"
              title="From Centurion to every corner of the country"
              intro="Every home leaves our base in Raslouw, Centurion, Gauteng on a flatbed truck. Delivery averages R 6 000 – R 22 000 per unit, depending on distance, current diesel rates and abnormal-load permits — estimated upfront with your quote."
            />
            <Stagger className="space-y-5">
              <StaggerItem className="flex items-start gap-4 rounded-2xl border border-cream/15 bg-forest-light/40 p-6">
                <MapPin className="mt-1 h-6 w-6 shrink-0 text-sage" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-xl">Based in Raslouw, Centurion</h3>
                  <p className="mt-1.5 leading-relaxed text-cream/70">
                    Built in Gauteng, at the centre of the national road network — well placed
                    to reach any province.
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem className="flex items-start gap-4 rounded-2xl border border-cream/15 bg-forest-light/40 p-6">
                <Truck className="mt-1 h-6 w-6 shrink-0 text-sage" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-xl">
                    Delivery from R 6 000 – R 22 000 per unit
                  </h3>
                  <p className="mt-1.5 leading-relaxed text-cream/70">
                    Coast, bushveld or mountains — if a truck and crane can reach it, we can
                    put a home on it.
                  </p>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </Container>
      </section>

      {/* Image band */}
      <section aria-label="Nature cabin on site" className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <Image
              src={bandImage.src}
              width={bandImage.width}
              height={bandImage.height}
              alt={bandImage.alt}
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="w-full rounded-3xl object-cover"
            />
          </Reveal>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-24 sm:pb-32" aria-label="Start your enquiry">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Next step"
            title="Ready to plan your build?"
            intro="Tell us about your site and budget — we'll get back to you with a quote."
          />
          <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/contact" variant="accent" size="lg">
              Start your enquiry
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/" variant="outline" size="lg">
              Explore the homes
            </ButtonLink>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
