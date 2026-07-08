import type { Product } from "@/data/products";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function OverviewSpecs({ product }: { product: Product }) {
  return (
    <section aria-label="Overview and specifications" className="bg-parchment py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-eyebrow mb-4 text-clay">Overview</p>
            <h2 className="text-display text-4xl text-ink sm:text-5xl">
              The {product.shortName}, in detail
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-stone">
              {product.description}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="divide-y divide-border rounded-3xl border border-border bg-cream px-6 sm:px-8">
              {product.specs.map((spec) => (
                <div key={spec.label} className="grid grid-cols-[1fr_1.6fr] gap-4 py-4">
                  <dt className="pt-0.5 text-sm font-medium text-stone">{spec.label}</dt>
                  <dd className="text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
