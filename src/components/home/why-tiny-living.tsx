import { Bed, Leaf, Shield, Sun, Timer, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";

const values = [
  {
    icon: Sun,
    title: "Off-grid & solar ready",
    body: "Solar roofs of up to 4 kW, battery banks, gas geysers and rainwater tanks on selected models — designed to keep running through load-shedding and far beyond the grid.",
  },
  {
    icon: Timer,
    title: "Rapid deployment",
    body: "A folding home unfolds in under 30 minutes; even the flagship capsule installs in 2–3 days. Months faster than a conventional brick build.",
  },
  {
    icon: Truck,
    title: "A relocatable asset",
    body: "Steel-framed and crane-ready. If life moves, your home moves with it — fold it back down or lift it whole onto a truck and redeploy it.",
  },
  {
    icon: Bed,
    title: "Hospitality income",
    body: "Lodges and vineyards run glamping capsules at R 2 500 – R 4 000 a night, with most operators reaching return on investment in 18–24 months.",
  },
  {
    icon: Leaf,
    title: "Sustainable steel construction",
    body: "Factory precision means materials are used exactly, sites stay undisturbed and the durable steel structure is built to last for decades.",
  },
  {
    icon: Shield,
    title: "Engineered for SA conditions",
    body: "Fireproof insulated panels, anti-UV glazing and weather-resistant shells proven in coastal, bushveld and mountain conditions.",
  },
];

export function WhyTinyLiving() {
  return (
    <section aria-label="Why tiny living" className="border-y border-border bg-parchment py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Why tiny living"
          title="Small footprint, serious upside"
          intro="Tiny homes aren't a compromise — they're a faster, smarter way to put a high-quality roof over your head, your guests or your business."
        />

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {values.map((value) => (
            <StaggerItem key={value.title} className="h-full">
              <div className="h-full rounded-3xl border border-border bg-cream p-7 sm:p-8">
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
