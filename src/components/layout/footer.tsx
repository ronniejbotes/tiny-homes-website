import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { nav, site } from "@/lib/site";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-forest text-cream">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2 lg:max-w-sm">
            <p className="font-display text-2xl font-semibold tracking-tight">
              Tiny Homes <span className="text-sage">SA</span>
            </p>
            <p className="mt-4 leading-relaxed text-cream/70">
              High-end prefab tiny homes for an affordable, sustainable way of living —
              designed, built and delivered across South Africa from Centurion, Gauteng.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tiny Homes SA on Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-cream/60 hover:bg-cream/10"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tiny Homes SA on Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-cream/60 hover:bg-cream/10"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <nav aria-label="Our homes">
            <p className="text-eyebrow text-sage">Our Tiny Solutions</p>
            <ul className="mt-5 space-y-3">
              {nav.products.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className="text-cream/80 transition-colors hover:text-cream"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-eyebrow text-sage">Get in Touch</p>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="flex items-start gap-3 text-cream/80 transition-colors hover:text-cream"
                >
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-start gap-3 text-cream/80 transition-colors hover:text-cream"
                >
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-cream/80">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
                {site.address.locality}, {site.address.city},<br />
                {site.address.country}
              </li>
            </ul>
            <div className="mt-6 space-y-3">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center rounded-full bg-clay px-6 text-[0.9375rem] font-medium text-cream transition-colors hover:bg-clay-dark"
              >
                Request a Call
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream/15 pt-8 text-sm text-cream/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All prices exclude VAT.
          </p>
          <p>
            <Link href="/about" className="transition-colors hover:text-cream">
              About
            </Link>
            <span className="mx-3">·</span>
            <Link href="/contact" className="transition-colors hover:text-cream">
              Contact
            </Link>
            <span className="mx-3">·</span>
            <Link href="/terms" className="transition-colors hover:text-cream">
              Terms
            </Link>
          </p>
        </div>

        <p className="mt-6 max-w-4xl text-xs leading-relaxed text-cream/45">
          All prices exclude VAT and are quoted as delivered in Durban — transport to your site
          is quoted separately. Prices are for the product only and exclude earthworks or the
          provision of services, which are quoted separately. Site preparation and access are the
          customer&apos;s responsibility. Prices can change without notice.{" "}
          <Link href="/terms" className="underline underline-offset-2 transition-colors hover:text-cream">
            T&apos;s and C&apos;s apply
          </Link>
          . E&amp;OE.
        </p>
      </div>
    </footer>
  );
}
