"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import type { GalleryShot } from "./gallery-shots";

function Row({ shots, hidden = false }: { shots: GalleryShot[]; hidden?: boolean }) {
  return (
    <div className="flex gap-5 pr-5 sm:gap-6 sm:pr-6" aria-hidden={hidden || undefined}>
      {shots.map(({ image, width, sizes }) => (
        <div
          key={image.src}
          className={cn("relative h-64 shrink-0 overflow-hidden rounded-3xl bg-sand sm:h-80", width)}
        >
          {/* The duplicated marquee row carries the same alt text as the first.
              It is inside an aria-hidden subtree, so assistive tech skips it
              either way and nothing is announced twice, but leaving the alt
              empty made a third of the page's images look untagged to crawlers
              and cost them their place in image search. */}
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

/* shots comes from page.tsx (gallery-shots.ts): importing images.json here put
   the whole image manifest in the browser's JavaScript for seven photos. */
export function GalleryStrip({ shots }: { shots: GalleryShot[] }) {
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
          <Row shots={shots} />
          {/* Duplicate row makes the -50% marquee loop seamless. */}
          <Row shots={shots} hidden />
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
