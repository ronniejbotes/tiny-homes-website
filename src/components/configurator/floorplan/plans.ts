/**
 * Floor-plan geometry for every product (and expandable variant), in METRES.
 *
 * Coordinate space: "interior metres", origin at the top-left corner of the
 * INTERIOR floor. The shell wall (WALL_M thick) sits between -WALL_M..0 and
 * interior..interior+WALL_M. Decks/terraces extend beyond the shell using the
 * same coordinate space. The view applies the px-per-metre transform.
 *
 * Data only: no JSX in this file.
 */

import type { Product, VisualKey } from "@/data/products";

export const WALL_M = 0.1;

/** Axis-aligned rectangle in metres, interior coordinate space. */
export interface PlanRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type WallSide = "top" | "bottom" | "left" | "right";

/** A module zone drawn when its VisualKey is active. */
export interface PlanZone {
  key: VisualKey;
  label: string;
  rect: PlanRect;
  /** Floor area shown on the label (matches the option's footprintM2 where one exists). */
  areaM2?: number;
  /** Dashed outline: overhead items that consume no floor area (cupboards). */
  dashed?: boolean;
  /**
   * Room ships with the home (e.g. included bathroom/kitchen): always drawn
   * and always counted by the space summary, with no option selected.
   */
  standard?: boolean;
  /**
   * Variants on which the room ships as standard (e.g. the kitchen included
   * in the 9 m and 11.8 m Apple cabins but not the 5.8 m). getPlan() resolves
   * `standard` from the selected variant; without a variant the base flag applies.
   */
  standardVariantIds?: string[];
}

export type FixtureKind = "shower" | "wc" | "basin" | "sink" | "hob";

/** Top-down fixture glyph, rendered only while its parent zone is active. */
export interface PlanFixture {
  kind: FixtureKind;
  zone: VisualKey;
  cx: number;
  cy: number;
}

export interface PlanFurniture {
  id: string;
  label: string;
  rect: PlanRect;
}

export interface PlanDoor {
  side: WallSide;
  /** Distance of the door opening's start from the wall's interior origin (top/bottom: from left; left/right: from top). */
  offset: number;
  width: number;
  /** Which end of the opening carries the hinge. */
  hinge: "start" | "end";
  /** Which way the leaf swings. Defaults to "in" (into the interior). */
  swing?: "in" | "out";
}

export interface PlanWindow {
  side: WallSide;
  offset: number;
  length: number;
}

/** Expandable-wing seam line across the floor. */
export interface PlanSeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PlanDeck {
  rect: PlanRect;
  label: string;
  /** Standard decks (e.g. the nature cabin's timber deck) are always drawn. */
  standard: boolean;
}

export interface ProductPlan {
  /** External shell dimensions, metres. */
  exterior: { w: number; d: number };
  /** Internal clear dimensions, metres. */
  interior: { w: number; d: number };
  wall: number;
  /** Marketed floor area used by the space summary. */
  floorAreaM2: number;
  door: PlanDoor;
  windows: PlanWindow[];
  zones: PlanZone[];
  fixtures: PlanFixture[];
  furniture: PlanFurniture[];
  deck?: PlanDeck;
  seams?: PlanSeam[];
}

