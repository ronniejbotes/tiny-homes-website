import { Check } from "lucide-react";
import type { Product } from "@/data/products";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";

export function FeatureGrid({ product }: { product: Product }) {
  return (
    <section aria-label="Features" className="bg-parchment py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow="Features" title="The details that matter" />
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {product.features.map((feature) => (
            <StaggerItem
              key={feature}
              className="flex items-start gap-4 rounded-2xl border border-border bg-cream p-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss/15 text-moss">
                <Check className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
              </span>
              <p className="pt-1.5 leading-relaxed text-ink">{feature}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
