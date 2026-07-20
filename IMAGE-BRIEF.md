# Tiny Homes SA — Product Image Regeneration Brief

**Purpose:** replace/verify every product image so each is (a) the ACTUAL product,
(b) accurate to the unit's real size, (c) on-brand and built to sell. Nothing invented.

## How to run this (free)
- Higgsfield's unlimited models (Seedream 4.5, Seedream 5.0 Lite, Nano Banana 2, Kling O1)
  are **free in the Higgsfield web app, but the Claude MCP API meters ~0.5–1.5 credits/image.**
  So EITHER: generate in the Higgsfield app yourself (free) using the prompts below and drop the
  files into `public/images/products/<slug>/`, and I crop/place/verify — OR approve credit spend
  and I generate here via the API. (Owner has ~861 credits.)
- Quality bar: **3 independent professional judges score each image /100; average must be ≥98**,
  else regenerate. Judge on: (1) is it unmistakably THIS product type, (2) size/proportion realism
  vs the real dimensions, (3) no invented features, (4) photoreal quality, (5) on-brand feel & sell.

## Global look & feel (matches the current site)
Warm **golden-hour or blue-hour** light; **South African settings** (fynbos, bushveld, Cape mountains,
coastal, indigenous planting — aloes, restios, acacias); **editorial architectural / real-estate
photography**; aspirational but real; **no people** (or one distant, tasteful figure); clean, uncluttered;
subtle brand palette cues (deep forest-teal, cream, clay). 4:3 for heroes/exteriors, 3:4 or 4:3 for
interiors. Avoid: cartoonish CGI, watermarks, on-image text/signage, fantasy scale, snow (SA context).

## Per-product plan (real dimensions in brackets — bake these into prompts)

### folding-homes — X-Fold  [5.8 × 2.48 × 2.56 m, 15 m², single-storey, flat roof]
White insulated steel wall panels, 2 PVC windows, 1 steel door, flat roof with dark trim, on a concrete
slab. Compact garden-room scale. Options shown as standard: NO plumbing, electricity only.
- HERO (exterior, 4:3): "Modern white folding container home, 5.8 m long single-storey, flat roof, two
  windows and a steel door, on a concrete slab in a lush SA garden with aloes, golden hour, real-estate photo."
- Gallery: dusk-lit with warm interior glow; wood-grain finish variant; stacked two-high on a build site;
  simple bright interior (studio room, no bathroom); the fold-out/unfold sequence (keep the existing diagram).
- Replace the OEM/watermarked/collage stragglers; keep clean real shots.

### expandable-homes  [expands to 37 / 74 m², 2–4 bed, ~11.9 × 6.3 m expanded, flat roof]
One module that opens into a WIDE family home; aluminium double-glazed windows + sliding door; on a slab.
- HERO (4:3): "Expanded prefab family home, ~12 m wide, flat roof, aluminium double-glazed windows and a
  glass sliding door, on a slab in a SA suburban garden, golden hour, real-estate photo, no people."
- Gallery: mid-expansion (one wing sliding out); 2-bed interior living/dining; bathroom; SPC floor detail;
  family-evening exterior. Keep the floor-plan diagrams.

### nature-cabins — Nature Cabin  [8.1 × 3.2 × 3.4 m, 26 m² + 1.5 × 3.2 m viewing terrace]
Timber-look steel cabin, arched/gable form, full-height glass gable end, aluminium-framed double glazing,
small viewing terrace. Includes kitchenette + bathroom.
- HERO (4:3): "Timber-clad Nature Cabin with an arched gable and full-height glass front, small viewing
  terrace, in a misty SA mountain meadow / fynbos, golden hour, warm interior glow, editorial photo."
- Gallery: two cabins on a guest farm; deck at dawn mist; cosy interior bedroom with forest view; interior
  with kitchenette; timber window detail; dusk fire pit.

### the-dome — The Dome  [Φ 4 m × 7 m long × 2.8 m high, 24.6 m², transparent PC panels]
Transparent polycarbonate igloo/dome, arched aluminium door + windows, blackout-curtain option, LED strip.
Glamping/stargazing feel.
- HERO (4:3): "Transparent geodesic glamping dome, 7 m long 4 m wide, arched aluminium door, glowing warm
  at night under a starry Karoo sky on a timber deck, luxury glamping, editorial photo, no people."
