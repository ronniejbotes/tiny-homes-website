import Image from "next/image";
import { Warehouse } from "lucide-react";
import type { Product } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { getHeroImage } from "@/components/product/product-images";
import type { QuoteLine } from "./quote-form";

/** A single configured unit as it appears on the estimate. */
function LineRow({ line }: { line: QuoteLine }) {
  const { product, variant, activeOptions, quantity, lineTotal } = line;
  const name = variant ? variant.name : product.shortName;

  return (
    <li className="flex items-start gap-3">
      <SummaryThumb product={product} />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-ink">
          <span className="font-medium tabular-nums">{quantity} ×</span> {name}
        </p>
        {activeOptions.length > 0 && (
          <p className="mt-0.5 text-xs leading-relaxed text-stone">
            {activeOptions.map((o) => o.label).join(", ")}
          </p>
        )}
      </div>
      <span className="shrink-0 text-right text-sm font-medium tabular-nums nums-tabular text-ink">
        {product.priceOnRequest ? (
          <span className="text-xs font-normal text-stone">priced after consultation</span>
        ) : (
          formatZAR(lineTotal)
        )}
      </span>
    </li>
  );
}

export function SummaryCard({ lines }: { lines: QuoteLine[] }) {
  const pricedLines = lines.filter((l) => !l.product.priceOnRequest);
  const hasPricedTotal = pricedLines.length > 0;
  const someOnRequest = lines.some((l) => l.product.priceOnRequest);
  const grandTotal = pricedLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const totalUnits = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="rounded-3xl border border-border bg-parchment/70 p-6 sm:p-7">
      <p className="text-eyebrow text-clay-dark">Your estimate</p>

      {lines.length === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-stone">
          Choose a home above to build your estimate. We&apos;ll add each unit, its size and any
          extras here as you go.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-stone">
            {totalUnits} {totalUnits === 1 ? "unit" : "units"} across {lines.length}{" "}
            {lines.length === 1 ? "configuration" : "configurations"}
          </p>

          <ul className="mt-5 space-y-4 border-t border-border pt-5">
            {lines.map((line) => (
              <LineRow key={line.id} line={line} />
            ))}
          </ul>

          <div className="mt-5 border-t border-border pt-5">
            {hasPricedTotal ? (
              <>
                <p className="text-sm font-medium text-stone">Estimated total</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="text-display text-3xl text-ink sm:text-4xl tabular-nums nums-tabular">
                    {formatZAR(grandTotal)}
                  </span>
                  <span className="text-sm font-medium text-stone">ex VAT</span>
                </p>
                {someOnRequest && (
                  <p className="mt-2 text-sm leading-relaxed text-stone">
                    Plus any units priced after consultation — quoted separately.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-display text-2xl text-ink sm:text-3xl">
                  Priced after consultation
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone">
                  Every unit here is configured to your site and brief, so there&apos;s no fixed
                  price — we send an itemised quotation after a short consultation.
                </p>
              </>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-stone">
            Delivery is quoted from your address — based on your location and site accessibility. We
            deliver nationwide.
          </p>
          {hasPricedTotal && (
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
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sand text-stone">
        <Warehouse className="h-5 w-5" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-sand">
      <Image src={hero.src} alt="" fill sizes="44px" className="object-cover" />
    </div>
  );
}
