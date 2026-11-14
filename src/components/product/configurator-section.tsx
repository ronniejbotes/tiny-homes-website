import type { Product } from "@/data/products";
import manifest from "@/data/images.json";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ProductConfigurator } from "@/components/configurator/product-configurator";

export function ConfiguratorSection({ product }: { product: Product }) {
  // Render when there is something to configure or show: priced options, or a
  // real empty-shell/furnished interior pair (manifest.configurator). Products
  // with neither are quoted, not configured.
  if (product.options.length === 0 && !(product.slug in manifest.configurator)) return null;

  // A priced product with no options (the Nature and Apple Cabins) reaches this
  // section for its interior photography and, with sizes, its plans. It has
  // no finishes, modules or extras to pick, so the "Make it yours" promise and
  // provisional extras pricing would describe choices it doesn't have
  // (final check, 14 Nov 2026).
  const nothingToAdd = !product.priceOnRequest && product.options.length === 0;
  const hasSizes = (product.variants?.length ?? 0) > 1;

  return (
    <section
      id="configure"
      aria-label="Configure your home"
      className="scroll-mt-20 py-20 sm:scroll-mt-24 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow={product.priceOnRequest || nothingToAdd ? "Inside" : "Configurator"}
          title={product.priceOnRequest || nothingToAdd ? "See inside one" : "Make it yours"}
          // A price-on-request product has nothing to configure and no total to
          // watch: it reaches this section for its interior photography alone,
          // so the standing "watch the total update" promise would be a lie.
          intro={
            product.priceOnRequest
              ? "Look inside, empty and furnished. Layouts, decks and finishes are settled with you at consultation rather than picked here, and the whole configuration is quoted per project."
              : nothingToAdd
                ? `${hasSizes ? "Pick a size to see its plan and price. " : ""}Look inside, empty and furnished. ${hasSizes ? "Each price covers" : "The price covers"} the standard specification listed on this page, so there are no extras to add here. Every price shown excludes VAT.`
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
