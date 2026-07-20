import type { Product } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";

export function VariantCards({ product }: { product: Product }) {
  if (!product.variants?.length) return null;

  return (
    <section aria-label="Sizes and pricing" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Sizes"
          title="Choose your size"
          intro="Pick the footprint that fits your site and budget — your chosen size sets the base price in the configurator below. All prices exclude VAT."
        />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {product.variants.map((variant) => (
            <StaggerItem key={variant.id} className="flex">
              <div className="flex w-full flex-col rounded-3xl border border-border bg-parchment p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-soft)]">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl text-ink">{variant.name}</h3>
                  <p className="text-sm font-medium text-stone">{variant.size}</p>
                </div>
                <p className="text-display mt-4 text-2xl text-ink">
                  <span className="nums-tabular">{formatZAR(variant.price)}</span>
                </p>
                <p className="mt-1 text-xs text-stone">ex VAT</p>
                <p className="mt-4 text-sm leading-relaxed text-stone">
                  {variant.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
