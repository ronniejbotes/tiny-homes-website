import { BadgeCheck, Leaf, Shield, Sun, Timer, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { site } from "@/lib/site";

const values = [
  {
    icon: Sun,
    title: "Off-grid & solar ready",
    body: "Solar power, battery banks, gas geysers and rainwater tanks can be paired with selected models, sized and quoted for your site. The set-up is designed to keep running through load-shedding, or far from any grid.",
  },
  {
    icon: Timer,
    title: "Quick to set up",
    body: "An X-Fold unfolds in minutes and an expandable home is set up the day it arrives. Cabins and capsules arrive fully built and are placed onto a prepared foundation. It's far faster than a conventional brick build.",
  },
  {
    icon: Truck,
    title: "A relocatable asset",
    body: "Steel-framed and crane-ready. If you move, it can move too: fold it back down, or lift it whole onto a truck and set it up somewhere new.",
  },
  {
    icon: BadgeCheck,
    title: "Guarantee, support and finance",
    body: `${site.guarantee}, with our turnkey team on hand to arrange groundwork, connections and installation, and ${site.finance.toLowerCase()}.`,
  },
  {
    icon: Leaf,
    title: "Sustainable steel construction",
    body: "Building in a factory means materials are used exactly and your site stays undisturbed. The steel structure is built to last for decades.",
  },
  {
    icon: Shield,
    /** No fire-rating certificate exists for the wall panels, and the specs
     *  across the range are EPS and polyurethane — both foam plastics. The
     *  word "fireproof" is therefore an unproven safety claim and must not
     *  reappear here or on /about. If the supplier produces a certificate,
     *  state the actual rating instead; do not restore the old wording. */
    title: "Engineered for South African conditions",
    body: "Insulated steel-framed panels and weather-resistant steel shells designed for South Africa's climate, from coastal humidity to inland heat and cold.",
  },
];

export function WhyTinyLiving() {
  return (
    <section aria-label="Why tiny living" className="border-y border-border bg-parchment py-28 sm:py-36">
      <Container>
        <SectionHeading
          eyebrow="Why tiny living"
          title="House a parent, let a unit, or own a home sooner"
          intro="Tiny homes aren't a compromise: they're a faster way to give a parent or an adult child their own space, add a unit to let, or put a roof over your own head, without a year of building on your site. Tiny house, tiny home or prefab home, the build is the same: a steel frame, insulated panels and a factory finish."
        />

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {values.map((value) => (
            <StaggerItem key={value.title} className="h-full">
              <div className="h-full rounded-3xl border border-border bg-cream p-7 transition-[transform,box-shadow] duration-300 ease-[var(--ease-smooth)] hover:-translate-y-1 hover:shadow-[var(--shadow-lifted)] sm:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-cream">
                  <value.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-ink">
                  {value.title}
                </h3>
                <p className="mt-2.5 leading-relaxed text-stone">{value.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
