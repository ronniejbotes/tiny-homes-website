import type { CustomOption, OptionCategory, Product } from "@/data/products";
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
  checked,
  disabled,
  helper,
  onToggle,
}: {
  option: CustomOption;
  checked: boolean;
  disabled: boolean;
  helper?: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      // aria-disabled (not native disabled) keeps the row focusable so keyboard
      // users can read the "add the … first" helper; guard the click handler.
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onToggle}
      className={cn(
        "group flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-colors duration-200",
        checked ? "border-forest/40 bg-parchment" : "border-border bg-cream hover:border-stone/50",
        disabled && "cursor-not-allowed opacity-50 hover:border-border",
      )}
    >
      <span className="flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-medium text-ink">{option.label}</span>
          <span className="text-sm font-medium text-clay-dark">
            {option.price > 0 ? (
              <span className="nums-tabular">{`+${formatZAR(option.price)}`}</span>
            ) : (
              "priced on quotation"
            )}
          </span>
          {option.provisional && option.price > 0 && (
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
  selected,
  onToggle,
}: {
  product: Product;
  selected: Partial<Record<string, boolean>>;
  onToggle: (option: CustomOption) => void;
}) {
  if (product.options.length === 0) return null;

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    options: product.options.filter((o) => o.category === category),
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
              return (
                <ExtraToggle
                  key={option.id}
                  option={option}
                  checked={Boolean(selected[option.id]) && requirementMet}
                  disabled={!requirementMet}
                  helper={
                    !requirementMet
                      ? `Add the ${
                          product.options.find((o) => o.id === option.requires)?.label.toLowerCase() ??
                          "required option"
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
