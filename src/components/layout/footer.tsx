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

// lucide-react ships no brand marks, so the social glyphs are inlined like the two above.
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.08-.14 1.62.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
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
              High-end prefab tiny homes for an affordable, sustainable way of living,
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
              <a
                href={site.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tiny Homes SA on TikTok"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-cream/60 hover:bg-cream/10"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <nav aria-label="Our homes">
            <p className="text-eyebrow text-sage">Our Tiny Solutions</p>
            {/* min-h-11 (44px) on the anchor itself, not the row: these were
                20px-tall targets, which is a miss on a phone. The list gap
                shrinks to compensate so the block keeps its height. */}
            <ul className="mt-3 space-y-0">
              {nav.products.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className="inline-flex min-h-11 items-center text-cream/80 transition-colors hover:text-cream"
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
                  className="flex min-h-11 items-center gap-3 text-cream/80 transition-colors hover:text-cream"
                >
                  <Phone className="h-5 w-5 shrink-0 text-sage" />
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex min-h-11 items-center gap-3 text-cream/80 transition-colors hover:text-cream"
                >
                  <Mail className="h-5 w-5 shrink-0 text-sage" />
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
            <Link href="/about" className="inline-flex min-h-11 items-center transition-colors hover:text-cream">
              About
            </Link>
            <span className="mx-3">·</span>
            <Link href="/contact" className="inline-flex min-h-11 items-center transition-colors hover:text-cream">
              Contact
            </Link>
            <span className="mx-3">·</span>
            <Link href="/privacy" className="inline-flex min-h-11 items-center transition-colors hover:text-cream">
              Privacy Policy
            </Link>
            <span className="mx-3">·</span>
            <Link href="/terms" className="inline-flex min-h-11 items-center transition-colors hover:text-cream">
              Terms
            </Link>
          </p>
        </div>

        <p className="mt-6 max-w-4xl text-xs leading-relaxed text-cream/45">
          All prices exclude VAT and are quoted as delivered in Durban; transport to your site
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
