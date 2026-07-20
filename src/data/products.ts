/**
 * Tiny Homes SA product catalogue.
 *
 * This file is the single source of truth for product content, pricing and
 * configurator options. All prices are in ZAR and EXCLUDE VAT.
 *
 * Extras marked `provisional: true` carry provisional pricing that is
 * confirmed line by line on the customer's formal quotation. Doc-sourced
 * extras with no published price are listed at 0 and quoted per site.
 */

export type OptionCategory = "structure" | "interior" | "modules" | "energy" | "comfort";

/** What an option draws in the cutaway scene and floor plan. */
export type VisualKey =
  | "floors"
  | "walls"
  | "insulation"
  | "wet-room"
  | "kitchen"
  | "cupboards"
  | "solar"
  | "aircon"
  | "deck"
  | "glazing"
  | "curtains"
  | "heating"
  | "stack"
  | "none";

export interface CustomOption {
  id: string;
  label: string;
  description: string;
  price: number; // ZAR ex VAT
  /**
   * Per-m² pricing — when set, the effective price is pricePerM2 × the selected
   * variant's areaM2, so the upgrade scales with the chosen size. `price` is
   * ignored while this is set (use 0). See optionPrice().
   */
  pricePerM2?: number;
  category: OptionCategory;
  visual: VisualKey;
  /** Option only makes sense when another option is selected first. */
  requires?: string;
  /** Pricing to be confirmed on the formal quotation. */
  provisional: boolean;
  /** Manifest path of a real photo showing this option, when one exists. */
  photo?: string;
  /** Floor area the option consumes, m² — used by the floor plan space math. */
  footprintM2?: number;
  /**
   * Variants on which footprintM2 applies (the option genuinely adds the module
   * there). On other variants the same option is a finish upgrade of an included
   * room and consumes no new floor. Omit when the footprint applies everywhere.
   */
  footprintVariantIds?: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  size: string;
  price: number; // ZAR ex VAT
  /** Numeric floor area in m² — drives per-m² option pricing (see optionPrice). */
  areaM2?: number;
  description: string;
}

export interface ProductFaq {
  q: string;
  a: string;
}

export interface Product {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  /** One-paragraph summary used on cards and meta descriptions. */
  summary: string;
  /** Longer, SEO-rich body copy for the product page intro. */
  description: string;
  startingPrice: number; // ZAR ex VAT
  /**
   * No public price — quoted per project after a consultation. When true,
   * startingPrice is a 0 sentinel that must NEVER render; every price
   * derivation and "From R…" card must skip or special-case this product.
   */
  priceOnRequest?: boolean;
  sizeLabel: string;
  bedrooms?: string;
  setupTime: string;
  dims: { length: number; width: number; height: number }; // metres, external
  specs: { label: string; value: string }[];
  features: string[];
  useCases: string[];
  variants?: ProductVariant[];
  options: CustomOption[];
  faqs: ProductFaq[];
  seoKeywords: string[];
}

/* --------------------------------------------------------------------------
 * Optional extras. All remain provisional — every extra is confirmed line by
 * line on the formal quotation. Doc-sourced extras with no published price
 * are listed at 0 and quoted per site.
 * ------------------------------------------------------------------------ */

const extra = (o: Omit<CustomOption, "provisional">): CustomOption => ({ ...o, provisional: true });

const foldingExtras: CustomOption[] = [
  extra({ id: "metal-carved-board", label: "Metal carved board exterior", description: "Upgrades the standard panel exterior to a decorative metal carved board finish, in a wide choice of colours and textures.", price: 10000, category: "structure", visual: "none" }),
  extra({ id: "aluminium-window-frames", label: "Aluminium window frames", description: "Upgrades both standard PVC window frames to aluminium — R2 000 per window, two windows per unit.", price: 4000, category: "structure", visual: "glazing" }),
];

