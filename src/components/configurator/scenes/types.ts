import type { VisualKey } from "@/data/products";

/** Props every product scene receives from the configurator. */
export interface SceneProps {
  /**
   * Visual layers to draw. A key is true when ANY active option carries that
   * visual — scenes never see raw option ids.
   */
  visuals: Partial<Record<VisualKey, boolean>>;
  furnished: boolean;
  /** Active size-variant id for products with variants (e.g. "b20-slim"). */
  variantId?: string;
}
