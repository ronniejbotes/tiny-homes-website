"use client";

import { useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import manifest from "@/data/images.json";

const p = manifest.products;
const g = manifest.gallery;

/* Curated photo strip; fixed widths/heights so the marquee never shifts layout.
   Each entry carries a sizes string matching its rendered card width. */
const shots = [
  {
    image: p["folding-homes"][0],
    width: "w-[22rem] sm:w-[26rem]",
    sizes: "(min-width: 640px) 416px, 352px",
  },
  { image: g[3], width: "w-52 sm:w-60", sizes: "(min-width: 640px) 240px, 208px" }, // portrait bathroom
  { image: p["the-dome"][0], width: "w-72 sm:w-80", sizes: "(min-width: 640px) 320px, 288px" },
  {
    image: p["apple-cabins"][1],
    width: "w-[22rem] sm:w-[26rem]",
    sizes: "(min-width: 640px) 416px, 352px",
  },
  { image: p["nature-cabins"][1], width: "w-72 sm:w-80", sizes: "(min-width: 640px) 320px, 288px" },
  {
    image: p["glamping-capsules"][1],
    width: "w-72 sm:w-80",
    sizes: "(min-width: 640px) 320px, 288px",
  },
  {
    image: p["expandable-homes"][4],
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

  return (
    <section aria-label="Photo gallery" className="overflow-hidden py-24 sm:py-28">
      <div className={cn("flex w-max animate-marquee", paused && "marquee-paused")}>
        <Row />
        {/* Duplicate row makes the -50% marquee loop seamless. */}
        <Row hidden />
      </div>
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
