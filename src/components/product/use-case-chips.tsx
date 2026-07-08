import type { Product } from "@/data/products";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export function UseCaseChips({ product }: { product: Product }) {
  return (
    <section aria-label="Use cases" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Use cases"
          title={`Where the ${product.shortName.toLowerCase()} fits`}
        />
        <Reveal delay={0.08} className="mt-10">
          <ul className="flex flex-wrap gap-3">
            {product.useCases.map((useCase) => (
              <li
                key={useCase}
                className="rounded-full border border-border bg-parchment px-5 py-2.5 text-[0.9375rem] font-medium text-ink"
              >
                {useCase}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
