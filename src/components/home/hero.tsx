"use client";

import { useRef, type CSSProperties } from "react";
import { preload } from "react-dom";
import { getImageProps } from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatZAR } from "@/lib/format";
import { BUSINESS_ENQUIRY_HREF } from "@/lib/enquiry";

/* Hand-supplied brand hero (2560px) rather than a manifest product photo, a
   full-bleed hero upscales anything smaller into visible blur, and this frame is
   art-directed for the slot. Lives in /brand, not /products, so it stays out of
   the Apple Cabin product gallery. */
const heroImage = {
  src: "/images/brand/hero-apple-cabin.jpg",
  portraitSrc: "/images/brand/hero-apple-cabin-portrait.jpg",
  alt: "Apple Cabin with full-height glazing glowing at dusk on a timber deck, beside a plunge pool and sunken firepit lounge above a mountain lake.",
};

/* Art direction (SEOptimer audit 19 Nov 2026). On a portrait screen
   object-cover fills the box by height and shows only the centre columns of
   the photo, yet phones downloaded the whole 2560px original (w=3840, 186,996
   bytes AVIF, preloaded before first paint). On a 390x844 phone the box is
   390 x 1,047px and the photo is drawn 1,861px wide, so four fifths of those
   bytes never reached the screen. Portrait screens now get
   hero-apple-cabin-portrait.jpg: the centre 1152x1440 (4:5) of the same file,
   cut on the JPEG's 8px block grid and saved with its own quantisation
   tables. The pixels on screen are the same; only the download is smaller.

   Why a 4:5 crop under (max-aspect-ratio: 3/4): object-cover shows exactly
   the same region only while it still scales the crop by height, which needs
   the crop to be at least as wide, relative to its height, as the box. The
   box is the viewport's width by 1.24 hero heights, and the hero is at least
   100svh. When this query matches, the width is at most 3/4 of the height
   the query measures, so the box is at most 0.75 / (1.24 x svh/height) as
   wide as it is tall, and 4:5 (0.8) covers that until browser toolbars take
   24% of the screen. A 3:4 crop would only have covered 19%. Every other
   screen keeps the original file, URLs and sizes exactly as before. */
const PORTRAIT_MEDIA = "(max-aspect-ratio: 3/4)";
// The exact negation of PORTRAIT_MEDIA, so the two preloads never both match.
const LANDSCAPE_MEDIA = "not all and (max-aspect-ratio: 3/4)";
/* CSS-only staggered entrance (animate-rise-in in globals.css) so the headline,
   copy and CTAs are visible before JavaScript hydrates. The two headline lines
   carry their own delays for a multi-line reveal. */
const rise = (delay: number): CSSProperties =>
  ({ "--rise-delay": `${delay}s` }) as CSSProperties;

/* The prices and floor areas come from page.tsx: importing products.ts here put
   the whole catalogue in the browser's JavaScript for a few numbers. */
