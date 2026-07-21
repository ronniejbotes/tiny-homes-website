"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import manifest from "@/data/images.json";

type ManifestImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: string;
  hero: boolean;
};

const productImages = manifest.products as Record<string, ManifestImage[]>;

/** The designated hero shot for a product, falling back to its first photo. */
function heroPhoto(slug: string): ManifestImage {
  const images = productImages[slug];
  return images.find((img) => img.hero) ?? images[0];
}

/** Look up a real photo by a filename fragment — explicit and immune to
    reordering, unlike indexing into the manifest array by position. */
function photoNamed(slug: string, filenameContains: string): ManifestImage {
  const images = productImages[slug];
  const match = images.find((img) => img.src.includes(filenameContains));
  if (!match) throw new Error(`gallery-strip: no image matching "${filenameContains}" in ${slug}`);
  return match;
}

/* Curated photo strip; fixed widths/heights so the marquee never shifts layout.
   Each entry carries a sizes string matching its rendered card width. Every
   image is a real product photo — looked up by filename/hero flag, not by
   array index, so the manifest can be reordered without breaking this row. */
const shots = [
  {
    image: heroPhoto("folding-homes"),
    width: "w-[22rem] sm:w-[26rem]",
    sizes: "(min-width: 640px) 416px, 352px",
  },
  {
    image: photoNamed("apple-cabins", "interior-bathroom"),
    width: "w-52 sm:w-60",
    sizes: "(min-width: 640px) 240px, 208px",
  },
  { image: heroPhoto("the-dome"), width: "w-72 sm:w-80", sizes: "(min-width: 640px) 320px, 288px" },
  {
    image: heroPhoto("apple-cabins"),
    width: "w-[22rem] sm:w-[26rem]",
    sizes: "(min-width: 640px) 416px, 352px",
  },
  {
    image: photoNamed("nature-cabins", "exterior-two-cabins"),
    width: "w-72 sm:w-80",
    sizes: "(min-width: 640px) 320px, 288px",
  },
  {
    /* The hero, not exterior-balcony-deck — that shot carries a baked-in
       watermark and a legible third-party badge on the pod itself. */
    image: heroPhoto("glamping-capsules"),
    width: "w-72 sm:w-80",
    sizes: "(min-width: 640px) 320px, 288px",
  },
  {
    image: photoNamed("expandable-homes", "interior-living-dining"),
    width: "w-[22rem] sm:w-[26rem]",
    sizes: "(min-width: 640px) 416px, 352px",
  },
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex gap-5 pr-5 sm:gap-6 sm:pr-6" aria-hidden={hidden || undefined}>
      {shots.map(({ image, width, sizes }) => (
        <div
          key={image.src}
          className={cn("relative h-64 shrink-0 overflow-hidden rounded-3xl bg-sand sm:h-80", width)}
        >
          <Image
            src={image.src}
            alt={hidden ? "" : image.alt}
            fill
            sizes={sizes}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function GalleryStrip() {
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  /* Gentle vertical parallax: the whole marquee drifts a touch against the
     page scroll for depth. It rides on a wrapper element, leaving the marquee's
     own translateX animation untouched. Transform-only; off for reduced motion. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [36, -36]);

  return (
    <section ref={ref} aria-label="Photo gallery" className="overflow-hidden py-24 sm:py-32">
      <motion.div style={reduce ? undefined : { y }} className="will-change-transform">
        <div className={cn("flex w-max animate-marquee", paused && "marquee-paused")}>
          <Row />
          {/* Duplicate row makes the -50% marquee loop seamless. */}
          <Row hidden />
        </div>
      </motion.div>
      {/* WCAG 2.2.2: visible mechanism to pause the auto-scrolling gallery. */}
      <button
        type="button"
        onClick={() => setPaused((v) => !v)}
        aria-pressed={paused}
        aria-label="Pause gallery animation"
        className="mx-auto mt-8 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-ink hover:bg-ink/5"
      >
        {paused ? (
          <Play className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Pause className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </section>
  );
}
