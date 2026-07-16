"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const steps = [
  {
    number: "01",
    title: "Choose & customise",
    body: "Pick from six home styles — plus outdoor kitchens and safari tents — then make your home yours in the online configurator: finishes, insulation, wet rooms and kitchens, with the price updating as you build your spec.",
  },
  {
    number: "02",
    title: "Secure with a deposit",
    body: "Confirm your order with a deposit and we get to work in the factory. Most homes are ready in around 90 days from deposit to completion.",
  },
  {
    number: "03",
    title: "We deliver nationwide",
    body: "Your home travels anywhere in South Africa from Centurion, Gauteng — delivery is quoted separately based on your location and site accessibility. Prefer to hand it all over? Our turnkey service can arrange the groundwork, plinths, connections and installation while your home is being built.",
  },
  {
    number: "04",
    title: "Move in",
    body: "Setup runs from minutes for an X-Fold to professional on-site assembly for cabins, domes and capsules. Move in — or hand the keys to your first paying guests.",
  },
];

export function HowItWorks() {
  const listRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Clay progress line fills as the steps pass through the viewport.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.75", "end 0.55"],
  });

  return (
    <section aria-label="How it works" className="py-28 sm:py-36">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From deposit to front door in ±90 days"
          intro="No brick-by-brick building site, no year of mud and scaffolding. Your home is precision-built in a factory while your site stays untouched."
        />

        <div ref={listRef} className="relative mt-16 max-w-3xl lg:mt-20">
          {/* Rail + progress line */}
          <div className="absolute bottom-3 left-[5px] top-3 w-px bg-border" aria-hidden="true">
            <motion.div
              className="h-full w-full origin-top bg-clay"
              style={{ scaleY: reduce ? 1 : scrollYProgress }}
            />
          </div>

          <ol className="space-y-14 sm:space-y-16">
            {steps.map((step) => (
              <Reveal as="li" key={step.number} className="relative pl-12 sm:pl-16">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-2.5 h-[11px] w-[11px] rounded-full border-2 border-clay bg-cream"
                />
                <div className="flex items-baseline gap-4">
                  <span
                    aria-hidden="true"
                    className="font-display text-3xl font-semibold text-clay sm:text-4xl"
                  >
                    {step.number}
                  </span>
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-3 max-w-xl leading-relaxed text-stone">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
