import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { ButtonAnchor } from "@/components/ui/button";
import { site, showroomDirectionsUrl, showroomMapEmbedUrl } from "@/lib/site";
import { viewingMailto } from "@/lib/enquiry";
import { HOURS_LABEL } from "@/lib/hours";

/**
 * Where the showroom actually is, and how to view a unit there.
 *
 * `id="viewing"` is the target of every viewing link on the site, and of the
 * 301 from the old /book-a-viewing page. Viewings are walk-in since
 * 13 November 2026 (owner: "allow walk in visits from 9 am to 4 pm, no email
 * necessary"): Monday to Friday, 09:00 to 16:00, no appointment. That replaced
 * the 29 October rule that a viewing was asked for by email first. The email
 * stays, as an option, for anyone who wants someone to walk them round.
 *
 * The map and both directions links stay exactly as they were: the owner
 * wants people who find the showroom on Google Maps to land on the site.
 *
 * Loaded lazily and given a fixed aspect box: the iframe pulls roughly half a
 * megabyte of Google's own JavaScript, which has no business competing with
 * the page for bandwidth before a visitor has scrolled to it. Reserving the
 * box also keeps it from shifting layout when it does arrive.
 */
export function ShowroomMap() {
  return (
    <section
      id="viewing"
      aria-labelledby="showroom-heading"
      className="scroll-mt-24 pb-20 sm:pb-28"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal>
          <p className="text-eyebrow mb-4 text-clay">Viewings</p>
          <h2 id="showroom-heading" className="text-display text-3xl text-ink sm:text-4xl">
            Walk-in viewings at our showroom
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone">
            Come and stand inside the units at our showroom in {site.showroom.locality},{" "}
            {site.showroom.city}. Walk in any weekday between 09:00 and 16:00: there&apos;s
            no appointment to book and no need to email first.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone">
            Viewing times: {HOURS_LABEL}. Closed on weekends and public holidays. The
            showroom has no street address, so use the pin below to find it.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonAnchor
              href={showroomDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="accent"
              size="lg"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Get directions
            </ButtonAnchor>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone">
            Would you like someone to walk you round, or are you coming to look at units for a
            business? You can email us first if you&apos;d like, at{" "}
            <a
              href={viewingMailto}
              className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
            >
              {site.email}
            </a>
            , and we&apos;ll make sure the right person is there.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="overflow-hidden rounded-3xl border border-border bg-parchment">
            <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
              <p className="flex items-start gap-3 text-ink">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-clay" aria-hidden="true" />
                <span>
                  {/* The showroom has no street address, so the pin below is the
                      authoritative location. Sunderland Ridge is the owner's
                      own name for it (13 November 2026). */}
                  <span className="block font-medium">{site.showroom.name}</span>
                  <span className="block text-sm text-stone">
                    {site.showroom.locality}, {site.showroom.city}, {site.showroom.region}
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
                title={`Map showing the ${site.name} showroom in ${site.showroom.locality}, ${site.showroom.city}`}
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
