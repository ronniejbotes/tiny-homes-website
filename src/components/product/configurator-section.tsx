import type { Product } from "@/data/products";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ProductConfigurator } from "@/components/configurator/product-configurator";

export function ConfiguratorSection({ product }: { product: Product }) {
  // Products without options (outdoor kitchens, safari tents) are quoted, not
  // configured — never render an empty configurator.
  if (product.options.length === 0) return null;

  return (
    <section
      id="configure"
      aria-label="Configure your home"
      className="scroll-mt-20 py-20 sm:scroll-mt-24 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow="Configurator"
          title="Make it yours"
          intro="Choose your finishes and modules and watch the total update as you go. Extras pricing is provisional and will be confirmed line by line on your formal quotation — every price shown excludes VAT."
        />
        <Reveal delay={0.08} className="mt-12">
          <ProductConfigurator product={product} />
        </Reveal>
      </Container>
    </section>
  );
}