/** Rect from edge coordinates (x1,y1)-(x2,y2). */
function r(x1: number, y1: number, x2: number, y2: number): PlanRect {
  return { x: x1, y: y1, w: round2(x2 - x1), h: round2(y2 - y1) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ------------------------------------------------------------------ */
/* Shared zone builders                                                */
/* ------------------------------------------------------------------ */

function wetRoomZone(rect: PlanRect, standard?: boolean): PlanZone {
  return { key: "wet-room", label: "Wet room", rect, areaM2: 2.8, standard };
}

function kitchenZone(rect: PlanRect, standard?: boolean): PlanZone {
  return { key: "kitchen", label: "Kitchen", rect, areaM2: 1.5, standard };
}

function cupboardZone(rect: PlanRect): PlanZone {
  return { key: "cupboards", label: "Overhead cupboards", rect, dashed: true };
}

function airconZone(rect: PlanRect): PlanZone {
  return { key: "aircon", label: "AC", rect };
}

function wetFixtures(shower: [number, number], wc: [number, number], basin: [number, number]): PlanFixture[] {
  return [
    { kind: "shower", zone: "wet-room", cx: shower[0], cy: shower[1] },
    { kind: "wc", zone: "wet-room", cx: wc[0], cy: wc[1] },
    { kind: "basin", zone: "wet-room", cx: basin[0], cy: basin[1] },
  ];
}

function kitchenFixtures(sink: [number, number], hob: [number, number]): PlanFixture[] {
  return [
    { kind: "sink", zone: "kitchen", cx: sink[0], cy: sink[1] },
    { kind: "hob", zone: "kitchen", cx: hob[0], cy: hob[1] },
  ];
}

/* ------------------------------------------------------------------ */
/* Fixed-footprint products                                            */
/* ------------------------------------------------------------------ */

/**
 * Folding home: 5.8 × 2.48 m external (X-Fold), interior ≈ 5.6 × 2.28 m.
 * The bathroom and kitchen are factory-fitted on the X-Fold BK and Flat Pack
 * variants (no configurator option adds them); the base X-Fold has neither.
 * Geometry is drawn once: the 18 m² Flat Pack shares this representative plan.
 */
const FOLDING_PLAN: ProductPlan = {
  exterior: { w: 5.8, d: 2.48 },
  interior: { w: 5.6, d: 2.28 },
  wall: WALL_M,
  floorAreaM2: 15,
  // Entrance in the upper half of the right end wall, window below it in the
  // same wall; the second spec window is centred in the opposite end wall.
  // The leaf swings out onto the deck; there is no room to lose inside a 15 m²
  // shell, and the X-Fold ships with an outward-opening entrance door.
  door: { side: "right", offset: 0.2, width: 0.9, hinge: "start", swing: "out" },
  windows: [
    { side: "right", offset: 1.3, length: 0.8 },
    { side: "left", offset: 0.69, length: 0.9 },
  ],
  zones: [
    {
      key: "wet-room",
      label: "Wet room",
      rect: r(0, 0, 1.15, 1.4), // enclosed bathroom, 1.15 × 1.4 m (doc-sourced)
      areaM2: 1.6,
      standardVariantIds: ["x-fold-bk"],
    },
    {
      key: "kitchen",
      label: "Kitchen",
      rect: r(1.45, 0, 2.45, 0.5), // compact kitchen unit, 1.0 × 0.5 m (doc-sourced)
      areaM2: 0.5,
      standardVariantIds: ["x-fold-bk"],
    },
    airconZone(r(0.02, 1.6, 0.28, 2.0)),
  ],
  fixtures: [
    { kind: "shower", zone: "wet-room", cx: 0.4, cy: 0.4 },
    { kind: "wc", zone: "wet-room", cx: 0.3, cy: 1.1 },
    { kind: "basin", zone: "wet-room", cx: 0.88, cy: 1.0 },
    // The 1 m kitchen unit only fits a sink glyph; the hob sits on the counter.
    { kind: "sink", zone: "kitchen", cx: 1.95, cy: 0.25 },
  ],
  furniture: [
    { id: "bed", label: "Single bed", rect: r(3.8, 1.28, 5.5, 2.23) },
    { id: "sofa", label: "Sofa", rect: r(1.6, 1.35, 3.4, 2.2) },
    { id: "coffee-table", label: "Table", rect: r(2.0, 0.75, 2.9, 1.25) },
    { id: "tv", label: "TV unit", rect: r(2.55, 0.05, 3.6, 0.45) },
  ],
  // 5 m² outside the right end; the door (right wall, offset 0.2–1.1) swings out onto it.
  deck: {
    rect: r(5.7, -0.1, 7.7, 2.4),
    label: "Timber deck",
    standard: false,
  },
};

/**
 * Nature cabin: 6.6 × 3.2 m cabin plus the 1.5 × 3.2 m viewing terrace off the
 * entrance gable, which is the 8.1 × 3.2 m external size on the spec sheet
 * (and 26 m² of footprint across both).
 *
 * The entrance is the glazed gable end, not a long wall: every product render
 * shows the double doors and the terrace on the short side, with a single
 * window down the long elevation. The interior is laid out around that,
 * bathroom and kitchen at the back, bed in the middle, lounge by the doors.
 */
const NATURE_PLAN: ProductPlan = {
  exterior: { w: 6.6, d: 3.2 },
  interior: { w: 6.4, d: 3.0 },
  wall: WALL_M,
  floorAreaM2: 26,
  door: { side: "right", offset: 1.05, width: 0.9, hinge: "start" },
  windows: [
    { side: "right", offset: 2.2, length: 0.65 }, // gable glazing beside the doors
    { side: "bottom", offset: 2.7, length: 1.4 }, // the long elevation's single window
    { side: "left", offset: 1.0, length: 1.0 }, // back gable, over the bath
  ],
  zones: [
    wetRoomZone(r(0.05, 0.05, 1.75, 1.85), true), // fully equipped bathroom included as standard
    kitchenZone(r(0.05, 2.25, 2.35, 2.95), true), // stone counter, basin and induction cooker, included
    cupboardZone(r(0.05, 2.25, 2.35, 2.55)),
    airconZone(r(2.05, 0.05, 2.35, 0.3)),
  ],
  fixtures: [
    ...wetFixtures([0.5, 0.5], [0.5, 1.45], [1.35, 0.95]),
    ...kitchenFixtures([0.75, 2.6], [1.85, 2.6]),
  ],
  furniture: [
    { id: "bed", label: "Double bed", rect: r(2.6, 0.05, 4.0, 1.95) },
    { id: "sofa", label: "Sofa", rect: r(4.5, 2.05, 6.1, 2.9) },
    { id: "coffee-table", label: "Table", rect: r(4.5, 1.15, 5.3, 1.75) },
    { id: "tv", label: "TV unit", rect: r(4.7, 0.05, 5.9, 0.45) },
  ],
  // Off the entrance gable, clear of the inward swing (right wall, 1.05–1.95).
  deck: {
    rect: r(6.5, -0.1, 8.0, 3.1),
    label: "Viewing terrace, standard",
    standard: true,
  },
};

/* Apple cabins and glamping capsules have no drawn plan: both ship catalogue
   plan sheets under manifest.layoutPlans, which the configurator renders in
   place of FloorPlanView. Their old representative rectangles were removed
   when those sheets were drawn from the manufacturer's CAD. */

/* ------------------------------------------------------------------ */
/* Expandable homes: per-variant geometry (external dims in metres)   */
/* ------------------------------------------------------------------ */

const EXPANDABLE_PLANS: Record<string, ProductPlan> = {
  // The sub-R330k units (6m Compact, Slim 6m, 6m Open Plan) were dropped from
  // the catalogue per the owner; their plans went with them.

  /** 6m Expandable Home: 5.8 × 6.3 m expanded (drawn portrait, catalog 20ft), wings both sides of a central core. */
  b20: {
    exterior: { w: 5.8, d: 6.3 },
    interior: { w: 5.6, d: 6.1 },
    wall: WALL_M,
    floorAreaM2: 37,
    door: { side: "bottom", offset: 2.3, width: 0.9, hinge: "start" },
    windows: [
      { side: "top", offset: 2.55, length: 1.1 },
      { side: "bottom", offset: 4.0, length: 1.2 },
      { side: "left", offset: 4.6, length: 1.0 },
    ],
    zones: [
      wetRoomZone(r(3.85, 0, 5.5, 1.7), true), // fully kitted variant: bathroom included
      kitchenZone(r(0.05, 0, 2.35, 0.65), true), // fully kitted variant: kitchen included
      cupboardZone(r(0.05, 0, 2.35, 0.35)),
      airconZone(r(2.6, 0.05, 2.85, 0.3)),
    ],
    fixtures: [
      ...wetFixtures([4.3, 0.45], [4.3, 1.3], [5.15, 0.85]),
      ...kitchenFixtures([0.65, 0.35], [1.75, 0.35]),
    ],
    furniture: [
      { id: "bed", label: "Double bed", rect: r(4.05, 3.8, 5.45, 5.7) },
      { id: "wardrobe", label: "Wardrobe", rect: r(4.9, 2.0, 5.5, 3.2) },
      { id: "sofa", label: "Sofa", rect: r(0.05, 2.2, 0.9, 4.0) },
      { id: "tv", label: "TV unit", rect: r(1.9, 2.5, 2.3, 3.7) },
      { id: "dining-table", label: "Dining", rect: r(2.5, 1.2, 3.7, 2.0) },
      { id: "coffee-table", label: "Table", rect: r(1.15, 4.3, 2.05, 4.8) },
    ],
    // 10 m² along the entrance wall; the door (offset 2.3–3.2, inward swing) opens onto it.
    deck: {
      rect: r(0.5, 6.2, 4.5, 8.7),
      label: "Timber deck",
      standard: false,
    },
    seams: [
      { x1: 0, y1: 1.83, x2: 5.6, y2: 1.83 },
      { x1: 0, y1: 4.27, x2: 5.6, y2: 4.27 },
    ],
  },

  /** 12m Expandable Home: 12 × 6.3 m expanded (catalog 40ft): bathroom left, kitchen right, bedrooms in the corners. */
  b40: {
    exterior: { w: 12, d: 6.3 },
    interior: { w: 11.8, d: 6.1 },
    wall: WALL_M,
    floorAreaM2: 74,
    door: { side: "bottom", offset: 5.35, width: 0.9, hinge: "start" },
    windows: [
      { side: "top", offset: 3.6, length: 1.2 },
      { side: "top", offset: 7.0, length: 1.2 },
      { side: "bottom", offset: 1.4, length: 1.2 },
      { side: "bottom", offset: 7.6, length: 1.2 },
      { side: "right", offset: 2.4, length: 1.2 },
    ],
    zones: [
      wetRoomZone(r(0.1, 0, 1.75, 1.7), true), // fully kitted variant: bathroom on the left (catalog)
      kitchenZone(r(9.4, 0, 11.7, 0.65), true), // fully kitted variant: kitchen on the right (catalog)
      cupboardZone(r(9.4, 0, 11.7, 0.35)),
      airconZone(r(2.9, 0.05, 3.15, 0.3)),
    ],
    fixtures: [
      ...wetFixtures([0.55, 0.45], [0.55, 1.3], [1.4, 0.85]),
      ...kitchenFixtures([10.0, 0.35], [11.1, 0.35]),
    ],
    furniture: [
      { id: "bed", label: "Double bed", rect: r(9.5, 3.5, 10.9, 5.4) },
      { id: "wardrobe", label: "Wardrobe", rect: r(8.2, 4.5, 8.8, 5.7) },
      { id: "sofa", label: "Sofa", rect: r(0.9, 3.1, 2.7, 3.95) },
      { id: "tv", label: "TV unit", rect: r(1.2, 1.9, 2.4, 2.3) },
      { id: "coffee-table", label: "Table", rect: r(1.3, 2.45, 2.2, 2.95) },
      { id: "dining-table", label: "Dining", rect: r(3.5, 1.3, 4.7, 2.1) },
    ],
    // 10 m² along the entrance wall; the door (offset 5.25–6.15, inward swing) opens onto it.
    deck: {
      rect: r(3.2, 6.2, 8.2, 8.2),
      label: "Timber deck",
      standard: false,
    },
    seams: [
      { x1: 0, y1: 1.79, x2: 11.8, y2: 1.79 },
      { x1: 0, y1: 4.23, x2: 11.8, y2: 4.23 },
    ],
  },
};

/** Fallback expandable variant: the catalogue's first (and configurator default). */
export const DEFAULT_EXPANDABLE_VARIANT = "b20";

const PLANS: Record<string, ProductPlan> = {
  "folding-homes": FOLDING_PLAN,
  "nature-cabins": NATURE_PLAN,
};

/**
 * Bake the selected variant into a plan: the marketed floor area tracks the
 * variant's catalogue size, and rooms flagged standardVariantIds are drawn
 * as standard only on the variants that ship with them. Geometry itself is
 * shared: representative of the range, exact for the largest size.
 */
function resolveForVariant(plan: ProductPlan, product: Product, variantId?: string): ProductPlan {
  const variant = product.variants?.find((v) => v.id === variantId);
  if (!variant) return plan;
  const areaM2 = parseFloat(variant.size); // "30.4 m²" → 30.4
  return {
    ...plan,
    floorAreaM2: Number.isFinite(areaM2) ? areaM2 : plan.floorAreaM2,
    zones: plan.zones.map((zone) =>
      zone.standardVariantIds
        ? { ...zone, standard: zone.standardVariantIds.includes(variant.id) }
        : zone,
    ),
  };
}

/**
 * Whether a drawn plan really exists for this size, rather than a fallback.
 *
 * getPlan() below quietly substitutes the 6m home's geometry for any expandable
 * size it has no drawing for, which is fine as a rendering fallback and wrong as
 * an answer to "can we show this customer their floor plan?". The 18 m2 compact
 * is 2.95 m wide; drawing it as the 5.8 m home and labelling it 18 m2 would be a
 * confident wrong picture. Callers that offer a floor plan to a customer should
 * ask this first.
 */
export function hasDrawnPlan(product: Product, variantId?: string): boolean {
  if (product.slug !== "expandable-homes") return product.slug in PLANS;
  return (variantId ?? DEFAULT_EXPANDABLE_VARIANT) in EXPANDABLE_PLANS;
}

/** Resolve the plan for a product (per-variant geometry for expandable homes). */
export function getPlan(product: Product, variantId?: string): ProductPlan {
  const base =
    product.slug === "expandable-homes"
      ? EXPANDABLE_PLANS[variantId ?? DEFAULT_EXPANDABLE_VARIANT] ??
        EXPANDABLE_PLANS[DEFAULT_EXPANDABLE_VARIANT]
      : PLANS[product.slug] ?? FOLDING_PLAN;
  return resolveForVariant(base, product, variantId);
}

/** All plans, keyed for test/collision tooling. */
export function allPlans(): { key: string; plan: ProductPlan }[] {
  return [
    ...Object.entries(PLANS).map(([key, plan]) => ({ key, plan })),
    ...Object.entries(EXPANDABLE_PLANS).map(([key, plan]) => ({ key: `expandable-homes/${key}`, plan })),
  ];
}

/** Footprint of one furniture item, m². */
export function furnitureItemAreaM2(item: PlanFurniture): number {
  return item.rect.w * item.rect.h;
}

/** Total furniture footprint for a plan, m². */
export function furnitureAreaM2(plan: ProductPlan): number {
  return plan.furniture.reduce((sum, item) => sum + furnitureItemAreaM2(item), 0);
}

/**
 * Module floor area, m²: the plan's standard (included) zones plus the
 * Σ footprintM2 of the active options (dependents count only when their
 * requirement is met). Options whose visual duplicates a standard zone are
 * finish upgrades of an included room and consume no new floor; options with
 * footprintVariantIds only consume floor on the listed variants.
 */
export function moduleAreaM2(
  product: Product,
  selected: Partial<Record<string, boolean>>,
  plan: ProductPlan,
  variantId?: string,
): number {
  const standardVisuals = new Set(plan.zones.filter((z) => z.standard).map((z) => z.key));
  const standardArea = plan.zones.reduce(
    (sum, zone) => (zone.standard && zone.areaM2 ? sum + zone.areaM2 : sum),
    0,
  );
  return product.options.reduce((sum, opt) => {
    const active = selected[opt.id] && (!opt.requires || selected[opt.requires]);
    if (!active || !opt.footprintM2) return sum;
    if (standardVisuals.has(opt.visual)) return sum;
    if (opt.footprintVariantIds && variantId && !opt.footprintVariantIds.includes(variantId)) return sum;
    return sum + opt.footprintM2;
  }, standardArea);
}