export const products: Product[] = [
  {
    slug: "folding-homes",
    name: "X-Folds",
    shortName: "X-Fold",
    tagline: "Durable. Adaptable. Ready when you are.",
    summary:
      "The X-Fold flips from flat-pack to a fully enclosed, EPS-insulated 15 m² room in minutes — the most affordable home in the Tiny Homes SA range, at R55 000 ex VAT. It arrives wired for electricity, ready for you to add plumbing locally.",
    description:
      "The X-Fold is the cost-smart start to tiny living: act today, be ready tomorrow. Each unit arrives flat on a truck and unfolds into a weather-tight 15 m² home in minutes — two workers, four steps. It comes standard with upgraded floor beams for added support, EPS insulation to keep it warmer in winter and cooler in summer, and a basic electrical setup: two plug points, a light fitting and a small DB board. The X-Fold arrives wired for electricity but without plumbing — if you'd like a bathroom or wet room, it's best to have a local installer fit one on site. Waterproof, insulated and stackable two units high, the X-Fold suits garden rooms, site offices, guest suites, rental units and rapid-deployment housing anywhere in South Africa — all at R55 000 ex VAT and backed by our 10-year guarantee.",
    startingPrice: 55000,
    sizeLabel: "15 m²",
    setupTime: "Unfolds in minutes",
    dims: { length: 5.8, width: 2.48, height: 2.56 },
    specs: [
      { label: "Floor area", value: "15 m²" },
      { label: "External size", value: "5.8 m × 2.48 m × 2.56 m" },
      { label: "Structure", value: "Steel frame with upgraded floor beams for added support" },
      { label: "Insulation", value: "EPS-insulated panels — warmer in winter, cooler in summer" },
      { label: "Doors & windows", value: "1 steel door, 2 PVC windows (aluminium-frame upgrade available)" },
      { label: "Electrical", value: "2 plug points, a light fitting and a small DB board — electricity included" },
      { label: "Plumbing", value: "None — add a bathroom or wet room with a local installer" },
      { label: "Finish", value: "White frame with grey walls, or wood-grain walls with white or black frame; optional metal carved board exterior" },
      { label: "Stackable", value: "Up to two units high" },
      { label: "Setup", value: "Unfolds in minutes — 2 workers, 4 steps" },
      { label: "Foundation", value: "Level concrete slab or precast plinths" },
    ],
    features: [
      "Upgraded floor beams for added structural support",
      "EPS insulation — warmer in winter, cooler in summer",
      "Wired for electricity: two plug points, a light fitting and a small DB board",
      "No plumbing — add a bathroom or wet room with a local installer",
      "Stackable up to two units high",
      "Relocatable — fold it back down and move it",
    ],
    useCases: ["Garden room", "Home office", "Guest suite", "Rental unit", "Site office", "Worker housing", "Emergency housing"],
    options: [...foldingExtras],
    faqs: [
      {
        q: "How long does it take to set up an X-Fold?",
        a: "Minutes, not days. A crane or forklift offloads the unit, then two workers unfold and secure it in four simple steps — walls, windows, door and electrics arrive already installed.",
      },
      {
        q: "What foundation does an X-Fold need?",
        a: "A level concrete slab or properly levelled precast plinths. If you'd rather not manage that yourself, our turnkey team can prepare the groundwork while your home is being built.",
      },
      {
        q: "Can X-Folds be moved after installation?",
        a: "Yes. Fold the unit back down, load it and redeploy it somewhere new — that's the whole point of the design.",
      },
      {
        q: "What comes standard on an X-Fold?",
        a: "Upgraded floor beams for added support, EPS insulation to keep it comfortable year-round, and a basic electrical setup — two plug points, a light fitting and a small DB board. It arrives wired for electricity but without plumbing. A metal carved board exterior finish and aluminium window frames are available upgrades.",
      },
      {
        q: "Does the X-Fold come with a bathroom or kitchen?",
        a: "No — the X-Fold arrives wired for electricity but without plumbing. If you'd like a bathroom or wet room, we recommend arranging a local installer to fit one on site.",
      },
      {
        q: "Is there a guarantee?",
        a: "Yes — every Tiny Homes SA product carries a 10-year guarantee, and we provide full after-sales support.",
      },
    ],
    seoKeywords: [
      "folding home South Africa",
      "flat pack home South Africa",
      "folding home price",
      "foldable container home",
      "X-Fold tiny home",
      "affordable tiny home South Africa",
      "tiny home finance",
    ],
  },
  {
    slug: "expandable-homes",
    name: "Expandable Homes",
    shortName: "Expandable Home",
    tagline: "Smart living — fast, flexible and future-ready.",
    summary:
      "A granny flat, family home or office that arrives as one compact module and opens out on site into up to 74 m² of bedrooms, bathroom and kitchen — move-in ready within hours, from R200 000 ex VAT.",
    description:
      "Expandable homes are the fastest way to put a real, full-size home on the ground — your space, your way. Delivered as a single module, each home expands on site within hours, revealing insulated rooms with double-glazed windows and, on the larger sizes, factory-installed plumbing and electrics. Every size comes standard with 75 mm EPS insulated walls, vinyl flooring and double-glazed windows and a door. Start with the compact 18 m² at R200 000 ex VAT, step up to the fully fitted 6m Expandable Home at R330 000 — two bedrooms, bathroom and stainless-steel kitchen included — or go all the way to the 74 m² 12m Expandable Home from R600 000 with layouts up to four bedrooms. Upgrade the walls to polyurethane insulation, the floor to waterproof SPC laminate or add a full glass front wall, and let our turnkey team handle the groundwork and connections.",
    startingPrice: 200000,
    sizeLabel: "18 – 74 m²",
    bedrooms: "2 – 4 bedrooms",
    setupTime: "Expands within hours",
    dims: { length: 11.9, width: 6.3, height: 2.48 },
    specs: [
      { label: "Sizes", value: "18 m², 37 m² or 74 m²" },
      { label: "Deployment", value: "Arrives as one module, expands on site — move-in ready within hours on a prepared site" },
      { label: "Structure", value: "Galvanised steel frame (Q235)" },
      { label: "Walls", value: "75 mm EPS insulated panels — standard (polyurethane upgrade available)" },
      { label: "Flooring", value: "Vinyl flooring — standard (waterproof SPC laminate upgrade available)" },
      { label: "Windows & doors", value: "Double-glazed (double-pane) glass windows and a door — standard" },
      { label: "Layouts", value: "Open-plan to 4 bedrooms, including laundry, walk-in-wardrobe and office layouts" },
      { label: "Utilities", value: "6m and 12m: plumbing & electrical factory-installed. 18 m²: budget shell, no bathroom or kitchen" },
      { label: "Foundation", value: "Level concrete slab or precast plinths" },
    ],
    features: [
      "Full home delivered as one compact module — expands within hours",
      "Stainless-steel kitchen and complete bathroom in the 6m and 12m models",
      "107 exterior colours and finishes — brick, timber-grain, plain or textured",
      "Window and door placement of your choice",
      "Layouts from open-plan to four bedrooms",
      "Lifespan of up to 20–25 years, with optional overhead cabinets, balcony and pitched roof",
    ],
    useCases: ["Family home", "Granny flat", "Farm cottage", "Student accommodation", "Developer projects", "Office", "Clinic or community centre", "Guest lodge"],
    variants: [
      { id: "b20-slim", name: "Compact 18 m²", size: "18 m²", areaM2: 18, price: 200000, description: "2.95 × 6.3 × 2.5 m, 18 m². The compact, budget-friendly expandable — 75 mm EPS walls, vinyl flooring, double-glazed windows and a door as standard. No bathroom or kitchen." },
      { id: "b20", name: "6m Expandable Home", size: "37 m²", areaM2: 37, price: 330000, description: "5.9 × 6.3 × 2.5 m expanded. Two bedrooms as standard, with a fully fitted bathroom (toilet, sink and separate shower), kitchen, four windows and all electrics." },
      { id: "b40", name: "12m Expandable Home", size: "74 m²", areaM2: 74, price: 600000, description: "11.8 × 6.3 × 2.5 m expanded. Fully fitted bathroom and kitchen with two bedrooms standard and layouts up to four; eight double-glazed windows, plumbing and electrical included." },
    ],
    options: [
      { id: "pu-wall-insulation", label: "Upgraded wall insulation (polyurethane)", description: "Swaps the standard 75 mm EPS wall panels for polyurethane — around 40% better insulation. Priced per m² of floor area.", price: 0, pricePerM2: 300, category: "structure", visual: "walls", provisional: false },
      { id: "spc-flooring", label: "Waterproof SPC laminate flooring", description: "Upgrades the standard vinyl to waterproof SPC stone-composite laminate. Priced per m² of floor area.", price: 0, pricePerM2: 185, category: "interior", visual: "floors", provisional: false },
      { id: "glass-front-wall", label: "Full glass front wall", description: "Replaces a front wall panel with a full-height glass wall for light and views.", price: 15000, category: "structure", visual: "glazing", provisional: false },
    ],
    faqs: [
      {
        q: "What sizes and prices are available?",
        a: "Three sizes: the compact 18 m² from R200 000 ex VAT (a budget shell, no bathroom or kitchen), the 37 m² 6m Expandable Home at R330 000 and the 74 m² 12m Expandable Home at R600 000. The 6m and 12m homes include two bedrooms, a fully fitted bathroom and a kitchen, with layouts up to four bedrooms on the 12m.",
      },
      {
        q: "How long does installation take?",
        a: "The 6m and 12m homes arrive as one module and expand on site within hours — on a prepared site you can move in the same day. The compact 18 m² ships as a single module, ready to place and connect. Our turnkey team can handle the groundwork, connections and handover for you.",
      },
      {
        q: "What's included as standard?",
        a: "Every size comes standard with 75 mm EPS insulated walls, vinyl flooring, and double-glazed glass windows and a door. The 6m and 12m homes add two bedrooms, a fully fitted bathroom with separate shower, a stainless-steel kitchen and factory-installed plumbing and electrics; the compact 18 m² is a budget shell without a bathroom or kitchen.",
      },
      {
        q: "What upgrades can I add to an expandable home?",
        a: "Three upgrades are available on every size: polyurethane wall insulation for around 40% better thermal performance (R300 per m²), waterproof SPC laminate flooring (R185 per m²), and a full glass front wall (R15 000). The per-m² upgrades scale with the size you choose.",
      },
      {
        q: "How much does delivery cost?",
        a: "Delivery is quoted separately based on distance and site accessibility — we deliver nationwide and can arrange the full turnkey installation.",
      },
      {
        q: "Can I finance an expandable home?",
        a: "Yes — finance and lay-bye options are available, subject to credit approval. You'll need a valid SA ID or passport, your latest three months' bank statements or proof of income and a good credit record; a deposit may be required depending on the unit.",
      },
    ],
    seoKeywords: [
      "expandable home South Africa",
      "expandable container home 3 bedroom",
      "expandable container house price",
      "prefab granny flat",
      "prefab home Gauteng",
      "2 bedroom expandable container home",
    ],
  },
  {
    slug: "nature-cabins",
    name: "Nature Cabins",
    shortName: "Nature Cabin",
    tagline: "Effortless luxury. Naturally simple.",
    summary:
      "A 26 m² cabin with a 1.5 × 3.2 m viewing terrace that drops lightly into beach, bush or mountain sites — the warm look of timber with the strength of steel, fully specced from R799 000 ex VAT.",
    description:
      "Nature cabins are built for places worth waking up in — effortless luxury, naturally simple. The 26 m² cabin (8.1 × 3.2 × 3.4 m) pairs the warm look of timber with a tough steel structure and a 1.5 × 3.2 m viewing terrace that drops lightly into beach, bush or mountain sites. It arrives fully specced as standard: polyurethane-insulated walls, double-glazed glass windows and doors in aluminium frames, an 18 mm cement-fibre floor finished in waterproof SPC laminate, a fully fitted bathroom, and a kitchen with a stone countertop, wash basin and induction cooker. The stylish gateway into premium capsule accommodation — eco-tourism ventures, Airbnb listings, nature retreats and private guest houses — it's delivered in modular format and assembled by our team in under 3 days, with the groundwork completed beforehand. R799 000 ex VAT.",
    startingPrice: 799000,
    sizeLabel: "26 m² + terrace",
    setupTime: "Under 3 days",
    dims: { length: 8.1, width: 3.2, height: 3.4 },
    specs: [
      { label: "Floor area", value: "26 m² plus 1.5 × 3.2 m viewing terrace" },
      { label: "External size", value: "8.1 m × 3.2 m × 3.4 m" },
      { label: "Structure", value: "Steel frame with timber-look exterior" },
      { label: "Walls", value: "Polyurethane-insulated — standard" },
      { label: "Windows & doors", value: "Double-glazed glass with aluminium frames — standard" },
      { label: "Flooring", value: "18 mm cement-fibre board with waterproof SPC laminate — standard" },
      { label: "Kitchen", value: "Stone countertop, wash basin and induction cooker — included" },
      { label: "Bathroom", value: "Fully fitted bathroom — included" },
      { label: "Terrace", value: "1.5 m × 3.2 m viewing terrace" },
      { label: "Installation", value: "Delivered in modular format, assembled by our team in under 3 days" },
      { label: "Site", value: "Groundwork (water, electricity, sewerage, foundation) completed beforehand" },
    ],
    features: [
      "Warm timber look with steel durability",
      "Polyurethane-insulated walls, double-glazed glass windows and doors in aluminium frames",
      "18 mm cement-fibre floor with waterproof SPC laminate",
      "Kitchen included — stone countertop, wash basin and induction cooker",
      "Fully fitted bathroom included",
      "1.5 × 3.2 m viewing terrace",
      "Assembled by our team in under 3 days",
    ],
    useCases: ["Guest farm unit", "Airbnb cabin", "Bush retreat", "Coastal getaway", "Backyard studio", "Lodge accommodation"],
    options: [],
    faqs: [
      {
        q: "Where can a nature cabin be installed?",
        a: "Nature cabins suit beach, bush and mountain sites. Water, electricity, sewerage and the foundation are completed before delivery — our turnkey team can arrange the groundwork for you, and delivery is quoted separately based on your location.",
      },
      {
        q: "Are nature cabins good for Airbnb and guest farms?",
        a: "Yes — the 26 m² layout plus viewing terrace is designed for hospitality use, with a fitted kitchen (stone countertop, wash basin and induction cooker), a fully fitted bathroom, polyurethane-insulated walls and double-glazed aluminium windows and doors as standard, making it easy to run as guest accommodation.",
      },
      {
        q: "What's included as standard?",
        a: "Everything: polyurethane-insulated walls, double-glazed glass windows and doors in aluminium frames, an 18 mm cement-fibre floor with waterproof SPC laminate, a fully fitted bathroom, a kitchen with a stone countertop, wash basin and induction cooker, and a 1.5 × 3.2 m viewing terrace — all in the R799 000 ex VAT price.",
      },
      {
        q: "How long does installation take?",
        a: "The cabin arrives in modular format and our team assembles it in under 3 days on a prepared site.",
      },
      {
        q: "Is there a guarantee, and can I finance a nature cabin?",
        a: "Yes — every home we sell carries a 10-year guarantee and is backed by full after-sales support. Finance and lay-bye options are available, subject to credit approval.",
      },
    ],
    seoKeywords: [
      "nature cabin South Africa",
      "prefab cabin with kitchen",
      "Airbnb cabin South Africa",
      "glamping cabin for sale",
      "steel frame cabin",
      "off-grid cabin South Africa",
    ],
  },
  {
    slug: "the-dome",
    name: "The Dome",
    shortName: "Dome",
    tagline: "Step in, look up, see everything — crystal clear comfort.",
    summary:
      "A beautifully curved, panoramic living space for upscale glamping, boutique dining and unforgettable stays — 24.6 m² of transparent architecture from R180 000 ex VAT.",
    description:
      "The Dome is a beautifully curved, light-filled structure that dissolves the line between inside and out — crystal clear comfort under the open sky. Its polycarbonate dome panels, manufactured in Germany with an anti-UV coating, sit on an internal steel lining with silicone-sealed joints and a robust wind-proof kit as standard. Arched aluminium doors and windows with physical locks, a thick colour-customisable blackout curtain on its own track, and a full LED lighting system with power converter, Bluetooth controller and amplifier complete the picture — ideal for upscale glamping resorts, boutique outdoor dining, spa pods and VIP retreats, or a private sanctuary at home. Professional installation takes just 2 days, and other sizes are available on request.",
    startingPrice: 180000,
    sizeLabel: "24.6 m²",
    setupTime: "2 days",
    dims: { length: 7, width: 4, height: 2.8 },
    specs: [
      { label: "Internal space", value: "24.6 m²" },
      { label: "Size", value: "4 m diameter × 7 m length × 2.8 m height — other sizes on request" },
      { label: "Panels", value: "PC dome panels with anti-UV coating, manufactured in Germany" },
      { label: "Structure", value: "Internal steel lining, silicone-sealed joints" },
      { label: "Wind-proofing", value: "Robust wind-proof kit with prefabricated connectors" },
      { label: "Doors & windows", value: "Arched aluminium with physical locks and connectors" },
      { label: "Lighting & sound", value: "Full LED system with power converter, Bluetooth controller & amplifier" },
      { label: "Curtains", value: "Thick blackout curtain on a curtain track — colour customisable" },
    ],
    features: [
      "Panoramic dome panels with anti-UV coating, made in Germany",
      "Blackout curtain system for privacy and sleep",
      "Full LED lighting with Bluetooth audio built in",
      "Arched aluminium doors and windows with physical locks",
      "Robust wind-proof kit with prefabricated connectors as standard",
      "Professional installation in 2 days",
    ],
    useCases: ["Upscale glamping", "Boutique outdoor dining", "Spa or lounge pod", "VIP retreat", "Private studio", "Airbnb experience"],
    options: [],
    faqs: [
      {
        q: "Does The Dome get hot in the South African sun?",
        a: "The polycarbonate panels carry an anti-UV coating and the blackout curtain system lets you control light and heat throughout the day.",
      },
      {
        q: "How long does The Dome take to install?",
        a: "Professional installation takes 2 days on a prepared site with pre-connected water, electricity and groundwork — our turnkey team can arrange the site works for you.",
      },
      {
        q: "Can The Dome have a bathroom or a separate bedroom?",
        a: "Yes — add the integrated bathroom unit (shower, toilet and basin) and an internal partition wall with door to create a private bedroom. Automated electric curtains, extended ambient lighting and a smart electronic key-lock are also available.",
      },
      {
        q: "What is The Dome used for?",
        a: "Most owners run it as upscale glamping or boutique hospitality — guest accommodation, outdoor dining, lounges, spas and standout Airbnb listings. Others keep it as a private home sanctuary or studio.",
      },
      {
        q: "Is there a guarantee, and can I finance The Dome?",
        a: "Yes — every product we sell carries a 10-year guarantee and is backed by full after-sales support. Finance and lay-bye options are available, subject to credit approval.",
      },
    ],
    seoKeywords: [
      "glamping dome South Africa",
      "geodesic dome price",
      "transparent dome accommodation",
      "stargazing dome",
      "glamping pods for sale South Africa",
    ],
  },
  {
    slug: "apple-cabins",
    name: "Apple Cabins",
    shortName: "Apple Cabin",
    tagline: "Sleek. Smart. Instantly livable.",
    summary:
      "Big living in a small package — a futuristic cabin wrapped in floor-to-ceiling panoramic glass, with luxurious bathroom fittings and smart-lock entry, arriving fully assembled and ready within hours. From R450 000 ex VAT.",
    description:
      "Apple Cabins bring futuristic architecture to eco-resorts, vineyards and scenic escapes — luxury living redefined: compact, stylish, smart. The angular shell and curved, floor-to-ceiling panoramic glass flood the interior with light, while double-glazed windows and an insulated, low-maintenance build keep it comfortable year-round. Luxurious bathroom fittings are included in all three sizes, with a kitchenette included in the 9 m and 11.8 m cabins, plus premium interior finishes with curtain tracks, smart-lock entry and integrated lighting and plumbing — plug in and you're ready. Choose the 13 m² Apple Cabin 5.8m from R450 000 ex VAT, the 20 m² Apple Cabin 9m at R550 000 or the 26.5 m² Apple Cabin 11.8m at R650 000, with various sizes and designs available. Each cabin arrives fully assembled and is professionally installed — ready for occupation within hours.",
    startingPrice: 450000,
    sizeLabel: "13 – 26.5 m²",
    setupTime: "Ready within hours",
    dims: { length: 11.8, width: 2.25, height: 2.63 },
    specs: [
      { label: "Sizes", value: "13 m² (5.8 m), 20 m² (9 m) or 26.5 m² (11.8 m) — various sizes and designs available" },
      { label: "External size", value: "Up to 11.8 m × 2.25 m × 2.63 m" },
      { label: "Glazing", value: "Floor-to-ceiling panoramic glass with double-glazed windows" },
      { label: "Bathroom", value: "Luxurious bathroom fittings included in all three sizes" },
      { label: "Kitchenette", value: "Included in the 9 m and 11.8 m cabins" },
      { label: "Interior", value: "Premium finishes with curtain tracks included" },
      { label: "Services", value: "Integrated lighting and plumbing — plug in and you're ready" },
      { label: "Build", value: "Insulated, low-maintenance construction with smart-lock entry" },
      { label: "Installation", value: "Arrives fully assembled — professionally installed, ready within hours" },
    ],
    features: [
      "Floor-to-ceiling panoramic glass",
      "Luxurious bathroom fittings in all three sizes",
      "Kitchenette included in the 9 m and 11.8 m cabins",
      "Double-glazed windows and an insulated, low-maintenance build",
      "Smart-lock entry and premium interior finishes",
      "Arrives fully assembled — ready for occupation within hours",
    ],
    useCases: ["Eco-resort unit", "Airbnb getaway", "Backyard guest suite", "Scenic escape", "Stylish rental", "Vineyard suite"],
    variants: [
      { id: "apple-5-8", name: "Apple Cabin 5.8m", size: "13 m²", price: 450000, description: "5.8 × 2.25 × 2.63 m — luxurious bathroom fittings included." },
      { id: "apple-9", name: "Apple Cabin 9m", size: "20 m²", price: 550000, description: "9 × 2.25 × 2.63 m — luxurious bathroom fittings and a kitchenette included." },
      { id: "apple-11-8", name: "Apple Cabin 11.8m", size: "26.5 m²", price: 650000, description: "11.8 × 2.25 × 2.63 m — the largest Apple cabin, with bathroom and kitchenette included." },
    ],
    options: [],
    faqs: [
      {
        q: "What is included in an Apple Cabin?",
        a: "Luxurious bathroom fittings in all three sizes, a kitchenette in the 9 m and 11.8 m cabins, double-glazed windows, premium interior finishes with curtain tracks, smart-lock entry and integrated lighting and plumbing — plug in and you're ready.",
      },
      {
        q: "How are Apple Cabins delivered and installed?",
        a: "The cabin arrives fully assembled and is professionally installed on a prepared site — ready for occupation within hours. Delivery is quoted separately based on your location and site accessibility.",
      },
      {
        q: "Can Apple Cabins run off-grid?",
        a: "They can be paired with solar and battery systems, quoted for your site — along with gas geysers and rainwater tanks for remote locations.",
      },
      {
        q: "Is there a guarantee?",
        a: "Yes — every Tiny Homes SA product carries a 10-year guarantee, and we provide full after-sales support.",
      },
    ],
    seoKeywords: [
      "apple cabin South Africa",
      "panoramic glass cabin",
      "luxury prefab cabin price",
      "eco resort accommodation pods",
      "glamping pods for sale South Africa",
    ],
  },
  {
    slug: "glamping-capsules",
    name: "Glamping Capsules",
    shortName: "Glamping Capsule",
    tagline: "Luxury in the heart of nature — the art of glamping, perfected.",
    summary:
      "Glamping dreams delivered: a two-room capsule wrapped in 270° oversized floor-to-ceiling double glazing, with premium bathroom fittings, HVAC and geyser as standard — the flagship of the range, from R690 000 ex VAT.",
    description:
      "Glamping Capsules are the flagship of the Tiny Homes SA range — scenic, serene luxury delivered to beaches, bush settings and vineyards. Two spacious rooms, front and back, sit either side of a central bathroom (the 11.5 m capsule adds a luxurious kitchen), each wrapped in 270-degree oversized floor-to-ceiling double-glazed windows and roomy enough for a queen bed, lounge area and full amenities. Multi-layer thermal insulation, premium bathroom fittings, complete plumbing and electrical, interior and exterior lighting, an HVAC and geyser system and intelligent front-door access all come standard, with an optional balcony that can be removed to extend the indoor space. High-tech options run from floor heating and triple-glazed skylights to smart voice control, with various designs and sizes to choose from. Each capsule is transported in sections and professionally assembled at your site — ready for immediate occupancy.",
    startingPrice: 690000,
    sizeLabel: "18.6 – 38 m²",
    bedrooms: "2 rooms + central bathroom",
    setupTime: "Professional on-site assembly",
    dims: { length: 11.5, width: 3.2, height: 3.2 },
    specs: [
      { label: "Sizes", value: "18.6 m² (5.85 m), 30.4 m² (9.5 m) or 38 m² (11.5 m)" },
      { label: "External size", value: "Up to 11.5 m × 3.2 m × 3.2 m" },
      { label: "Glazing", value: "270° oversized floor-to-ceiling double-glazed windows in each room" },
      { label: "Layout", value: "Two rooms separated by a central bathroom — kitchen included in the 11.5 m" },
      { label: "Sleeps", value: "2 (5.85 m and 9.5 m) or 2–4 (11.5 m)" },
      { label: "Standard", value: "Multi-layer insulation, HVAC & geyser, plumbing & electrical, interior & exterior lighting, intelligent front-door access" },
      { label: "High-tech options", value: "Smart access, floor heating, A/C, triple-glazed skylight and windows, smart voice control" },
      { label: "Assembly", value: "Transported in sections, professionally assembled on site — ready for immediate occupancy" },
    ],
    features: [
      "270° oversized double-glazed panoramic windows in each room",
      "Premium bathroom fittings — luxurious kitchen in the 11.5 m capsule",
      "HVAC and geyser system included as standard",
      "Multi-layer thermal insulation and intelligent front-door access",
      "Optional balcony — removable to extend the indoor space",
      "Customisable: floor colours, underfloor heating, integrated solar and alternate layouts",
    ],
    useCases: ["Luxury lodge suite", "Vineyard accommodation", "Beach retreat", "Bush getaway", "Premium Airbnb", "Honeymoon suite"],
    variants: [
      { id: "capsule-5-85", name: "Glamping Capsule 5.85m", size: "18.6 m²", price: 690000, description: "5.85 × 3.15 × 3.2 m — two panoramic rooms around a central bathroom, the entry to the capsule range." },
      { id: "capsule-8-5", name: "Glamping Capsule 9.5m", size: "30.4 m²", price: 850000, description: "9.5 × 3.25 × 3.2 m, sleeps 2 — two panoramic rooms around a central bathroom with luxurious fittings." },
      { id: "capsule-11-5", name: "Glamping Capsule 11.5m", size: "38 m²", price: 950000, description: "11.5 × 3.25 × 3.2 m, sleeps 2–4 — luxurious kitchen and bathroom fittings included." },
    ],
    options: [],
    faqs: [
      {
        q: "What comes standard in a Glamping Capsule?",
        a: "Multi-layer thermal insulation, premium bathroom fittings, complete plumbing and electrical, interior and exterior lighting, an HVAC and geyser system, intelligent front-door access and double-glazed windows. The 11.5 m capsule adds a luxurious kitchen.",
      },
      {
        q: "How is a Glamping Capsule delivered and installed?",
        a: "The capsule is transported in sections and professionally assembled at your site, ready for immediate occupancy. We assist with site preparation — groundwork, electrical and plumbing are completed before delivery — and delivery is quoted separately based on your location.",
      },
      {
        q: "Can I customise my capsule?",
        a: "Yes — floor colours, underfloor heating, integrated solar and alternate layouts, plus high-tech options like smart access, floor heating, A/C, a triple-glazed skylight and windows, and smart voice control. Various designs and sizes are available.",
      },
      {
        q: "Can I finance a Glamping Capsule?",
        a: "Yes — finance and lay-bye options are available, subject to credit approval, and every Tiny Homes SA product carries a 10-year guarantee.",
      },
    ],
    seoKeywords: [
      "glamping capsule South Africa",
      "luxury glamping pod price",
      "glamping pods for sale South Africa",
      "vineyard accommodation unit",
      "luxury glamping South Africa",
    ],
  },
  {
    slug: "outdoor-kitchens",
    name: "Outdoor Kitchens",
    shortName: "Outdoor Kitchen",
    tagline: "Braai, cook, host — then close the roof on the weather.",
    summary:
      "An all-in-one outdoor entertainment kitchen with a remote-controlled motorised lift-up roof, quartz stone countertop and stainless-steel sink — four lengths from 2.5 m to 3.9 m, delivered ready to use from R154 400 ex VAT.",
    description:
      "South Africans entertain outside — the outdoor kitchen just makes it official. Press the remote and the motorised roof lifts to reveal a complete entertainment kitchen: a quartz stone countertop with a water-barrier edge and a sink cover that doubles as extra workspace, a stainless-steel sink with pull-out faucet, recessed warm or white lighting with an adjustable LED ambient strip, and rust-resistant aluminium switches and sockets. The corrosion-resistant galvanised steel frame, aluminium-alloy shell and panels and comprehensive waterproof design are built to live outdoors year-round, while the aluminium honeycomb interior panels shrug off heat and wipe clean after the braai. Plumbing and electrical are embedded, with an outdoor distribution box with leakage protection and a cement-board base. Choose from four lengths — 2.5, 2.9, 3.5 or 3.9 m — and a wide range of custom colours from white and navy to grey, charcoal and green, then tailor yours with add-ons like a gas braai grill, induction cooktop, bar fridge, range hood, outdoor audio or an illuminated 'starry sky' roof, each quoted on your quotation. From R154 400 ex VAT, delivered ready to use.",
    startingPrice: 154400,
    sizeLabel: "2.5 – 3.9 m",
    setupTime: "Delivered ready to use",
    dims: { length: 2.5, width: 0.8, height: 2.4 },
    specs: [
      { label: "Sizes", value: "Four lengths — 2.5 m, 2.9 m, 3.5 m or 3.9 m (all 0.8 m deep × 2.4 m high)" },
      { label: "Weight", value: "500 – 750 kg, depending on length" },
      { label: "Roof", value: "Remote-controlled motorised lift-up roof" },
      { label: "Structure", value: "Corrosion-resistant galvanised steel frame with aluminium-alloy shell and panels" },
      { label: "Weatherproofing", value: "Comprehensive outdoor waterproof design" },
      { label: "Countertop", value: "Quartz stone with water-barrier edge; sink cover doubles as extra workspace" },
      { label: "Sink", value: "Stainless-steel sink with pull-out faucet" },
      { label: "Interior panels", value: "Aluminium honeycomb — high-temperature resistant, easy to clean" },
      { label: "Electrical", value: "Embedded plumbing & electrical; outdoor distribution box with leakage protection" },
      { label: "Lighting", value: "Recessed warm/white lighting plus adjustable LED ambient strip" },
      { label: "Switches & sockets", value: "Rust-resistant aluminium" },
      { label: "Base", value: "Cement-board base" },
      { label: "Colours", value: "Wide range of custom colours — white, navy, grey, charcoal, green and more" },
    ],
    features: [
      "Remote-controlled motorised lift-up roof — open for the braai, closed against the weather",
      "Quartz stone countertop with water-barrier edge and a sink cover for extra workspace",
      "Stainless-steel sink with pull-out faucet — plumbing and electrical embedded",
      "Corrosion-resistant galvanised steel frame with aluminium-alloy shell, waterproof throughout",
      "Recessed warm/white lighting and an adjustable LED ambient strip for evening entertaining",
      "Add-ons from gas braai grills to bar fridges and kamado grills — quoted on your quotation",
    ],
    useCases: ["Patio & braai area", "Entertainment area", "Lodge or guest farm", "Pool deck", "Developer amenity", "Garden bar"],
    variants: [
      { id: "ok-2-5", name: "2.5 m Outdoor Kitchen", size: "2.5 m", price: 154400, description: "2.5 × 0.8 × 2.4 m, approx 500 kg — the compact entertainer." },
      { id: "ok-2-9", name: "2.9 m Outdoor Kitchen", size: "2.9 m", price: 164500, description: "2.9 × 0.8 × 2.4 m, approx 600 kg." },
      { id: "ok-3-5", name: "3.5 m Outdoor Kitchen", size: "3.5 m", price: 183700, description: "3.5 × 0.8 × 2.4 m, approx 700 kg." },
      { id: "ok-3-9", name: "3.9 m Outdoor Kitchen", size: "3.9 m", price: 196800, description: "3.9 × 0.8 × 2.4 m — the largest, for serious entertaining." },
    ],
    // No configurator: outdoor kitchens have no scene or floor plan, so options
    // must stay empty (a single option would fall back to the wrong cutaway).
    options: [],
    faqs: [
      {
        q: "What's included in an outdoor kitchen?",
        a: "Every unit comes standard with the remote-controlled motorised lift-up roof, quartz stone countertop with water-barrier edge and sink cover, stainless-steel sink with pull-out faucet, aluminium honeycomb interior panels, recessed warm/white lighting with an adjustable LED ambient strip, rust-resistant aluminium switches and sockets, embedded plumbing and electrical, an outdoor distribution box with leakage protection and a cement-board base — all in a corrosion-resistant galvanised steel frame with an aluminium-alloy shell.",
      },
      {
        q: "What sizes are available?",
        a: "Four lengths: 2.5 m, 2.9 m, 3.5 m and 3.9 m — all 0.8 m deep and 2.4 m high, weighing between 500 and 750 kg. A wide range of custom colours is available, from white and navy to grey, charcoal and green.",
      },
      {
        q: "What add-ons can I get?",
        a: "A gas BBQ grill (single or dual burner), induction cooktop, bar fridge, range hood, outdoor audio, ceramic kamado grill, wall cabinet, illuminated 'starry sky' roof, stainless-steel countertop upgrade, rolling shutter door and storage rack — each quoted on your quotation. Appliance options meet international certification standards (CE).",
      },
      {
        q: "How much does delivery and installation cost?",
        a: "Delivery and installation are quoted separately based on your location and site accessibility — we deliver nationwide. The unit arrives ready to use once connected.",
      },
      {
        q: "Can I finance an outdoor kitchen?",
        a: "Yes — finance and lay-bye options are available, subject to credit approval. You'll need a valid SA ID or passport, your latest three months' bank statements or proof of income and a good credit record; a deposit may be required depending on the unit.",
      },
    ],
    seoKeywords: [
      "outdoor kitchen South Africa",
      "prefab outdoor kitchen",
      "braai area kitchen unit",
      "outdoor entertainment kitchen",
      "garden kitchen for sale",
    ],
  },
  {
    slug: "safari-tents",
    name: "Safari Tents",
    shortName: "Safari Tent",
    tagline: "Luxury under canvas, engineered for Africa.",
    summary:
      "Luxury canvas tented suites for game lodges and glamping resorts — Meru-style and curved stretch-tension canvas roofs over timber structures, with raised decks and en-suite layouts available. Every tent is configured to your site and brief, priced on request after a consultation.",
    description:
      "Safari tents are how Africa's best lodges put guests inside the landscape without giving up an inch of comfort. We supply and install luxury canvas tented suites in partnership with Bushtec, one of Africa's leading safari-tent manufacturers — Tiny Homes SA is an authorised reseller. Choose between classic Meru-style canvas and curved stretch-tension roofs over timber structures, add raised decks and en-suite layouts, and the result is a suite engineered for African conditions — sun, wind, rain and everything in between. Because no two sites or briefs are the same, there's no price list: we start with a consultation, configure every tent to your site, layout and guest experience, and give you an itemised quotation. From game lodge suites and glamping resorts to private reserves, bush camps, boutique hotels and event venues — all backed by our after-sales support.",
    startingPrice: 0, // sentinel — priceOnRequest, must never render
    priceOnRequest: true,
    sizeLabel: "Custom sizes",
    setupTime: "Quoted per project",
    dims: { length: 0, width: 0, height: 0 }, // no doc-sourced dimensions — never rendered (no configurator/floor plan)
    specs: [
      { label: "Roof styles", value: "Meru-style canvas or curved stretch-tension canvas" },
      { label: "Structure", value: "Canvas over timber structures, with raised decks available" },
      { label: "Layouts", value: "En-suite layouts available — configured to your brief" },
      { label: "Built for", value: "Engineered for African conditions" },
      { label: "Supply", value: "Supplied and installed by Tiny Homes SA with our manufacturing partner" },
      { label: "Pricing", value: "On request — itemised quotation after a consultation" },
      { label: "Lead time", value: "Quoted per project" },
    ],
    features: [
      "Meru-style and curved stretch-tension canvas roof designs",
      "Timber structures with raised decks for views and airflow",
      "En-suite layouts available for full lodge-suite comfort",
      "Engineered for African conditions — sun, wind and rain",
      "Configured to your site, brief and guest experience",
      "Backed by our full after-sales support",
    ],
    useCases: ["Game lodge suites", "Glamping resorts", "Private reserves", "Bush camps", "Boutique hotels", "Event venues"],
    options: [],
    faqs: [
      {
        q: "How does safari tent pricing work?",
        a: "Every tent is configured to your site and brief, so there's no one-size price list. We start with a consultation about your site, layout and guest experience, then send you an itemised quotation covering the tent, deck, installation and delivery.",
      },
      {
        q: "What configurations are available?",
        a: "Meru-style canvas and curved stretch-tension roofs over timber structures, with raised decks and en-suite layouts available. Each suite is configured to your brief — from a single honeymoon suite to a full camp.",
      },
      {
        q: "Where do safari tents work best?",
        a: "Game lodges, glamping resorts, private reserves, bush camps, boutique hotels and event venues — anywhere you want guests immersed in the landscape with lodge-level comfort.",
      },
      {
        q: "What is the lead time?",
        a: "Lead time is quoted per project — it depends on the configuration, the number of units and your site. We confirm the programme with your quotation.",
      },
      {
        q: "What support do I get after installation?",
        a: "Full after-sales support from our team — we stay involved long after handover.",
      },
    ],
    seoKeywords: [
      "safari tents South Africa",
      "luxury glamping tents",
      "canvas safari tent suites",
      "lodge tents South Africa",
      "Bushtec safari tents",
    ],
  },
  {
    slug: "garages",
    name: "DIY Garages",
    shortName: "Garage",
    tagline: "Flat-pack steel garages you bolt together yourself.",
    summary:
      "Galvanised-steel DIY garage kits in three sizes — single, double and triple — delivered flat-packed with everything you need to assemble a weatherproof garage or workshop yourself, from R50 000 ex VAT.",
    description:
      "DIY garage kits are the fast, affordable way to add secure, weatherproof storage — a garage, workshop or store-room you build yourself. Each kit is delivered flat-packed with a galvanised-steel frame, wall and roof sheeting, fixings and instructions, sized to bolt together on a level slab over a weekend. Choose from three sizes: the 6.1 × 4 m single garage (24.4 m²) from R50 000 ex VAT, the 6.1 × 6.1 m double (37.2 m²) at R85 000, or the 6.1 × 9.15 m triple/workshop (55.8 m²) at R105 000 — all 3.6 m to the wall. Delivered nationwide, with slab and assembly available from our turnkey team.",
    startingPrice: 50000,
    sizeLabel: "24.4 – 55.8 m²",
    setupTime: "Self-assembly kit",
    dims: { length: 9.15, width: 6.1, height: 3.6 },
    specs: [
      { label: "Sizes", value: "6.1 × 4 m (24.4 m²), 6.1 × 6.1 m (37.2 m²) or 6.1 × 9.15 m (55.8 m²)" },
      { label: "Wall height", value: "3.6 m" },
      { label: "Weight", value: "From approx 590 kg (6.1 × 4 m kit)" },
      { label: "Structure", value: "Galvanised steel frame with steel wall and roof sheeting" },
      { label: "Delivery", value: "Flat-packed for self-assembly on a level slab" },
      { label: "Foundation", value: "Level concrete slab — by you or our turnkey team" },
    ],
    features: [
      "Flat-packed DIY kit — assemble it yourself over a weekend",
      "Galvanised steel frame and sheeting — weatherproof and low-maintenance",
      "Three sizes: single, double and triple/workshop",
      "3.6 m wall height for vehicles, storage or a workshop",
      "Delivered nationwide",
      "Turnkey slab and assembly available on request",
    ],
    useCases: ["Garage", "Workshop", "Storeroom", "Farm store", "Carport enclosure", "Site store"],
    variants: [
      { id: "garage-6x4", name: "Single Garage Kit (6.1 × 4 m)", size: "24.4 m²", price: 50000, description: "6.1 × 4 × 3.6 m single garage kit, approx 590 kg — flat-packed for self-assembly." },
      { id: "garage-6x6", name: "Double Garage Kit (6.1 × 6.1 m)", size: "37.2 m²", price: 85000, description: "6.1 × 6.1 × 3.6 m double garage kit — flat-packed for self-assembly." },
      { id: "garage-6x9", name: "Triple / Workshop Kit (6.1 × 9.15 m)", size: "55.8 m²", price: 105000, description: "6.1 × 9.15 × 3.6 m triple garage or workshop kit — flat-packed for self-assembly." },
    ],
    options: [],
    faqs: [
      { q: "Do I assemble the garage myself?", a: "Yes — the kit is delivered flat-packed with the frame, sheeting, fixings and instructions to bolt together on a level slab. Our turnkey team can prepare the slab and assemble it for you if you prefer." },
      { q: "What foundation does a garage kit need?", a: "A level concrete slab sized to the kit. We can quote the groundwork separately." },
      { q: "What sizes are available?", a: "Three: 6.1 × 4 m (24.4 m²), 6.1 × 6.1 m (37.2 m²) and 6.1 × 9.15 m (55.8 m²), all 3.6 m to the wall." },
    ],
    seoKeywords: ["DIY garage kit South Africa", "steel garage kit price", "flat pack garage", "prefab garage South Africa", "double garage kit"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const productSlugs = products.map((p) => p.slug);

/** Visual layers implied by the active options (dependents count only when their requirement is met). */
export function activeVisuals(
  product: Product,
  selected: Partial<Record<string, boolean>>,
): Partial<Record<VisualKey, boolean>> {
  const visuals: Partial<Record<VisualKey, boolean>> = {};
  for (const opt of product.options) {
    const active = selected[opt.id] && (!opt.requires || selected[opt.requires]);
    if (active && opt.visual !== "none") visuals[opt.visual] = true;
  }
  return visuals;
}

/** Effective price of an option — per-m² options scale with the selected variant's floor area. */
export function optionPrice(opt: CustomOption, areaM2?: number): number {
  if (opt.pricePerM2 != null && areaM2 != null) return Math.round(opt.pricePerM2 * areaM2);
  return opt.price;
}

/** Sum of base price + selected options for a product. */
export function configuredPrice(product: Product, selected: Partial<Record<string, boolean>>, variantId?: string): number {
  const variant = product.variants?.find((v) => v.id === variantId);
  const base = variant ? variant.price : product.startingPrice;
  const areaM2 = variant?.areaM2;
  return product.options.reduce((total, opt) => {
    const active = selected[opt.id] && (!opt.requires || selected[opt.requires]);
    return active ? total + optionPrice(opt, areaM2) : total;
  }, base);
}