export function Hero({
  lowestStartingPrice,
  highestPrice,
  smallestArea,
  largestArea,
}: {
  lowestStartingPrice: number;
  highestPrice: number;
  smallestArea: number;
  largestArea: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Subtle parallax + slow zoom: the image drifts slower than the page and
  // scales up gently as the hero scrolls out. Transform-only, so it stays on
  // the compositor; disabled entirely for reduced-motion visitors.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  /* sizes, landscape file: on a portrait screen object-cover fills the box
     by height, so the photo is drawn much wider than the viewport. The box is
     124% of the hero's height (the -12% bleed top and bottom) and the hero is
     at least 100svh, so the drawn width is 124vh x 16/9, about 221vh: some
     1,860px on a 390x844 phone, where "100vw" fetched a 640px file and
     stretched it about three times (T-83). Portrait screens wider than 3:4
     (squarish windows, iPads in Safari) still use this file at 221vh;
     landscape screens keep 100vw, so the desktop download is unchanged. */
  const { props: landscape } = getImageProps({
    src: heroImage.src,
    alt: heroImage.alt,
    fill: true,
    sizes: "(orientation: portrait) 221vh, 100vw",
    loading: "eager",
    fetchPriority: "high",
    className: "object-cover",
  });
  /* sizes, portrait crop: drawn 1.24 x 0.8 = 0.99 hero heights wide, which
     measured 99vh on 390x844 and 103vh on 360x800, where the copy makes the
     hero a little taller than the screen. 110vh leaves room for narrower
     phones. At 2x and 3x every phone gets the whole 1152px crop anyway,
     because next/image never enlarges. */
  const { props: portrait } = getImageProps({
    src: heroImage.portraitSrc,
    alt: "",
    fill: true,
    sizes: "110vh",
  });
  /* Preload. next/image's `preload` knows only one srcset, so phones would
     have preloaded the landscape file and then fetched the crop as well. Two
     preloads instead, each carrying its <source>'s media, so every screen
     preloads exactly the file its <picture> picks. The <img> sits inside
     <picture>, so React adds no preload of its own for it. */
  preload(landscape.src, {
    as: "image",
    imageSrcSet: landscape.srcSet,
    imageSizes: landscape.sizes,
    media: LANDSCAPE_MEDIA,
    fetchPriority: "high",
  });
  preload(portrait.src, {
    as: "image",
    imageSrcSet: portrait.srcSet,
    imageSizes: portrait.sizes,
    media: PORTRAIT_MEDIA,
    fetchPriority: "high",
  });

  return (
    <section
      ref={ref}
      aria-label="Introduction"
      className="relative flex min-h-svh items-end overflow-hidden bg-forest"
    >
      {/* Parallax wrapper (bleeds vertically so the drift never exposes edges) */}
      <motion.div
        className="absolute inset-x-0 -top-[12%] -bottom-[12%] will-change-transform"
        style={reduce ? undefined : { y, scale }}
      >
        {/* Separate inner element hosts the on-load ken-burns settle, so its
            CSS scale and the scroll-driven transform above never collide. */}
        <div className="animate-hero-kenburns relative h-full w-full">
          {/* Portrait crop or landscape original; see the art-direction note
              at the top of this file and the sizes notes above. */}
          <picture>
            <source
              media={PORTRAIT_MEDIA}
              srcSet={portrait.srcSet}
              sizes={portrait.sizes}
            />
            <img {...landscape} alt={heroImage.alt} />
          </picture>
        </div>
      </motion.div>

      {/* Layered scrim (radial lift behind the copy + bottom-up gradient) and grain */}
      <div className="hero-scrim absolute inset-0" aria-hidden="true" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-28 pt-40 sm:px-8 sm:pb-32 lg:px-12">
        {/* A lighter tint of sage (#cbd9c5) with a soft dark halo: plain sage
            on the bright interior of the photo measured about 2:1. The halo
            darkens only the few pixels around each letter, so the photo and
            the scrim are untouched; median contrast is now about 5-6:1. */}
        <p
          className="text-eyebrow animate-rise-in text-[#cbd9c5] [text-shadow:0_0_3px_rgba(28,27,23,0.6),0_0_8px_rgba(28,27,23,0.6),0_0_16px_rgba(28,27,23,0.45)]"
          style={rise(0.12)}
        >
          <Link
            href="/blog/modular-homes-south-africa-explained"
            className="-my-3 inline-block py-3 underline decoration-sage/40 underline-offset-4 transition-colors hover:decoration-sage"
          >
            Prefab &amp; modular housing
          </Link>{" "}
          · South Africa
        </p>
        {/* Fluid rather than stepped: the longest line ("modular tiny homes")
            runs ~8.7em, so a fixed ramp overflowed the viewport on phones and
            again in the 640–700px band just after the sm step. clamp() tracks
            the container instead of the breakpoints, and tops out at the 6rem
            the lg step used to set. */}
        <h1 className="text-display mt-5 max-w-4xl text-[clamp(1.75rem,9.2vw,6rem)] leading-[0.95] text-cream">
          <span className="animate-rise-in block" style={rise(0.24)}>
            Prefab houses and
          </span>{" "}
          <span className="animate-rise-in block" style={rise(0.3)}>
            modular tiny homes
          </span>{" "}
          <span className="animate-rise-in block" style={rise(0.36)}>
            for South Africa
          </span>
        </h1>
        {/* W56 (15 Nov 2026): the first screen answers "prefab houses south
            africa" (989 impressions at 4.2) with the whole range, price and
            size, read from products.ts in page.tsx; "up to four bedrooms" is
            the 12m expandable's layouts (products.ts bedrooms "Open plan – 4
            bedrooms"). The link jumps to the price list (price-list.tsx). */}
        <p
          className="animate-rise-in mt-6 max-w-xl text-lg leading-relaxed text-cream/85 sm:text-xl"
          style={rise(0.48)}
        >
          Prefab houses from{" "}
          <span className="nums-tabular whitespace-nowrap">{formatZAR(lowestStartingPrice)}</span>{" "}
          to <span className="nums-tabular whitespace-nowrap">{formatZAR(highestPrice)}</span> ex
          VAT, {smallestArea} to <span className="whitespace-nowrap">{largestArea} m²</span> with
          up to four bedrooms, delivered anywhere in South Africa in around 90 days.{" "}
          <Link
            href="#prices"
            className="font-medium text-cream underline decoration-cream/40 underline-offset-4 transition-colors hover:decoration-cream"
          >
            See every price
          </Link>
        </p>
        {/* Business buyers lead (owner, 29 Oct 2026: "Our main target for tiny
            homes now is to deal with larger companies that will buy multiple
            units"). The instant quote stays beside it for anyone buying one
            for themselves. "Explore our homes" went to make room; the range
            starts directly below the stats strip. */}
        <div
          className="animate-rise-in mt-9 flex flex-wrap items-center gap-4"
          style={rise(0.6)}
        >
          <ButtonLink href={BUSINESS_ENQUIRY_HREF} variant="accent" size="lg">
            Business enquiry
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="/quote" variant="outline-dark" size="lg">
            Get an instant quote
          </ButtonLink>
        </div>
        {/* A link rather than a third button, where the showroom-viewing line
            used to be (viewings are walk-in now, see /contact#viewing). */}
        <p
          className="animate-rise-in mt-6 max-w-xl text-base text-cream/75"
          style={rise(0.72)}
        >
          Buying several units for staff, guests or a development?{" "}
          <Link
            href="#business"
            className="font-medium text-cream underline decoration-cream/40 underline-offset-4 transition-colors hover:decoration-cream"
          >
            See what suits a business
          </Link>
        </p>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        style={{ "--fade-delay": "1.4s" } as CSSProperties}
        className="animate-fade-in absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
      >
        <span className="h-10 w-px bg-cream/40" />
        <motion.span
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-cream/80"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </div>
    </section>
  );
}
