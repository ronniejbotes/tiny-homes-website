import type { Product } from "@/data/products";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

/**
 * "Where the … fits"; one card per job the product is bought for.
 *
 * This was a row of two-word chips ("Site office", "Granny flat"). The words
 * were the right ones, but a chip is a label: it gives a reader nothing to
 * weigh and a search engine nothing to rank. Each use case now carries a
 * heading in the term people actually search for, and a paragraph explaining
 * how this product does that job, which is the content the page was missing.
 */
export function UseCaseChips({ product }: { product: Product }) {
  return (
    <section aria-label="Use cases" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Use cases"
          title={`Where the ${product.shortName.toLowerCase()} fits`}
        />
        <Reveal delay={0.08} className="mt-10">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {product.useCases.map((useCase) => (
              <li
                key={useCase.title}
                className="rounded-3xl border border-border bg-parchment p-6"
              >
                <h3 className="font-display text-xl text-ink">{useCase.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                  {useCase.body}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
