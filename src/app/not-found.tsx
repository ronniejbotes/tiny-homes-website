import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { nav, site } from "@/lib/site";

/**
 * Metadata is read from the root `not-found` module: the app loader mounts it as
 * the `page` of the `/_not-found` route, and metadata is collected from `page`
 * modules. `robots` is overridden because the root layout declares index:true,
 * without this a 404 would still advertise "index, follow" alongside the
 * `noindex` Next injects for 404 responses. follow:true is deliberate: we want
 * crawlers to keep walking the links below and rediscover the new URLs.
 */
export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "That page has moved during our website relaunch. Browse our tiny homes, cabins and glamping capsules, or talk to the Tiny Homes SA team.",
  robots: { index: false, follow: true },
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/* /quote and /terms sit outside the header nav, but they're the destinations a
   lost visitor most often wants after the products themselves. */
const otherLinks = [
  { href: "/quote", label: "Build a quote" },
  ...nav.pages,
  { href: "/terms", label: "Terms & Conditions" },
] as const;

const whatsappHref = `${site.whatsapp}?text=${encodeURIComponent(
  "Hi Tiny Homes SA! I followed a link that no longer works. Can you help me find what I'm looking for?",
)}`;

export default function NotFound() {
  return (
    <div className="pb-20 pt-28 sm:pb-28 sm:pt-36">
      <Container className="max-w-3xl">
        <p className="text-eyebrow text-clay">Error 404: page not found</p>
        <h1 className="text-display mt-4 text-4xl text-ink sm:text-5xl">
          This page has moved home
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-stone">
          We&apos;ve just relaunched the Tiny Homes SA website, so a handful of older links
          no longer point where they used to. Nothing has gone missing: every home, price
          and spec is still here, just at a tidier address. Pick your home below, or let us
          take you straight to it.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <ButtonLink href="/" variant="primary" size="lg">
            Back to the homepage
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonAnchor
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
          >
            <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
            Chat on WhatsApp
          </ButtonAnchor>
          <ButtonAnchor
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            variant="outline"
            size="lg"
          >
            <Phone className="h-4 w-4 text-clay" aria-hidden="true" />
            {site.phoneDisplay}
          </ButtonAnchor>
        </div>

        <section aria-labelledby="not-found-products" className="mt-16 border-t border-border pt-10">
          <h2 id="not-found-products" className="text-display text-2xl text-ink sm:text-3xl">
            Our Tiny Solutions
          </h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {nav.products.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${p.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-parchment/60 px-4 py-3.5 font-medium text-ink transition-colors duration-200 hover:border-clay/50 hover:bg-parchment"
                >
                  {p.label}
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-clay transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="not-found-elsewhere" className="mt-12 border-t border-border pt-10">
          <h2 id="not-found-elsewhere" className="text-display text-2xl text-ink sm:text-3xl">
            Or head somewhere else
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {otherLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex h-11 items-center rounded-full border border-ink/20 px-5 text-[0.9375rem] font-medium text-ink transition-colors duration-200 hover:border-ink hover:bg-ink/5"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 leading-relaxed text-stone">
            Still can&apos;t find it? Call{" "}
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
            >
              {site.phoneDisplay}
            </a>{" "}
            or{" "}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
            >
              message us on WhatsApp
            </a>
            . Tell us what you were looking at and we&apos;ll send you the new link.
          </p>
        </section>
      </Container>
    </div>
  );
}
