/**
 * Floor-plan geometry for every product (and expandable variant), in METRES.
 *
 * Coordinate space: "interior metres" — origin at the top-left corner of the
 * INTERIOR floor. The shell wall (WALL_M thick) sits between -WALL_M..0 and
 * interior..interior+WALL_M. Decks/terraces extend beyond the shell using the
 * same coordinate space. The view applies the px-per-metre transform.
 *
 * Data only — no JSX in this file.
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
  /** Dashed outline — overhead items that consume no floor area (cupboards). */
  dashed?: boolean;
  /**
   * Room ships with the home (e.g. included bathroom/kitchen): always drawn
   * and always counted by the space summary, with no option selected.
   */
  standard?: boolean;
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
  /** Circular footprint (round bed) — rect is the bounding square. */
  round?: boolean;
}

export interface PlanDoor {
  side: WallSide;
  /** Distance of the door opening's start from the wall's interior origin (top/bottom: from left; left/right: from top). */
  offset: number;
  width: number;
  /** Which end of the opening carries the hinge. */
  hinge: "start" | "end";
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
  /** Standard decks (nature cabin deck, dome terrace) are always drawn. */
  standard: boolean;
}

export interface ProductPlan {
  /** External shell dimensions, metres. */
  exterior: { w: number; d: number };
  /** Internal clear dimensions, metres. */
  interior: { w: number; d: number };
  wall: number;
  shape: "rect" | "stadium";
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

/** Folding home — 5.8 × 2.4 m external, interior ≈ 5.6 × 2.2 m. */
const FOLDING_PLAN: ProductPlan = {
  exterior: { w: 5.8, d: 2.4 },
  interior: { w: 5.6, d: 2.2 },
  wall: WALL_M,
  shape: "rect",
  floorAreaM2: 15,
  door: { side: "bottom", offset: 1.4, width: 0.9, hinge: "start" },
  windows: [
    { side: "top", offset: 0.35, length: 0.8 },
    { side: "top", offset: 4.3, length: 0.9 },
    { side: "bottom", offset: 2.6, length: 0.9 },
  ],
  zones: [
    wetRoomZone(r(0, 0, 1.3, 2.2)),
    kitchenZone(r(1.45, 0, 3.65, 0.68)),
    cupboardZone(r(1.45, 0, 3.65, 0.38)),
    airconZone(r(5.32, 1.15, 5.58, 1.55)),
  ],
  fixtures: [
    ...wetFixtures([0.45, 0.5], [0.42, 1.7], [0.95, 1.05]),
    ...kitchenFixtures([2.0, 0.35], [3.1, 0.35]),
  ],
  furniture: [
    { id: "bed", label: "Single bed", rect: r(3.7, 0.05, 5.6, 1.0) },
    { id: "sofa", label: "Sofa", rect: r(2.4, 1.35, 4.2, 2.2) },
    { id: "coffee-table", label: "Table", rect: r(2.6, 0.72, 3.5, 1.22) },
    { id: "tv", label: "TV unit", rect: r(4.3, 1.8, 5.5, 2.2) },
  ],
  // ~5 m² along the entrance side; the door (offset 1.4–2.3, inward swing) opens onto it.
  deck: {
    rect: r(0.3, 2.3, 3.63, 3.8),
    label: "Timber deck",
    standard: false,
  },
};

/** Nature cabin — 6.3 × 3.2 m external + standard 1.8 m deck across the front. */
const NATURE_PLAN: ProductPlan = {
  exterior: { w: 6.3, d: 3.2 },
  interior: { w: 6.1, d: 3.0 },
  wall: WALL_M,
  shape: "rect",
  floorAreaM2: 21,
  door: { side: "bottom", offset: 2.6, width: 0.9, hinge: "start" },
  windows: [
    { side: "top", offset: 2.2, length: 1.0 },
    { side: "right", offset: 0.6, length: 1.0 },
    { side: "bottom", offset: 4.0, length: 1.2 },
  ],
  zones: [
    wetRoomZone(r(0.05, 0.05, 1.7, 1.75), true), // fully equipped bathroom included as standard
    kitchenZone(r(1.95, 0.05, 4.25, 0.7)),
    cupboardZone(r(1.95, 0.05, 4.25, 0.4)),
    airconZone(r(5.6, 2.3, 5.85, 2.6)),
  ],
  fixtures: [
    ...wetFixtures([0.5, 0.5], [0.5, 1.4], [1.3, 0.9]),
    ...kitchenFixtures([2.5, 0.37], [3.7, 0.37]),
  ],
  furniture: [
    { id: "bed", label: "Double bed", rect: r(4.55, 0.1, 5.95, 2.0) },
    { id: "sofa", label: "Sofa", rect: r(0.25, 2.1, 2.05, 2.95) },
    { id: "coffee-table", label: "Table", rect: r(2.15, 1.5, 3.05, 2.0) },
    { id: "tv", label: "TV unit", rect: r(3.7, 2.55, 4.9, 2.95) },
  ],
  deck: {
    rect: r(-0.1, 3.1, 6.2, 4.9),
    label: "Deck — standard",
    standard: true,
  },
};

/** The Dome — Ø4 m stretched to 7 m (stadium) + 1.8 m terrace. Interior stadium 6.8 × 3.8, end radius 1.9. */
const DOME_PLAN: ProductPlan = {
  exterior: { w: 7, d: 4 },
  interior: { w: 6.8, d: 3.8 },
  wall: WALL_M,
  shape: "stadium",
  floorAreaM2: 24.6,
  door: { side: "bottom", offset: 3.05, width: 0.9, hinge: "start" },
  windows: [],
  zones: [
    wetRoomZone(r(1.2, 0.2, 2.75, 1.9)),
    kitchenZone(r(3.2, 0.15, 5.5, 0.8)),
    cupboardZone(r(3.2, 0.15, 5.5, 0.5)),
    airconZone(r(2.85, 0.2, 3.1, 0.45)),
  ],
  fixtures: [
    ...wetFixtures([1.65, 0.65], [1.65, 1.5], [2.4, 1.0]),
    ...kitchenFixtures([3.75, 0.48], [4.9, 0.48]),
  ],
  furniture: [
    { id: "bed", label: "Round bed", rect: r(4.6, 0.95, 6.5, 2.85), round: true },
    { id: "sofa", label: "Sofa", rect: r(1.25, 2.8, 3.05, 3.65) },
    { id: "coffee-table", label: "Table", rect: r(1.8, 2.15, 2.7, 2.65) },
    { id: "tv", label: "TV unit", rect: r(4.2, 3.25, 5.4, 3.65) },
  ],
  deck: {
    rect: r(1.5, 3.9, 5.3, 5.7),
    label: "Terrace — standard",
    standard: true,
  },
};

/** Apple cabin — 11.5 × 3.2 m external (36.8 m² = 11.5 × 3.2); two rooms + central bathroom zone. */
const APPLE_PLAN: ProductPlan = {
  exterior: { w: 11.5, d: 3.2 },
  interior: { w: 11.3, d: 3.0 },
  wall: WALL_M,
  shape: "rect",
  floorAreaM2: 36.8,
  door: { side: "bottom", offset: 3.6, width: 0.9, hinge: "start" },
  windows: [
    { side: "bottom", offset: 0.6, length: 2.4 },
    { side: "bottom", offset: 6.8, length: 3.6 },
    { side: "top", offset: 9.5, length: 1.2 },
  ],
  zones: [
    wetRoomZone(r(4.95, 0, 6.35, 2.0), true), // central bathroom included as standard (1.4 × 2.0 = 2.8)
    kitchenZone(r(0.8, 0, 3.1, 0.65), true), // fitted kitchen included as standard
    cupboardZone(r(0.8, 0, 3.1, 0.35)),
    airconZone(r(8.55, 0.05, 8.8, 0.3)),
  ],
  fixtures: [
    ...wetFixtures([5.35, 0.45], [5.35, 1.5], [6.0, 1.0]),
    ...kitchenFixtures([1.4, 0.35], [2.5, 0.35]),
  ],
  furniture: [
    { id: "bed", label: "Double bed", rect: r(9.6, 0.5, 11.0, 2.4) },
    { id: "sofa", label: "Sofa", rect: r(0.35, 1.9, 2.15, 2.75) },
    { id: "coffee-table", label: "Table", rect: r(2.35, 1.6, 3.25, 2.1) },
    { id: "tv", label: "TV unit", rect: r(7.0, 0.05, 8.2, 0.45) },
    { id: "wardrobe", label: "Wardrobe", rect: r(6.55, 2.3, 7.75, 2.9) },
  ],
  // Optional balcony along the glass wall, outside the shell; clear of the door (3.6–4.5) and its inward swing.
  deck: {
    rect: r(6.7, 3.1, 11.2, 4.3),
    label: "Balcony",
    standard: false,
  },
};

/** Glamping capsule — 11.5 × 3.2 m external; two rooms, central bathroom, kitchen; optional balcony. */
const CAPSULE_PLAN: ProductPlan = {
  exterior: { w: 11.5, d: 3.2 },
  interior: { w: 11.3, d: 3.0 },
  wall: WALL_M,
  shape: "rect",
  floorAreaM2: 36.8,
  door: { side: "bottom", offset: 5.2, width: 0.9, hinge: "start" },
  windows: [
    { side: "bottom", offset: 0.8, length: 3.4 },
    { side: "bottom", offset: 6.6, length: 3.8 },
    { side: "right", offset: 0.8, length: 1.4 },
  ],
  zones: [
    wetRoomZone(r(5.0, 0, 6.4, 2.0), true), // central bathroom included as standard
    kitchenZone(r(1.0, 0, 3.3, 0.65), true), // fitted kitchen included as standard
    cupboardZone(r(1.0, 0, 3.3, 0.35)),
    airconZone(r(8.3, 0.05, 8.55, 0.3)),
  ],
  fixtures: [
    ...wetFixtures([5.4, 0.45], [5.4, 1.55], [6.05, 1.0]),
    ...kitchenFixtures([1.6, 0.35], [2.7, 0.35]),
  ],
  furniture: [
    { id: "bed", label: "Queen bed", rect: r(9.7, 0.4, 11.1, 2.3) },
    { id: "sofa", label: "Sofa", rect: r(0.5, 2.1, 2.3, 2.95) },
    { id: "coffee-table", label: "Table", rect: r(2.6, 1.6, 3.5, 2.1) },
    { id: "dining-table", label: "Dining", rect: r(3.9, 0.6, 4.8, 1.5) },
    { id: "tv", label: "TV unit", rect: r(8.0, 2.5, 9.2, 2.9) },
    { id: "wardrobe", label: "Wardrobe", rect: r(6.6, 0.05, 7.8, 0.65) },
  ],
  deck: {
    rect: r(2.5, 3.1, 8.8, 4.9),
    label: "Balcony",
    standard: false,
  },
};

/* ------------------------------------------------------------------ */
/* Expandable homes — per-variant geometry (external dims in metres)   */
/* ------------------------------------------------------------------ */

const EXPANDABLE_PLANS: Record<string, ProductPlan> = {
  /** B20 Slim — 5.94 × 4.64 m (27.5 m² ≈ 5.94 × 4.64 = 27.56), single wing (seam at core edge). */
  "b20-slim": {
    exterior: { w: 5.94, d: 4.64 },
    interior: { w: 5.74, d: 4.44 },
    wall: WALL_M,
    shape: "rect",
    floorAreaM2: 27.5,
    door: { side: "bottom", offset: 2.08, width: 0.9, hinge: "start" },
    windows: [
      { side: "top", offset: 2.6, length: 0.7 },
      { side: "bottom", offset: 0.6, length: 1.0 },
      { side: "left", offset: 3.2, length: 1.0 },
    ],
    zones: [
      wetRoomZone(r(4.09, 0, 5.74, 1.7)),
      kitchenZone(r(0.05, 0, 2.35, 0.65)),
      cupboardZone(r(0.05, 0, 2.35, 0.35)),
      airconZone(r(2.55, 0.05, 2.8, 0.3)),
    ],
    fixtures: [
      ...wetFixtures([4.54, 0.45], [4.54, 1.3], [5.39, 0.85]),
      ...kitchenFixtures([0.65, 0.35], [1.75, 0.35]),
    ],
    furniture: [
      { id: "bed", label: "Double bed", rect: r(3.65, 2.35, 5.05, 4.25) },
      { id: "sofa", label: "Sofa", rect: r(0.05, 1.15, 0.9, 2.95) },
      { id: "tv", label: "TV unit", rect: r(1.8, 1.35, 2.2, 2.55) },
      { id: "dining-table", label: "Dining", rect: r(2.6, 2.0, 3.4, 2.8) },
    ],
    // 10 m² along the entrance wall; the door (offset 2.08–2.98, inward swing) opens onto it.
    deck: {
      rect: r(0.5, 4.54, 4.5, 7.04),
      label: "Timber deck",
      standard: false,
    },
    seams: [{ x1: 0, y1: 2.34, x2: 5.74, y2: 2.34 }],
  },

  /** B20 — 5.9 × 6.3 m, wings both sides of a central core. */
  b20: {
    exterior: { w: 5.9, d: 6.3 },
    interior: { w: 5.7, d: 6.1 },
    wall: WALL_M,
    shape: "rect",
    floorAreaM2: 37,
    door: { side: "bottom", offset: 2.3, width: 0.9, hinge: "start" },
    windows: [
      { side: "top", offset: 2.55, length: 1.1 },
      { side: "bottom", offset: 4.0, length: 1.2 },
      { side: "left", offset: 4.6, length: 1.0 },
    ],
    zones: [
      wetRoomZone(r(3.85, 0, 5.5, 1.7), true), // fully kitted variant — bathroom included
      kitchenZone(r(0.05, 0, 2.35, 0.65), true), // fully kitted variant — kitchen included
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
      { x1: 0, y1: 1.83, x2: 5.7, y2: 1.83 },
      { x1: 0, y1: 4.27, x2: 5.7, y2: 4.27 },
    ],
  },

  /** B40 Slim — 11.5 × 4.8 m, single wing. */
  "b40-slim": {
    exterior: { w: 11.5, d: 4.8 },
    interior: { w: 11.3, d: 4.6 },
    wall: WALL_M,
    shape: "rect",
    floorAreaM2: 48,
    door: { side: "bottom", offset: 5.1, width: 0.9, hinge: "start" },
    windows: [
      { side: "top", offset: 3.6, length: 1.2 },
      { side: "top", offset: 6.8, length: 1.2 },
      { side: "bottom", offset: 1.2, length: 1.2 },
      { side: "bottom", offset: 7.4, length: 1.2 },
    ],
    zones: [
      wetRoomZone(r(9.45, 0, 11.1, 1.7)),
      kitchenZone(r(0.1, 0, 2.4, 0.65)),
      cupboardZone(r(0.1, 0, 2.4, 0.35)),
      airconZone(r(2.9, 0.05, 3.15, 0.3)),
    ],
    fixtures: [
      ...wetFixtures([9.9, 0.45], [9.9, 1.3], [10.75, 0.85]),
      ...kitchenFixtures([0.7, 0.35], [1.8, 0.35]),
    ],
    furniture: [
      { id: "bed", label: "Double bed", rect: r(9.3, 2.5, 10.7, 4.4) },
      { id: "wardrobe", label: "Wardrobe", rect: r(8.3, 3.1, 8.9, 4.3) },
      { id: "sofa", label: "Sofa", rect: r(0.9, 2.5, 2.7, 3.35) },
      { id: "tv", label: "TV unit", rect: r(1.2, 1.4, 2.4, 1.8) },
      { id: "coffee-table", label: "Table", rect: r(1.3, 1.9, 2.2, 2.4) },
      { id: "dining-table", label: "Dining", rect: r(3.3, 1.1, 4.5, 1.9) },
    ],
    // 10 m² along the entrance wall; the door (offset 5.1–6.0, inward swing) opens onto it.
    deck: {
      rect: r(3.0, 4.7, 8.0, 6.7),
      label: "Timber deck",
      standard: false,
    },
    seams: [{ x1: 0, y1: 2.34, x2: 11.3, y2: 2.34 }],
  },

  /** B40 — 11.8 × 6.22 m, wings both sides. */
  b40: {
    exterior: { w: 11.8, d: 6.22 },
    interior: { w: 11.6, d: 6.02 },
    wall: WALL_M,
    shape: "rect",
    floorAreaM2: 72,
    door: { side: "bottom", offset: 5.25, width: 0.9, hinge: "start" },
    windows: [
      { side: "top", offset: 3.6, length: 1.2 },
      { side: "top", offset: 7.0, length: 1.2 },
      { side: "bottom", offset: 1.4, length: 1.2 },
      { side: "bottom", offset: 7.6, length: 1.2 },
      { side: "right", offset: 2.4, length: 1.2 },
    ],
    zones: [
      wetRoomZone(r(9.75, 0, 11.4, 1.7), true), // fully kitted variant — bathroom included
      kitchenZone(r(0.1, 0, 2.4, 0.65), true), // fully kitted variant — kitchen included
      cupboardZone(r(0.1, 0, 2.4, 0.35)),
      airconZone(r(2.9, 0.05, 3.15, 0.3)),
    ],
    fixtures: [
      ...wetFixtures([10.2, 0.45], [10.2, 1.3], [11.05, 0.85]),
      ...kitchenFixtures([0.7, 0.35], [1.8, 0.35]),
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
      rect: r(3.2, 6.12, 8.2, 8.12),
      label: "Timber deck",
      standard: false,
    },
    seams: [
      { x1: 0, y1: 1.79, x2: 11.6, y2: 1.79 },
      { x1: 0, y1: 4.23, x2: 11.6, y2: 4.23 },
    ],
  },
};

const DEFAULT_EXPANDABLE_VARIANT = "b20-slim";

const PLANS: Record<string, ProductPlan> = {
  "folding-homes": FOLDING_PLAN,
  "nature-cabins": NATURE_PLAN,
  "the-dome": DOME_PLAN,
  "apple-cabins": APPLE_PLAN,
  "glamping-capsules": CAPSULE_PLAN,
};

/** Resolve the plan for a product (variant-aware for expandable homes). */
export function getPlan(product: Product, variantId?: string): ProductPlan {
  if (product.slug === "expandable-homes") {
    return (
      EXPANDABLE_PLANS[variantId ?? DEFAULT_EXPANDABLE_VARIANT] ??
      EXPANDABLE_PLANS[DEFAULT_EXPANDABLE_VARIANT]
    );
  }
  return PLANS[product.slug] ?? FOLDING_PLAN;
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
  if (item.round) {
    const radius = item.rect.w / 2;
    return Math.PI * radius * radius;
  }
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
