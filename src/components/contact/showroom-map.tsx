import { ExternalLink, Mail, MapPin } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { ButtonAnchor } from "@/components/ui/button";
import { site, showroomDirectionsUrl, showroomMapEmbedUrl } from "@/lib/site";
import { viewingMailto } from "@/lib/enquiry";
import { HOURS_LABEL } from "@/lib/hours";

/**
 * Where the showroom actually is, and how to view a unit there.
 *
 * `id="viewing"` is the target of every viewing link on the site, and of the
 * 301 from the old /book-a-viewing page. The online booker is gone: owner,
 * 29 October 2026, "If they want to view, they need to send an email and state
 * why they are interested, what it will be used for, where it will be and how
 * many potential units will be purchased." The opening sentence below is that
 * instruction in the site's voice, and the button opens an email carrying the
 * same four questions (src/lib/enquiry.ts).
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
            Viewing a unit at our showroom
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone">
            To view a unit, email us at{" "}
            <a
              href={`mailto:${site.email}`}
              className="font-medium text-clay-dark underline underline-offset-4 transition-colors hover:text-clay"
            >
              {site.email}
            </a>{" "}
            and tell us why you&apos;re interested, what the units will be used for, where they
            will go, and how many units you&apos;re looking at.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonAnchor href={viewingMailto} variant="accent" size="lg">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email to arrange a viewing
            </ButtonAnchor>
            <p className="text-base text-stone">Opens an email with these questions in it.</p>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone">
            Viewings are by email only. Showroom hours: {HOURS_LABEL}.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="overflow-hidden rounded-3xl border border-border bg-parchment">
            <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
              <p className="flex items-start gap-3 text-ink">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-clay" aria-hidden="true" />
                <span>
                  {/* Named, not addressed: the showroom has no street address,
                      so the pin below is the authoritative location.
                      "Sunderland Ridge" used to be asserted here, but
                      reverse-geocoding the pin returns Raslouw — a different
                      suburb. Neither is named until the owner confirms which. */}
                  <span className="block font-medium">{site.showroom.name}</span>
                  <span className="block text-sm text-stone">
                    {site.showroom.city}, {site.showroom.region}
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
                title={`Map showing the ${site.name} showroom in ${site.showroom.city}, ${site.showroom.region}`}
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
