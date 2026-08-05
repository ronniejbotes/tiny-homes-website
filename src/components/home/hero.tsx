"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";

/* Hand-supplied brand hero (2560px) rather than a manifest product photo, a
   full-bleed hero upscales anything smaller into visible blur, and this frame is
   art-directed for the slot. Lives in /brand, not /products, so it stays out of
   the Apple Cabin product gallery. */
const heroImage = {
  src: "/images/brand/hero-apple-cabin.jpg",
  alt: "Apple Cabin with full-height glazing glowing at dusk on a timber deck, beside a plunge pool and sunken firepit lounge above a mountain lake.",
};
/* Price-on-request products carry a 0 sentinel, exclude them from the range.
   Garages are a DIY steel-kit line, not a home; keep their R139 900 entry price
   out of the "tiny homes from …" headline so it stays the cheapest actual home. */
const lowestStartingPrice = Math.min(
  ...products
    .filter((p) => !p.priceOnRequest && p.slug !== "garages")
    .map((p) => p.startingPrice),
);

/* CSS-only staggered entrance (animate-rise-in in globals.css) so the headline,
   copy and CTAs are visible before JavaScript hydrates. The two headline lines
   carry their own delays for a multi-line reveal. */
const rise = (delay: number): CSSProperties =>
  ({ "--rise-delay": `${delay}s` }) as CSSProperties;

export function Hero() {
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
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </motion.div>

      {/* Layered scrim (radial lift behind the copy + bottom-up gradient) and grain */}
      <div className="hero-scrim absolute inset-0" aria-hidden="true" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-28 pt-40 sm:px-8 sm:pb-32 lg:px-12">
        <p className="text-eyebrow animate-rise-in text-sage" style={rise(0.12)}>
          Prefab &amp; modular housing · South Africa
        </p>
        {/* Fluid rather than stepped: the longest line ("Modular tiny homes")
            runs ~8.7em, so a fixed ramp overflowed the viewport on phones and
            again in the 640–700px band just after the sm step. clamp() tracks
            the container instead of the breakpoints, and tops out at the 6rem
            the lg step used to set. */}
        <h1 className="text-display mt-5 max-w-4xl text-[clamp(1.75rem,9.2vw,6rem)] leading-[0.95] text-cream">
          <span className="animate-rise-in block" style={rise(0.24)}>
            Modular tiny homes
          </span>
          <span className="animate-rise-in block" style={rise(0.36)}>
            for South Africa
          </span>
        </h1>
        <p
          className="animate-rise-in mt-6 max-w-xl text-lg leading-relaxed text-cream/85 sm:text-xl"
          style={rise(0.48)}
        >
          High-end prefab tiny homes from{" "}
          <span className="nums-tabular">{formatZAR(lowestStartingPrice)}</span> ex VAT, designed
          for affordable, sustainable living and delivered anywhere in South Africa in around
          90 days.
        </p>
        <div
          className="animate-rise-in mt-9 flex flex-wrap items-center gap-4"
          style={rise(0.6)}
        >
          <ButtonLink href="/quote" variant="accent" size="lg">
            Get an instant quote
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="#homes" variant="outline-dark" size="lg">
            Explore our homes
          </ButtonLink>
        </div>
        {/* A link rather than a third button: the viewing CTA belongs above the
            fold, but not competing with the two decisions already there. */}
        <p
          className="animate-rise-in mt-6 text-[0.9375rem] text-cream/75"
          style={rise(0.72)}
        >
          Rather see one first?{" "}
          <Link
            href="/book-a-viewing"
            className="font-medium text-cream underline decoration-cream/40 underline-offset-4 transition-colors hover:decoration-cream"
          >
            Book a viewing at our Centurion showroom
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
