import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { site } from "@/lib/site";
import images from "@/data/images.json";

const termsDescription =
  "Tiny Homes SA terms and conditions — pricing, delivery and site access, site preparation responsibilities and what's included with every unit.";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: termsDescription,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.name,
    title: "Terms & Conditions | Tiny Homes SA",
    description: termsDescription,
    url: `${site.url}/terms`,
    images: [
      {
        url: images.products["nature-cabins"][0].src,
        width: images.products["nature-cabins"][0].width,
        height: images.products["nature-cabins"][0].height,
        alt: images.products["nature-cabins"][0].alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | Tiny Homes SA",
    description: termsDescription,
    images: [images.products["nature-cabins"][0].src],
  },
};

/** One numbered term section. */
function Term({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`term-${n}`} className="border-t border-border pt-10">
      <div className="flex items-baseline gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-parchment text-sm font-semibold text-clay-dark">
          {n}
        </span>
        <h2 id={`term-${n}`} className="text-display text-2xl text-ink sm:text-3xl">
          {title}
        </h2>
      </div>
      <div className="mt-5 space-y-4 leading-relaxed text-stone sm:pl-12">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="py-20 sm:py-28">
      <Container className="max-w-3xl">
        <p className="text-eyebrow text-clay">The fine print, kept fair</p>
        <h1 className="text-display mt-4 text-4xl text-ink sm:text-5xl">Terms &amp; Conditions</h1>
        <p className="mt-6 text-lg leading-relaxed text-stone">
          The practical terms that apply to every Tiny Homes SA order — what we do, what we ask
          you to have ready, and how delivery works. If anything here is unclear,{" "}
          <Link
            href="/contact"
            className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
          >
            talk to us before you order
          </Link>
          .
        </p>

        <div className="mt-14 space-y-12">
          <Term n={1} title="Pricing">
            <p>
              All prices exclude VAT and are quoted as delivered in Durban — transport to your
              site is quoted separately based on location and accessibility. Prices are for the
              product only and exclude earthworks and the provision of services, which are quoted
              separately. Prices can change without notice. E&amp;OE.
            </p>
          </Term>

          <Term n={2} title="Site preparation — your responsibility">
            <p>
              Preparing the site ahead of delivery is the customer&apos;s responsibility. Before
              your unit arrives, you need to make sure that:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                the ground is level and suitable for the unit — a level concrete slab or properly
                levelled precast plinths, sized to the home;
              </li>
              <li>
                plumbing connections (water supply and sewage) are in place and ready to connect
                where the unit will stand;
              </li>
              <li>electrical supply is available and ready to connect at the site.</li>
            </ul>
            <p>
              Tiny Homes SA does not carry out groundwork, plumbing or electrical supply work as
              part of a standard delivery. If you&apos;d rather not manage this yourself, our
              turnkey team can quote separately for site preparation — but unless a turnkey
              installation has been agreed in writing, site readiness is entirely up to you.
            </p>
          </Term>

          <Term n={3} title="Delivery, access & offloading">
            <p>
              We deliver nationwide. It is the customer&apos;s responsibility to confirm — before
              ordering — that the delivery vehicle and offloading equipment can physically reach
              the desired position on your property.
            </p>
            <p>
              If the unit cannot be placed at the desired location because of access constraints
              (narrow gates, overhead obstructions, soft or steep terrain, or anything else that
              prevents safe placement), the delivery team will offload the unit as close to the
              desired location as is safely possible, or at the most convenient accessible point.
              From that point on, any further moving or placing of the unit is the customer&apos;s
              responsibility and cost. <strong className="font-semibold text-ink">Tiny Homes SA
              is not responsible or liable for units that cannot be placed at the desired
              location due to site access.</strong>
            </p>
          </Term>

          <Term n={4} title="What's included with delivery">
            <p>
              A standard delivery covers transporting the unit to your site and offloading it as
              described above. For the X-Fold, our team will also unfold and set up the unit on
              your prepared, level surface.
            </p>
            <p>
              For all other units, on-site assembly or installation is quoted separately as part
              of your quotation. Connection of water, sewage and electricity to the unit is the
              customer&apos;s responsibility unless a turnkey installation has been agreed in
              writing.
            </p>
          </Term>

          <Term n={5} title="Questions">
            <p>
              Unsure whether your site is ready, or whether a truck can reach your spot? Send us
              photos before you order — call{" "}
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
              >
                {site.phoneDisplay}
              </a>{" "}
              or email{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
              >
                {site.email}
              </a>
              . We&apos;d rather solve access on the phone than on your driveway.
            </p>
          </Term>
        </div>
      </Container>
    </div>
  );
}
