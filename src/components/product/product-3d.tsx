"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import models from "@/data/models.json";

interface ModelEntry {
  src: string;
  poster: string;
  alt: string;
  /** Camera orbit clamps — models built from photos only look right from the photographed arc. */
  orbitMin?: string;
  orbitMax?: string;
}

const modelMap = models as Record<string, ModelEntry>;

/**
 * Interactive 3D model section. Renders nothing for products without a model.
 * The model-viewer web component (three.js) is imported only once the section
 * scrolls near the viewport, and the GLB itself lazy-loads via the component.
 */
export function Product3D({ slug, productName }: { slug: string; productName: string }) {
  const entry = modelMap[slug];
  const reduce = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!entry || !hostRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          import("@google/model-viewer").then(() => setReady(true));
          observer.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [entry]);

  if (!entry) return null;

  return (
    <section aria-labelledby={`model-3d-${slug}`} className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          id={`model-3d-${slug}`}
          eyebrow="Walk around it"
          // Strip a leading "The" so 'The Dome' doesn't render as "See the The Dome".
          title={`See the ${productName.replace(/^the\s+/i, "")} in 3D`}
          intro="Drag to rotate and scroll to zoom. This interactive model is generated from product photography — representative of shape and finish; final details are confirmed on your quote."
        />
        <div
          ref={hostRef}
          className="mt-10 overflow-hidden rounded-3xl border border-border bg-parchment lg:mt-14"
        >
          {ready ? (
            // model-viewer is a custom element; React renders unknown elements as-is.
            <model-viewer
              src={entry.src}
              poster={entry.poster}
              alt={entry.alt}
              camera-controls=""
              /* Default framing (105% radius) leaves a wide empty band around
                 the model — start at the orbit clamp's closest allowed radius
                 so the model fills more of the 560px frame. */
              camera-orbit="0deg 75deg 90%"
              {...(entry.orbitMin ? { "min-camera-orbit": entry.orbitMin } : {})}
              {...(entry.orbitMax ? { "max-camera-orbit": entry.orbitMax } : {})}
              {...(reduce || entry.orbitMin ? {} : { "auto-rotate": "", "auto-rotate-delay": "1500" })}
              rotation-per-second="18deg"
              shadow-intensity="0.9"
              exposure="1.05"
              environment-image="neutral"
              interaction-prompt="once"
              touch-action="pan-y"
              loading="lazy"
              style={{ width: "100%", height: "min(70vh, 560px)", display: "block", background: "var(--color-parchment)" }}
            />
          ) : (
            /* Poster placeholder keeps layout stable until the viewer loads */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.poster}
              alt={entry.alt}
              className="block h-[min(70vh,560px)] w-full object-contain"
            />
          )}
        </div>
        <p className="mt-3 text-xs text-stone">
          3D preview for orientation only — dimensions and finishes per the specifications above.
        </p>
      </Container>
    </section>
  );
}

/* Custom element typing for TSX */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
      interface IntrinsicElements {
        "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          src?: string;
          poster?: string;
          alt?: string;
          "camera-controls"?: string;
          "auto-rotate"?: string;
          "auto-rotate-delay"?: string;
          "rotation-per-second"?: string;
          "shadow-intensity"?: string;
          exposure?: string;
          "environment-image"?: string;
          "interaction-prompt"?: string;
          "touch-action"?: string;
          loading?: string;
          "camera-orbit"?: string;
        };
      }
    }
  }
}
