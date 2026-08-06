import { ArrowRight, ExternalLink, MapPin } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { site, showroomDirectionsUrl, showroomMapEmbedUrl } from "@/lib/site";

/**
 * Where the showroom actually is.
 *
 * Loaded lazily and given a fixed aspect box: the iframe pulls roughly half a
 * megabyte of Google's own JavaScript, which has no business competing with
 * the page for bandwidth before a visitor has scrolled to it. Reserving the
 * box also keeps it from shifting layout when it does arrive.
 */
/**
 * @param showBooking Suppressed on /book-a-viewing itself, where a button
 *   pointing at the page you are already on is just noise.
 */
export function ShowroomMap({ showBooking = true }: { showBooking?: boolean } = {}) {
  return (
    <section aria-labelledby="showroom-heading" className="pb-20 sm:pb-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal>
          <p className="text-eyebrow mb-4 text-clay">Showroom</p>
          <h2 id="showroom-heading" className="text-display text-3xl text-ink sm:text-4xl">
            Come and walk through one
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone">
            Photographs only go so far. Our units are on site in Centurion, so you can stand
            inside one, check the finishes and get a feel for the space before you commit.
            {showBooking
              ? " Book a slot and we'll have someone free to show you around."
              : " Pick a time above and we'll have someone free to show you around."}
          </p>
          {showBooking && (
            <div className="mt-6">
              <ButtonLink href="/book-a-viewing" variant="accent" size="lg">
                Book a viewing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="overflow-hidden rounded-3xl border border-border bg-parchment">
            <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
              <p className="flex items-start gap-3 text-ink">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-clay" aria-hidden="true" />
                <span>
                  <span className="block font-medium">{site.address.streetAddress}</span>
                  <span className="block text-sm text-stone">
                    {site.address.locality}, {site.address.city}, {site.address.region}
                  </span>
                  {/* The pin itself, as a link someone can save or send on to
                      whoever is doing the driving. */}
                  <a
                    href={site.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
                  >
                    Open the pin in Google Maps
                  </a>
                </span>
              </p>
              <a
                href={showroomDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-cream px-4 text-sm font-medium text-ink transition-colors hover:border-clay/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/30"
              >
                Get directions
                <ExternalLink className="h-4 w-4 text-clay" aria-hidden="true" />
              </a>
            </div>

            <div className="relative aspect-[16/10] w-full border-t border-border sm:aspect-[21/9]">
              <iframe
                src={showroomMapEmbedUrl}
                title={`Map showing the ${site.name} showroom at ${site.address.streetAddress}, ${site.address.city}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