- Gallery: sunrise in fynbos; interior queen bed looking up at stars; dusk lounge; dinner on the deck.

### apple-cabins — Apple Cabin  [13 / 20 / 26.5 m², 2.25 m wide, spaceship pod]
Futuristic white curved shell, floor-to-ceiling panoramic glass on the front, angular. Eco-resort/vineyard.
Do NOT call it a "capsule" (that's a different product).
- HERO (4:3): "Futuristic white Apple Cabin pod with a curved shell and full-height panoramic glass front,
  on a low timber deck at a forest garden edge, golden hour, warm interior glow, luxury, editorial photo."
- Gallery: night glow on deck; garden-path approach; panoramic-glass interior lounge; bathroom; office nook.

### glamping-capsules — Glamping Capsule  [18.6 / 30.4 / 38 m², 3.2 m wide, 270° glazing]
Flagship luxury capsule, 270° oversized floor-to-ceiling glass, two rooms + central bathroom, optional
balcony, queen bed. Resort/vineyard/beach.
- HERO (4:3): "Luxury glamping capsule with 270-degree floor-to-ceiling curved glass, on a deck overlooking
  a SA vineyard/mountain at blue hour, warm interior glow, plunge pool, five-star resort feel, editorial photo."
- Gallery: night pool; row of capsules at dusk; panoramic bedroom with bushveld view; ensuite; sundowner deck.

### outdoor-kitchens — Outdoor Kitchen  [2.5–3.9 m long × 0.8 m deep × 2.4 m high, motorised lift-up roof]
Aluminium-shell outdoor kitchen island with a **motorised lift-up canopy roof (LED underside)**, quartz
counter, stainless sink, gas grill. Patio/braai entertaining.
- HERO (4:3): "Outdoor entertainment kitchen with a motorised lift-up canopy roof, warm LED underside,
  quartz counter, stainless sink and gas grill, on a SA patio at dusk with string lights, editorial photo."
- Gallery: braai in use at dusk; poolside patio; counter prep detail; open storage detail; morning coffee.
  (Avoid any third-party brand on screens.)
  ⚠ The CURRENT outdoor-kitchen photos all show a **green kamado grill**, which is NOT a sellable
  option (the charcoal option we sell is the **kettle grill**). Regenerate showing the actual
  options — a gas grill and/or a kettle grill — so the imagery matches what customers can buy.

### safari-tents — Safari Tent  [custom sizes, canvas tented suites, price on request]
Luxury canvas tented suite — Meru/stretch-canvas roof over a timber-framed structure, raised deck, glass
folding doors, en-suite. Bushveld lodge feel. (Owner confirmed image rights via Bushtec resale.)
- HERO (4:3): "Luxury canvas safari tent suite with a stretch-canvas roof on a raised timber deck in golden
  SA bushveld with acacias at sunset, fire pit, glass doors open to the bedroom, lodge photo, no people."
- Gallery: fire-pit dinner deck; hillside suite with plunge pool; en-suite tub; styled interior lounge.

### garages — DIY Garage Kit  [6.1 × 4 / 6.1 / 9.15 m, 3.6 m to wall, galvanised steel]  ⚠ ZERO IMAGES NOW
**This product currently has NO images at all** — breaks its hero, gallery, OG image and Product JSON-LD.
Needs a full new set under `public/images/products/garages/` + a "garages" entry in images.json.
- HERO (4:3): "Assembled galvanised-steel DIY garage kit, single 6.1 × 4 m, pitched/mono roof, roller door,
  on a concrete slab in a SA backyard, clear daylight, clean real-estate photo, no people."
- Gallery: double garage; workshop/triple with side door; flat-packed kit components on a pallet ready to
  build; garage in use (car + workbench).

## After generation
1. Save each as JPEG (~1600–2000px, q85) under `public/images/products/<slug>/`.
2. Update `src/data/images.json` (add the garages array; keep exactly one `hero:true` first per slug;
   fields src/width/height/alt/kind). Alt text: truthful, 8–16 words, product name + one SA search term.
3. `npm run build`, then re-shoot the pages and run the 3-judge 98/100 loop; regenerate any below 98.
