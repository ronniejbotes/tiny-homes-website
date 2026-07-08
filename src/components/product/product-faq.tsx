import type { Product } from "@/data/products";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Accordion } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";

export function ProductFaq({ product }: { product: Product }) {
  if (!product.faqs.length) return null;

  return (
    <section
      aria-label="Frequently asked questions"
      className="bg-parchment py-20 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          intro={`What buyers ask us most about the ${product.shortName.toLowerCase()} — from setup and foundations to running it day to day.`}
        />
        <Reveal delay={0.08} className="mt-12">
          <Accordion items={product.faqs} />
        </Reveal>
      </Container>
    </section>
  );
}
