"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { EASE, Stagger, StaggerItem } from "@/components/ui/reveal";

/* Price-on-request products carry a 0 sentinel — exclude them from the range.
   Garages are a DIY steel-kit line, not a home — their R50 000 entry price stays
   out of the homes starting-price stat. */
const lowestPrice = Math.min(
  ...products
    .filter((p) => !p.priceOnRequest && p.slug !== "garages")
    .map((p) => p.startingPrice),
);

/* Stats are structured (not pre-formatted strings) so the numeric portion can
   count up on view while its prefix/suffix stay put. `full` is the finished,
   screen-reader-friendly value; the visible count-up is aria-hidden. */
type Stat = {
  prefix?: string;
  to: number;
  suffix?: string;
  format?: (n: number) => string;
  full: string;
  label: string;
};

const stats: Stat[] = [
  {
    prefix: "From ",
    to: lowestPrice,
    format: formatZAR,
    full: `From ${formatZAR(lowestPrice)}`,
    label: "Starting price, ex VAT",
  },
  {
    to: products.length,
    suffix: " styles",
    full: `${products.length} styles`,
    label: "Folding homes to safari tents",
  },
  {
    prefix: "±",
    to: site.leadTimeDays,
    suffix: " days",
    full: `±${site.leadTimeDays} days`,
    label: "From deposit to move-in",
  },
  {
    to: 10,
    suffix: "-year guarantee",
    full: "10-year guarantee",
    label: "On every home we build",
  },
];

/** Counts a number up from 0 to `to` once it scrolls into view. Reduced-motion
 *  and no-JS-hydration paths land on the final value with no animation. The
 *  animated glyphs are aria-hidden; an sr-only copy carries the final text. */
function CountUp({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reduce) {
      setValue(stat.to);
      return;
    }
    if (!inView) return;
    const controls = animate(0, stat.to, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, reduce, stat.to]);

  const rounded = Math.round(value);
  const shown = stat.format ? stat.format(rounded) : String(rounded);

  return (
    <>
      <span className="sr-only">{stat.full}</span>
      <span ref={ref} aria-hidden="true">
        {stat.prefix}
        {shown}
        {stat.suffix}
      </span>
    </>
  );
}

export function StatsStrip() {
  return (
    <section aria-label="Key facts" className="border-y border-border bg-parchment">
      <Container>
        <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:py-14 lg:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <p className="font-display text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-3xl">
                <CountUp stat={stat} />
              </p>
              <p className="mt-2 text-sm leading-snug text-stone">{stat.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
