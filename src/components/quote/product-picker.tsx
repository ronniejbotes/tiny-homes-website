import Image from "next/image";
import { Check, Warehouse } from "lucide-react";
import type { Product } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { getLayouts } from "@/lib/layouts";
import { getHeroImage } from "@/components/product/product-images";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Product cards                                                       */
/* ------------------------------------------------------------------ */

const CARD_SIZES = "(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw";

function ProductCard({
  product,
  selected,
  onSelect,
}: {
  product: Product;
  selected: boolean;
  onSelect: () => void;
}) {
  const hero = getHeroImage(product.slug);
  const priceLabel = product.priceOnRequest ? (
    "Price on request"
  ) : (
    <>
      From <span className="nums-tabular">{formatZAR(product.startingPrice)}</span>
    </>
  );

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-3xl border text-left transition-all duration-200",
        selected
          ? "border-forest bg-parchment shadow-[var(--shadow-soft)]"
          : "border-border bg-cream hover:-translate-y-0.5 hover:border-stone/50 hover:shadow-[var(--shadow-soft)]",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand">
        {hero ? (
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            sizes={CARD_SIZES}
            className="object-cover transition-transform duration-500 ease-[var(--ease-smooth)] group-hover:scale-[1.03]"
          />
        ) : (
          // Garages carry no photography: a deliberate, on-brand placeholder.
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-parchment text-stone">
            <Warehouse className="h-8 w-8" aria-hidden="true" />
            <span className="text-eyebrow text-stone/80">DIY steel kit</span>
          </div>
        )}
        {selected && (
          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-forest text-cream shadow-[var(--shadow-soft)]">
            <Check className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg text-ink">{product.name}</h3>
        <p className="mt-0.5 text-sm text-stone">{product.tagline}</p>
        <p className={cn("mt-3 text-sm font-medium", selected ? "text-forest" : "text-clay-dark")}>
          {priceLabel}
          {!product.priceOnRequest && <span className="font-normal text-stone"> ex VAT</span>}
        </p>
      </div>
    </button>
  );
}

export function ProductPicker({
  products,
  selectedSlug,
  onSelect,
}: {
  products: Product[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div role="group" aria-label="Choose your home" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          selected={product.slug === selectedSlug}
          onSelect={() => onSelect(product.slug)}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Variant cards                                                       */
/* ------------------------------------------------------------------ */

export function VariantPicker({
  product,
  variantId,
  onSelect,
}: {
  product: Product;
  variantId: string | undefined;
  onSelect: (id: string) => void;
}) {
  if (!product.variants?.length) return null;

  return (
    <div role="group" aria-label="Choose your size" className="grid gap-3 sm:grid-cols-2">
      {product.variants.map((variant) => {
        const active = variant.id === variantId;
        return (
          <button
            key={variant.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(variant.id)}
            className={cn(
              "flex w-full flex-col rounded-2xl border p-5 text-left transition-colors duration-200",
              active
                ? "border-forest bg-forest text-cream"
                : "border-border bg-cream text-ink hover:border-stone/50",
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-lg">{variant.name}</span>
              <span className={cn("text-sm font-medium", active ? "text-sage" : "text-stone")}>
                {variant.size}
              </span>
            </div>
            <span className="mt-2 text-xl font-medium tabular-nums nums-tabular">
              {formatZAR(variant.price)}
              <span className={cn("ml-1.5 text-xs font-normal", active ? "text-sage" : "text-stone")}>
                ex VAT
              </span>
            </span>
            <span className={cn("mt-3 text-sm leading-relaxed", active ? "text-cream/80" : "text-stone")}>
              {variant.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout cards                                                        */
/* ------------------------------------------------------------------ */

const PLAN_SIZES = "(min-width: 1024px) 15vw, (min-width: 640px) 30vw, 45vw";

/**
 * Which floor plan, on the sizes that come in more than one.
 *
 * Only expandable homes reach this: everywhere else one size means one plan.
 * It renders nothing when there is no choice to make, so it can sit
 * unconditionally in the form.
 *
 * The plans all cost the same, so this asks a question the price never
 * answers. That is exactly why it has to be asked here rather than left to the
 * notes box: the eight arrangements were on the product page all along, and
 * the customer had no way to say which one they had been looking at.
 */
export function LayoutPicker({
  slug,
  variantId,
  layoutId,
  onSelect,
}: {
  slug: string;
  variantId: string | undefined;
  layoutId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const layouts = getLayouts(slug, variantId);
  if (layouts.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Choose your layout"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {layouts.map((layout) => {
        const active = layout.id === layoutId;
        return (
          <button
            key={layout.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(layout.id)}
            className={cn(
              "group flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-all duration-200",
              active
                ? "border-forest bg-parchment shadow-[var(--shadow-soft)]"
                : "border-border bg-cream hover:-translate-y-0.5 hover:border-stone/50",
            )}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-cream">
              <Image
                src={layout.src}
                alt={`${layout.label} floor plan`}
                fill
                sizes={PLAN_SIZES}
                className="object-contain"
              />
              {active && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-cream">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              )}
            </div>
            <span
              className={cn(
                "border-t px-3 py-2.5 text-sm font-medium",
                active ? "border-forest/20 text-forest" : "border-border text-ink",
              )}
            >
              {layout.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
