# Spec: Configurator V2 — real extras, rich visuals, live floorplan

Binding spec for the V2 upgrade. Read fully before touching code. The existing
site (DESIGN_BRIEF.md) remains the design contract; this spec extends it.

## Goals (user requirements, verbatim intent)

1. When an option is toggled, the buyer must SEE it appear inside the unit —
   a literal kitchen, wet room, couch, bed, TV, picture frames, décor,
   shelving — not an abstract hint.
2. A floorplan view of the current configuration showing how much space
   everything takes.
3. Product-specific optional extras that make sense per home, priced with
   ≥25% margin on estimated supplier cost.
4. Better product imagery sourced from the web where quality beats what we have.

## 1. Data model (src/data/products.ts) — BREAKING CHANGE

```ts
export type OptionCategory = "structure" | "interior" | "modules" | "energy" | "comfort";
export type VisualKey =
  | "floors" | "walls" | "insulation" | "wet-room" | "kitchen" | "cupboards"
  | "solar" | "aircon" | "deck" | "glazing" | "curtains" | "heating"
  | "stack" | "none";

export interface CustomOption {
  id: string;                // kebab-case, unique per product
  label: string;
  description: string;
  price: number;             // ZAR ex VAT — selling price shown to buyers
  cost?: number;             // ZAR ex VAT — estimated supplier cost (internal only, never rendered)
  category: OptionCategory;
  visual: VisualKey;         // what the cutaway + floorplan draw
  requires?: string;         // option id that must be on first
  provisional: boolean;      // true until company confirms pricing
  photo?: string;            // manifest path of a REAL photo showing this option, when we have one
  footprintM2?: number;      // floor area consumed (floorplan space math); omit for non-floor options
}
```

- Margin rule: `price ≥ cost / 0.75` (≥25% margin on selling price). Every
  researched option carries `cost` and a `// margin: NN%` comment.
- Configurator state becomes `Record<string, boolean>`; `configuredPrice`
  keys by string id. `OptionId` union type is DELETED — grep for all usages
  (configurator, scenes, lead-form) and migrate.
- Every product keeps the six original placeholder options ONLY where they
  make sense for that product, re-expressed in the new model, PLUS the new
  researched extras. The dome keeps its dome-specific relabels.

## 2. Visual system — three synchronized views (tabs in the configurator)

Tab order: **Cutaway** · **Floor plan** · **Photos**. State (selections,
variant, furnished) is shared; switching tabs never resets it.

### 2a. Cutaway (upgrade of existing scenes)
- Same SceneProps contract + `variantId`. Scenes stay SVG but move from flat
  line-art to rich flat-illustration: layered gradients for depth, soft cast
  shadows (feGaussianBlur or opacity ellipses), material texture hints
  (wood grain strokes, fabric folds on bedding), warm interior light glow.
- Furniture library (scenes/shared.tsx) must include: sofa with cushions,
  double bed with duvet + 2 pillows + headboard, wall-mounted flat TV with
  stand shadow, 2–3 framed pictures, open shelving with books/plants, floor
  plant, pendant + table lamps, rug, curtains, side tables. Every item is a
  reusable component with a position/scale prop.
- New visual keys render in every scene where the option exists:
  solar (roof panels), aircon (wall split unit + outdoor unit), deck
  (timber deck extension), glazing (double-glaze frame highlight), curtains,
  heating (subtle floor glow), stack (second unit ghosted above, folding only).
- All colors remain design tokens (CSS vars). Consistent 2–2.5px ink outline
  language stays so it reads as one system.

### 2b. Floor plan (NEW: src/components/configurator/floorplan/)
- Top-down, TO SCALE from product dims + variant geometry (expandable homes:
  per-variant footprints; reuse the GEOM approach from the cutaway scene).
- Draws: outer shell with wall thickness, door arcs, windows, deck when
  selected; module footprints (kitchen run, wet room with fixtures, cupboards
  as dashed overhead outline); furniture footprints when furnished (bed,
  sofa, TV console, table) at real-world scale.
- Labels: overall external dimensions with dimension lines (m), each module's
  m², and a live space summary bar under the plan:
  `Floor area X m² · Modules Y m² · Furniture Z m² · Free space W m² (NN%)`.
  Computation: product/variant floor area minus Σ footprintM2 of active
  options minus furniture allowance (per-product constant when furnished).
- Same motion rules (layers fade/slide via AnimatePresence, reduced-motion
  snaps). aria: role="img" with a generated description of the plan.

### 2c. Photos (NEW: real-photo evidence per option)
- `photo` field on options maps to REAL images from src/data/images.json
  (e.g. expandable interior kitchen photo for kitchen-unit, gallery
  bathroom photo for wet-room upgrades, dome interior for curtains).
- The Photos tab shows the product's gallery PLUS, when options are active,
  a "Your selections" row of photo cards for each active option that has a
  photo, captioned "Actual <label> — finishes may vary".
- Options without a real photo show no card (never fabricate). If AI-render
  credits become available later, renders drop into the same `photo` slots —
  architecture must not care where the image came from.

## 3. Researched extras per product (pricing from SA market research)

Each product gets extras from this menu where sensible (final list per
research): double-glazed aluminium windows, sliding door, extra window,
solar kit (panels+inverter+battery tiers), gas geyser, aircon (9k/12k BTU
split), plug-in shower-toilet pod, kitchenette, overhead cupboards, timber
deck, blackout/electric curtains, under-floor heating, smart lock, exterior
cladding upgrade, stacking/linking kit (folding), balcony (capsules),
plunge/terrace add-ons only if a credible cost source exists.
- Research output: cost source + estimated landed cost + recommended selling
  price (≥25% margin, rounded to R x50/x00) per product tier.
- Keep provisional: true (company will confirm) but prices must be realistic.

## 4. Imagery upgrade
- Per product: hunt manufacturer/reseller marketing photos of the SAME unit
  types at higher resolution than current (≥1600px wide preferred).
  Record source URL + licensing risk note per candidate in
  research/image-sources.md. Shortlist only; the owner approves before any
  externally-sourced image ships. DO NOT silently replace current images —
  add candidates under public/images/candidates/<slug>/ and write the notes file.
- Generated-image pipeline is out of scope this round (no generation credits);
  the `photo` architecture above is forward-compatible with it.

## 5. Acceptance criteria
- tsc, eslint, production build all clean; all 9 routes 200.
- Every option of every product visibly changes the Cutaway AND (when it has
  a footprint) the Floor plan; furnished adds ≥6 distinct furniture items in
  cutaway and their footprints in plan.
- Space summary math is exact (Σ footprints, one decimal) for every
  variant × option combination.
- No fabricated photos/claims; only real images in Photos tab.
- Prices: every researched option has cost + ≥25% margin; formatZAR used;
  ex-VAT noted; provisional tag rendered.
- Contact handoff (option ids in query string) still works with new ids.
