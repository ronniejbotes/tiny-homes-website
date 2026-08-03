import {
  isOptionAvailable,
  optionPrice,
  type CustomOption,
  type OptionCategory,
  type Product,
} from "@/data/products";
import { formatZAR } from "@/lib/format";
import { cn } from "@/lib/cn";

const CATEGORY_ORDER: OptionCategory[] = ["structure", "interior", "modules", "energy", "comfort"];
const CATEGORY_LABELS: Record<OptionCategory, string> = {
  structure: "Structure",
  interior: "Interior",
  modules: "Modules",
  energy: "Energy",
  comfort: "Comfort",
};

function ExtraToggle({
  option,
  areaM2,
  checked,
  disabled,
  locked,
  helper,
  onToggle,
}: {
  option: CustomOption;
  areaM2?: number;
  checked: boolean;
  disabled: boolean;
  /** Forced on and not removable — the coastal corrosion specification. */
  locked?: boolean;
  helper?: string;
  onToggle: () => void;
}) {
  // Per-m² extras resolve to a real amount once a size is chosen — only the
  // genuinely unpriced ones fall back to "priced on quotation".
  const price = optionPrice(option, areaM2);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      // aria-disabled (not native disabled) keeps the row focusable so keyboard
      // users can read the "add the … first" helper; guard the click handler.
      aria-disabled={disabled || locked || undefined}
      onClick={disabled || locked ? undefined : onToggle}
      className={cn(
        "group flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-colors duration-200",
        checked ? "border-forest/40 bg-parchment" : "border-border bg-cream hover:border-stone/50",
        disabled && "cursor-not-allowed opacity-50 hover:border-border",
        // Locked reads as settled, not broken: full contrast, just not clickable.
        locked && "cursor-not-allowed border-forest/40 bg-parchment",
      )}
    >
      <span className="flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-medium text-ink">{option.label}</span>
          <span className="text-sm font-medium text-clay-dark">
            {price > 0 ? (
              <span className="nums-tabular">{`+${formatZAR(price)}`}</span>
            ) : (
              "priced on quotation"
            )}
            {option.pricePerM2 != null && (
              <span className="ml-1 font-normal text-stone nums-tabular">
                (R{option.pricePerM2}/m²)
              </span>
            )}
          </span>
          {locked && (
            <span className="rounded-full border border-forest/40 bg-cream px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-forest">
              required
            </span>
          )}
          {option.provisional && price > 0 && (
            <span className="rounded-full border border-border bg-cream px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-stone">
              provisional
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-stone">{option.description}</span>
        {helper && <span className="mt-1.5 block text-xs font-medium text-clay-dark">{helper}</span>}
      </span>
      {/* Visual switch track */}
      <span
        aria-hidden="true"
        className={cn(
          "relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200",
          checked ? "border-forest bg-forest" : "border-border bg-sand",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-5.5 w-5.5 rounded-full bg-cream shadow-[var(--shadow-soft)] transition-transform duration-200 ease-[var(--ease-smooth)]",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

export function ExtrasPicker({
  product,
  variantId,
  selected,
  lockedId,
  onToggle,
}: {
  product: Product;
  variantId?: string;
  selected: Partial<Record<string, boolean>>;
  /** Option that the delivery address makes mandatory — shown on and locked. */
  lockedId?: string;
  onToggle: (option: CustomOption) => void;
}) {
  if (product.options.length === 0) return null;

  const areaM2 = product.variants?.find((v) => v.id === variantId)?.areaM2;
  // Only show extras offered on the chosen size — configuredPrice() ignores the
  // rest, so listing them would price them at zero.
  const available = product.options.filter((o) => isOptionAvailable(o, variantId));

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    options: available.filter((o) => o.category === category),
  })).filter((g) => g.options.length > 0);

  return (
    <div className="flex flex-col gap-8">
      {grouped.map((group) => (
        <fieldset key={group.category}>
          <legend className="text-eyebrow mb-3 text-clay-dark">
            {CATEGORY_LABELS[group.category]}
          </legend>
          <div className="grid gap-2">
            {group.options.map((option) => {
              const requirementMet = !option.requires || Boolean(selected[option.requires]);
              const locked = option.id === lockedId;
              return (
                <ExtraToggle
                  key={option.id}
                  option={option}
                  areaM2={areaM2}
                  checked={locked || (Boolean(selected[option.id]) && requirementMet)}
                  disabled={!requirementMet && !locked}
                  locked={locked}
                  helper={
                    locked
                      ? "Included automatically — your delivery address is a coastal site"
                      : !requirementMet
                        ? `Add the ${
                            product.options
                              .find((o) => o.id === option.requires)
                              ?.label.toLowerCase() ?? "required option"
                          } first`
                        : undefined
                  }
                  onToggle={() => onToggle(option)}
                />
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
