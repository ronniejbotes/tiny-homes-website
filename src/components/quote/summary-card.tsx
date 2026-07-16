import Image from "next/image";
import { Warehouse } from "lucide-react";
import type { CustomOption, Product, ProductVariant } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { getHeroImage } from "@/components/product/product-images";

export function SummaryCard({
  product,
  variant,
  activeOptions,
  total,
}: {
  product: Product | undefined;
  variant: ProductVariant | undefined;
  activeOptions: CustomOption[];
  total: number;
}) {
  return (
    <div className="rounded-3xl border border-border bg-parchment/70 p-6 sm:p-7">
      <p className="text-eyebrow text-clay-dark">Your estimate</p>

      {!product ? (
        <p className="mt-4 text-sm leading-relaxed text-stone">
          Choose a home above to build your estimate. We&apos;ll add your size and any extras here as
          you go.
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4">
            <SummaryThumb product={product} />
            <div>
              <h3 className="font-display text-lg text-ink">{product.name}</h3>
              {variant && <p className="text-sm text-stone">{variant.name}</p>}
            </div>
          </div>

          {activeOptions.length > 0 && (
            <ul className="mt-5 space-y-2 border-t border-border pt-5">
              {activeOptions.map((option) => (
                <li key={option.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-stone">{option.label}</span>
                  <span className="shrink-0 font-medium tabular-nums text-ink">
                    {option.price > 0 ? `+${formatZAR(option.price)}` : "on quotation"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 border-t border-border pt-5">
            {product.priceOnRequest ? (
              <>
                <p className="text-display text-2xl text-ink sm:text-3xl">
                  Priced after consultation
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone">
                  Every safari tent is configured to your site and brief, so there&apos;s no fixed
                  price — we send an itemised quotation after a short consultation.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-stone">Estimated total</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="text-display text-3xl text-ink sm:text-4xl tabular-nums">
                    {formatZAR(total)}
                  </span>
                  <span className="text-sm font-medium text-stone">ex VAT</span>
                </p>
              </>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-stone">
            Delivery is quoted from your address — based on your location and site accessibility. We
            deliver nationwide.
          </p>
          {!product.priceOnRequest && (
            <p className="mt-2 text-xs leading-relaxed text-stone">
              This is an estimate — optional extras carry provisional pricing, and your final figure
              is confirmed line by line on your formal quotation.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function SummaryThumb({ product }: { product: Product }) {
  const hero = getHeroImage(product.slug);
  if (!hero) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sand text-stone">
        <Warehouse className="h-6 w-6" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">
      <Image src={hero.src} alt="" fill sizes="56px" className="object-cover" />
    </div>
  );
}
