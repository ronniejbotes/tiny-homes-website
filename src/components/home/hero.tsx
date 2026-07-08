"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import manifest from "@/data/images.json";

const heroImage = manifest.products["nature-cabins"][0];
const lowestStartingPrice = Math.min(...products.map((p) => p.startingPrice));

/* CSS-only staggered entrance (animate-rise-in in globals.css) so the headline,
   copy and CTAs are visible before JavaScript hydrates. */
const rise = (delay: number): CSSProperties =>
  ({ "--rise-delay": `${delay}s` }) as CSSProperties;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Subtle parallax: the image drifts slower than the page as the hero scrolls out.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section
      ref={ref}
      aria-label="Introduction"
      className="relative flex min-h-svh items-end overflow-hidden bg-forest"
    >
      {/* Parallax image (bleeds vertically so the drift never exposes edges) */}
      <motion.div
        className="absolute inset-x-0 -top-[10%] -bottom-[10%] will-change-transform"
        style={{ y: reduce ? 0 : y }}
      >
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Scrim for text legibility */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/30 to-ink/10"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-28 pt-40 sm:px-8 sm:pb-32 lg:px-12">
        <p className="text-eyebrow animate-rise-in text-sage" style={rise(0.15)}>
          Prefab tiny homes · South Africa
        </p>
        <h1
          className="text-display animate-rise-in mt-5 max-w-4xl text-5xl text-cream sm:text-7xl lg:text-8xl"
          style={rise(0.27)}
        >
          Live large.
          <br />
          Build tiny.
        </h1>
        <p
          className="animate-rise-in mt-6 max-w-xl text-lg leading-relaxed text-cream/85 sm:text-xl"
          style={rise(0.39)}
        >
          High-end prefab tiny homes from {formatZAR(lowestStartingPrice)} ex VAT — designed
          for affordable, sustainable living and delivered anywhere in South Africa in around
          90 days.
        </p>
        <div
          className="animate-rise-in mt-9 flex flex-wrap items-center gap-4"
          style={rise(0.51)}
        >
          <ButtonLink href="#homes" variant="accent" size="lg">
            Explore our homes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline-dark" size="lg">
            Get a quote
          </ButtonLink>
        </div>
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
