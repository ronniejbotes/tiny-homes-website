"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

type Clip = {
  id: string;
  src: string;
  poster: string;
  width: number;
  height: number;
  /** Generic description for screen readers — not tied to a specific product page. */
  label: string;
};

/* Ambient b-roll, not tied to any single product — a rolling look at real
   builds in the field. Every clip is a real Tiny Homes SA video. */
const clips: Clip[] = [
  {
    id: "folding-home-setup",
    src: "/videos/folding-home-setup.mp4",
    poster: "/videos/folding-home-setup-poster.jpg",
    width: 256,
    height: 480,
    label: "Product video: an X-Fold being lifted into place on site",
  },
  {
    id: "expandable-home-unfold",
    src: "/videos/expandable-home-unfold.mp4",
    poster: "/videos/expandable-home-unfold-poster.jpg",
    width: 405,
    height: 720,
    label: "Product video: inside an expandable home's living space",
  },
  {
    id: "expandable-home-exterior",
    src: "/videos/expandable-home-exterior.mp4",
    poster: "/videos/expandable-home-exterior-poster.jpg",
    width: 360,
    height: 640,
    label: "Product video: a walkthrough of an expandable home",
  },
  {
    id: "nature-cabin-exterior",
    src: "/videos/nature-cabin-exterior.mp4",
    poster: "/videos/nature-cabin-exterior-poster.jpg",
    width: 360,
    height: 640,
    label: "Product video: a walkthrough of a nature cabin",
  },
  {
    id: "nature-cabin-interior",
    src: "/videos/nature-cabin-interior.mp4",
    poster: "/videos/nature-cabin-interior-poster.jpg",
    width: 360,
    height: 640,
    label: "Product video: bathroom detail inside a nature cabin",
  },
  {
    id: "glamping-capsule-tour",
    src: "/videos/glamping-capsule-tour.mp4",
    poster: "/videos/glamping-capsule-tour-poster.jpg",
    width: 360,
    height: 640,
    label: "Product video: a glamping capsule's interior and view",
  },
  {
    id: "glamping-capsule-exterior",
    src: "/videos/glamping-capsule-exterior.mp4",
    poster: "/videos/glamping-capsule-exterior-poster.jpg",
    width: 480,
    height: 848,
    label: "Product video: exterior detail on a glamping capsule",
  },
  {
    id: "safari-tent-lodge",
    src: "/videos/safari-tent-lodge.mp4",
    poster: "/videos/safari-tent-lodge-poster.jpg",
    width: 640,
    height: 272,
    label: "Product video: a safari tented lodge at sunset",
  },
];

/** One portrait video tile. Plays only while in view; a per-tile control
    lets a visitor stop it regardless (WCAG 2.2.2 hide/pause). */
function VideoTile({ clip, reduce }: { clip: Clip; reduce: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  /** The visitor's intent — separate from whether it's actually in view. */
  const [desiredPlaying, setDesiredPlaying] = useState(true);
  /** Mirrors the <video> element's real play/pause events, so the button
      never shows a state the video isn't actually in (e.g. "Pause" on a
      tile that's paused because it's scrolled out of view). */
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (!reduce && inView && desiredPlaying) {
      el.play().catch(() => {
        /* Autoplay can be blocked before user interaction — poster stays visible. */
      });
    } else {
      el.pause();
    }
  }, [reduce, inView, desiredPlaying]);

  /* Landscape clips get a reduced height — at the portrait tiles' height a
     2.35:1 clip would span nearly the full container and render its 640px
     source at a ~3x upscale. */
  const landscape = clip.width > clip.height;

  return (
    <div
      className={cn(
        "group relative shrink-0 snap-start overflow-hidden rounded-3xl bg-sand",
        landscape ? "h-56 self-center sm:h-64 lg:h-72" : "h-80 sm:h-96 lg:h-[28rem]",
      )}
      style={{ aspectRatio: `${clip.width} / ${clip.height}` }}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        poster={clip.poster}
        aria-label={clip.label}
        width={clip.width}
        height={clip.height}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={clip.src} type="video/mp4" />
        Your browser does not support embedded video.
      </video>

      {!reduce && (
        <button
          type="button"
          onClick={() => setDesiredPlaying((v) => !v)}
          aria-pressed={!desiredPlaying}
          aria-label={isPlaying ? `Pause video: ${clip.label}` : `Play video: ${clip.label}`}
          className="absolute bottom-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ink/50 text-cream backdrop-blur-sm transition-colors hover:bg-ink/70"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}

export function VideoCarousel() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByTile = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 420) * direction;
    el.scrollBy({ left: amount, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section aria-labelledby="video-carousel-heading" className="py-24 sm:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="video-carousel-heading"
            eyebrow="See them for real"
            title="Our homes, in motion"
            intro="A rolling look at real builds — set-up, finishes and the spaces themselves, straight from site."
            className="max-w-2xl"
          />
          <div className="mb-1 hidden gap-3 sm:flex">
            <button
              type="button"
              onClick={() => scrollByTile(-1)}
              disabled={!canScrollLeft}
              aria-label="Scroll videos left"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/25 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByTile(1)}
              disabled={!canScrollRight}
              aria-label="Scroll videos right"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/25 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          role="region"
          aria-label="Video gallery — scroll to browse"
          tabIndex={0}
          className={cn(
            "mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 lg:mt-14 sm:gap-6",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {clips.map((clip) => (
            <VideoTile key={clip.id} clip={clip} reduce={reduce ?? false} />
          ))}
        </div>
      </Container>
    </section>
  );
}
