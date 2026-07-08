import type { OptionId } from "@/data/products";

/** Props every product scene receives from the configurator. */
export interface SceneProps {
  selected: Partial<Record<OptionId, boolean>>;
  furnished: boolean;
  /** Active size-variant id for products with variants (e.g. "b20-slim"). */
  variantId?: string;
}
