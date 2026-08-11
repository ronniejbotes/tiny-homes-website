/**
 * Internal layouts: the floor plans a customer picks between *within* one size.
 *
 * Only expandable homes have these. Everywhere else a plan sheet describes a
 * whole variant (one apple cabin size = one plan), so the variant already IS
 * the layout and there is nothing further to choose. Expandable homes are the
 * exception: the 6m ships in eight arrangements and the 12m in seven, all at
 * the same price, and until now the site showed them without ever asking which
 * one the customer wanted.
 *
 * The sheets live in images.json because they are images first. This module is
 * the one place that reads them as a *choice*, so the quote and the
 * configurator cannot drift apart on what is on offer.
 */

import manifest from "@/data/images.json";

export interface LayoutOption {
  /** Stable id, e.g. "2-bed-a". Unique within one product+variant. */
  id: string;
  /** What the customer sees, e.g. "2 Bed A". */
  label: string;
  src: string;
  width: number;
  height: number;
}

interface RawPlan {
  id?: string;
  label?: string;
  src: string;
  width: number;
  height: number;
}

const LAYOUT_PLANS = manifest.layoutPlans as Record<string, Record<string, RawPlan[]>>;

/**
 * The layouts on offer for one product and size.
 *
 * Keyed strictly by variant id, with no fall-back to a shared default. That is
 * deliberate and is the fix for a real defect: the expandable sheets used to be
 * filed under "default", so the 18 m² compact — a 2.95 m wide open-plan unit —
 * inherited the 6m home's eight plans and offered a customer a four-bedroom
 * layout it cannot be built in. A size with no sheets of its own now correctly
 * returns none, and the configurator falls through to the drawn plan.
 *
 * A product whose plans are not per-size (none today) still resolves through
 * the "default" key when no variant is in play.
 */
export function getLayouts(slug: string, variantId?: string): LayoutOption[] {
  const sets = LAYOUT_PLANS[slug];
  if (!sets) return [];

  const plans = variantId ? sets[variantId] : sets["default"];
  if (!plans) return [];

  // A single sheet describes the size rather than offering a choice within it,
  // so it is not something to pick between.
  if (plans.length < 2) return [];

  // Only sheets carrying an explicit id are offered as a choice, and that is
  // load-bearing rather than incidental. The apple-cabin and glamping-capsule
  // groups also hold several sheets under a "default" key, but those are one
  // sheet per *size* — a browsing aid, not an arrangement of the same unit.
  // Giving them ids would silently turn three cabin sizes into three "layouts"
  // of one. Only add an id to a sheet that is genuinely an alternative
  // arrangement of the size it sits under.
  return plans.flatMap((plan) =>
    plan.id && plan.label
      ? [{ id: plan.id, label: plan.label, src: plan.src, width: plan.width, height: plan.height }]
      : [],
  );
}

/**
 * Every manufacturer plan sheet for a size, choice or not.
 *
 * The display counterpart to getLayouts: an apple cabin has exactly one sheet,
 * which is worth showing but not worth asking about. Same strict keying, so a
 * size with no sheets of its own returns none and the caller can fall back to
 * the drawn plan rather than showing another size's drawings.
 */
export function getPlanSheets(slug: string, variantId?: string): LayoutOption[] {
  const sets = LAYOUT_PLANS[slug];
  const plans = sets ? (variantId ? sets[variantId] : sets["default"]) : undefined;
  if (!plans) return [];
  return plans.map((plan, i) => ({
    id: plan.id ?? String(i),
    label: plan.label ?? "",
    src: plan.src,
    width: plan.width,
    height: plan.height,
  }));
}

/**
 * Resolve a layout id against what is actually offered for that size.
 *
 * Returns undefined for anything not on the list, which is what makes this safe
 * to call on a deep link or a posted payload: an id from a stale link, or one
 * that belongs to a different size, resolves to nothing rather than printing a
 * layout on a quotation that we never offered.
 */
export function findLayout(
  slug: string,
  variantId: string | undefined,
  layoutId: string | undefined,
): LayoutOption | undefined {
  if (!layoutId) return undefined;
  return getLayouts(slug, variantId).find((l) => l.id === layoutId);
}
