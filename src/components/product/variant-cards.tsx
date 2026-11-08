import type { Product } from "@/data/products";
import manifest from "@/data/images.json";
import { cn } from "@/lib/cn";
import { formatZAR } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";

export function VariantCards({ product }: { product: Product }) {
  if (!product.variants?.length) return null;

  // Each card links to the configurator below it (29 Oct 2026 review, Fix-now
  // item 8): the cards had a hover shadow but did nothing on a tap, and Clarity
  // counted the taps as dead clicks. The condition is ConfiguratorSection's
  // own, so a card never links to a #configure that isn't on the page; where
  // there is none, the card is plain, with no hover cue. The configurator
  // takes no size from outside, so it opens on its usual first size.
  const linksToConfigurator =
    product.options.length > 0 || product.slug in manifest.configurator;
  const cardClass =
    "flex w-full flex-col rounded-3xl border border-border bg-parchment p-6";

  return (
    <section aria-label="Sizes and pricing" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Sizes"
          title={product.sizesHeading ?? "Choose your size"}
          intro="Pick the footprint that fits your site and budget. Your chosen size sets the base price in the configurator below. All prices exclude VAT."
        />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {product.variants.map((variant) => (
            <StaggerItem key={variant.id} className="flex">
              <CardShell
                href={linksToConfigurator ? "#configure" : undefined}
                className={cn(
                  cardClass,
                  linksToConfigurator &&
                    "transition-shadow duration-200 hover:shadow-[var(--shadow-soft)]",
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl text-ink">{variant.name}</h3>
                  <p className="text-sm font-medium text-stone">{variant.size}</p>
                </div>
                {/* A price-on-request size carries a 0 sentinel as its
                    price: it says so instead of printing "R 0". The blank
                    line keeps its description level with its neighbours'. */}
                {variant.priceOnRequest ? (
                  <>
                    <p className="text-display mt-4 text-2xl text-ink">Price on request</p>
                    <p className="mt-1 text-xs text-stone" aria-hidden="true">
                      &nbsp;
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-display mt-4 text-2xl text-ink">
                      <span className="nums-tabular">{formatZAR(variant.price)}</span>
                    </p>
                    <p className="mt-1 text-xs text-stone">ex VAT</p>
                  </>
                )}
                <p className="mt-4 text-base leading-relaxed text-stone sm:text-sm">
                  {variant.description}
                </p>
              </CardShell>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/** A link to the configurator where there is one, otherwise a plain box. */
function CardShell({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: React.ReactNode;
}) {
  return href ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
}
