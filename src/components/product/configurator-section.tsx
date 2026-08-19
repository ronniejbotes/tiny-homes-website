import type { Product } from "@/data/products";
import manifest from "@/data/images.json";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ProductConfigurator } from "@/components/configurator/product-configurator";

export function ConfiguratorSection({ product }: { product: Product }) {
  // Render when there is something to configure or show: priced options, or a
  // real empty-shell/furnished interior pair (manifest.configurator). Products
  // with neither (outdoor kitchens, safari tents) are quoted, not configured.
  if (product.options.length === 0 && !(product.slug in manifest.configurator)) return null;

  return (
    <section
      id="configure"
      aria-label="Configure your home"
      className="scroll-mt-20 py-20 sm:scroll-mt-24 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow={product.priceOnRequest ? "Inside" : "Configurator"}
          title={product.priceOnRequest ? "See inside one" : "Make it yours"}
          // A price-on-request product has nothing to configure and no total to
          // watch: it reaches this section for its interior photography alone,
          // so the standing "watch the total update" promise would be a lie.
          intro={
            product.priceOnRequest
              ? "Look inside, empty and furnished. Layouts, decks and finishes are settled with you at consultation rather than picked here, and the whole configuration is quoted per project."
              : "Choose your finishes and modules and watch the total update as you go. Extras pricing is provisional and will be confirmed line by line on your formal quotation. Every price shown excludes VAT."
          }
        />
        <Reveal delay={0.08} className="mt-12">
          <ProductConfigurator product={product} />
        </Reveal>
      </Container>
    </section>
  );
}
