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

/** Standard placeholder option set, priced per product tier. */
function standardOptions(tier: number, overrides?: Record<string, Partial<CustomOption>>): CustomOption[] {
  const round = (n: number) => Math.round((n * tier) / 500) * 500;
  const base: CustomOption[] = [
    {
      id: "upgraded-floors",
      label: "Upgraded flooring",
      description: "Premium wood-look vinyl plank flooring throughout, warmer underfoot and more durable than the standard finish.",
      price: round(12500),
      category: "interior",
      visual: "floors",
      provisional: true,
    },
    {
      id: "upgraded-walls",
      label: "Upgraded wall finish",
      description: "Timber-panelled interior wall cladding for a warm, architectural feel in place of the standard panels.",
      price: round(15000),
      category: "interior",
      visual: "walls",
      provisional: true,
    },
    {
      id: "premium-insulation",
      label: "Premium insulation",
      description: "Thicker multi-layer thermal insulation in the walls and roof for cooler summers, warmer winters and lower energy bills.",
      price: round(9500),
      category: "structure",
      visual: "insulation",
      provisional: true,
    },
    {
      id: "wet-room",
      label: "Wet room unit",
      description: "Fully plumbed bathroom module with shower, toilet and basin, factory-fitted and ready to connect on site.",
      price: round(56500),
      category: "modules",
      visual: "wet-room",
      footprintM2: 2.8,
      provisional: true,
    },
    {
      id: "kitchen-unit",
      label: "Kitchen unit",
      description: "Fitted kitchenette with counter, sink, cabinet storage and space for a two-plate hob and under-counter fridge.",
      price: round(33000),
      category: "modules",
      visual: "kitchen",
      footprintM2: 1.5,
      provisional: true,
    },
    {
      id: "overhead-cupboards",
      label: "Overhead cupboards",
      description: "Wall-mounted overhead cupboards above the kitchen counter for extra storage without losing floor space.",
      price: round(10000),
      category: "modules",
      visual: "cupboards",
      requires: "kitchen-unit",
      provisional: true,
    },
  ];
  return base.map((o) => ({ ...o, ...(overrides?.[o.id] ?? {}) }));
}

/* --------------------------------------------------------------------------
 * Optional extras. All remain provisional — every extra is confirmed line by
 * line on the formal quotation. Doc-sourced extras with no published price
 * are listed at 0 and quoted per site.
 * ------------------------------------------------------------------------ */

const extra = (o: Omit<CustomOption, "provisional">): CustomOption => ({ ...o, provisional: true });

const foldingExtras: CustomOption[] = [
  extra({ id: "burglar-bars", label: "Burglar bars", description: "Steel burglar bars fitted to both windows for extra peace of mind — priced on your quotation.", price: 0, category: "structure", visual: "none" }),
  extra({ id: "glass-entrance-wood-trim", label: "Glass entrance with wood-trim finish", description: "Full glass entrance with a warm wood-trim finish for a more architectural front — priced on your quotation.", price: 0, category: "structure", visual: "glazing" }),
  extra({ id: "double-glazed-windows", label: "Double-glazed aluminium windows (pair)", description: "Replaces the two standard PVC windows with double-glazed aluminium units for better insulation and quiet.", price: 13000, category: "structure", visual: "glazing" }),
  extra({ id: "sliding-door", label: "Aluminium sliding door", description: "Full-height aluminium sliding door in place of a window panel — opens the room to a deck or garden.", price: 12000, category: "structure", visual: "glazing" }),
  extra({ id: "stacking-kit", label: "Two-high stacking kit", description: "Reinforced corner castings and link plates to stack a second unit on top or link units side by side.", price: 6000, category: "structure", visual: "stack" }),
  extra({ id: "timber-deck", label: "Timber deck (5 m²)", description: "Treated-pine deck along the entrance side — an outdoor room for the price of a weekend away.", price: 7500, category: "structure", visual: "deck" }),
  extra({ id: "solar-kit", label: "Solar kit — 3 kW hybrid + 5 kWh battery", description: "Six 455 W panels, 3 kW hybrid inverter and 5 kWh lithium battery, installed. A big-ticket add-on that takes the whole unit off-grid.", price: 74500, category: "energy", visual: "solar" }),
  extra({ id: "backup-power", label: "Plug-in backup power kit", description: "1.5–2 kVA inverter trolley with battery — keeps lights, Wi-Fi and the fridge running through load-shedding.", price: 16500, category: "energy", visual: "none" }),
  extra({ id: "gas-geyser", label: "Gas geyser (12 L/min)", description: "SAQCC-compliant gas geyser installed for instant hot water without straining the electrical feed.", price: 11500, category: "energy", visual: "none" }),
  extra({ id: "aircon-9k", label: "Inverter aircon (9 000 BTU)", description: "Midwall inverter split installed — heats in winter, cools in summer, sized for the 15 m² room.", price: 13000, category: "comfort", visual: "aircon" }),
  extra({ id: "smart-lock", label: "Smart electronic door lock", description: "Fingerprint/keypad smart lock on the steel door — no keys to lose between guests.", price: 5500, category: "comfort", visual: "none" }),
  extra({ id: "blackout-curtains", label: "Blackout curtain set", description: "Blockout curtains and rails for both windows — dark, cool sleep in summer.", price: 7000, category: "comfort", visual: "curtains" }),
  extra({ id: "led-ambient", label: "LED ambient lighting package", description: "Smart RGBW strip and spot package with app control for warm, layered evening light.", price: 8000, category: "comfort", visual: "none" }),
];

const expandableExtras: CustomOption[] = [
  extra({ id: "pu-wall-panels", label: "Polyurethane wall panel upgrade", description: "Upgrades the 75 mm EPS walls to polyurethane panels for enhanced thermal insulation and improved fire-retardant performance — priced on your quotation.", price: 0, category: "structure", visual: "walls" }),
  extra({ id: "timber-deck", label: "Timber deck (10 m²)", description: "Treated-pine deck along the entrance side — outdoor living to match the indoor space.", price: 15000, category: "structure", visual: "deck" }),
  extra({ id: "solar-kit", label: "Solar kit — 3 kW hybrid + 5 kWh battery", description: "Six 455 W panels, 3 kW hybrid inverter and 5 kWh lithium battery, installed — load-shedding-proof from day one.", price: 74500, category: "energy", visual: "solar" }),
  extra({ id: "gas-geyser", label: "Gas geyser (12 L/min)", description: "SAQCC-compliant gas geyser installed for instant hot water.", price: 11500, category: "energy", visual: "none" }),
  extra({ id: "aircon-12k", label: "Inverter aircon (12 000 BTU)", description: "Midwall inverter split sized for the open-plan living space.", price: 15000, category: "comfort", visual: "aircon" }),
  extra({ id: "smart-lock", label: "Smart electronic door lock", description: "Fingerprint/keypad entry on the main door.", price: 5500, category: "comfort", visual: "none" }),
  extra({ id: "blackout-curtains", label: "Blackout curtain set", description: "Blockout curtains and rails throughout the bedroom wing.", price: 7000, category: "comfort", visual: "curtains" }),
  extra({ id: "led-ambient", label: "LED ambient lighting package", description: "Smart RGBW strip and spot package with app control.", price: 8000, category: "comfort", visual: "none" }),
];

const natureExtras: CustomOption[] = [
  extra({ id: "balcony-railing", label: "Deck railing kit", description: "Aluminium balustrade around the included 1.8 m deck for exposed or elevated sites.", price: 13000, category: "structure", visual: "none" }),
  extra({ id: "solar-kit", label: "Solar kit — 3 kW hybrid + 5 kWh battery", description: "Six 455 W panels, 3 kW hybrid inverter and 5 kWh lithium battery — the full off-grid package.", price: 74500, category: "energy", visual: "solar" }),
  extra({ id: "gas-geyser", label: "Gas geyser (12 L/min)", description: "Instant gas hot water for the included bathroom — ideal off-grid.", price: 11500, category: "energy", visual: "none" }),
  extra({ id: "underfloor-heating", label: "Under-floor heating (20.1 m²)", description: "Electric under-floor heating mats with thermostat under the full cabin floor.", price: 18000, category: "comfort", visual: "heating" }),
  extra({ id: "aircon-9k", label: "Inverter aircon (9 000 BTU)", description: "Midwall inverter split sized for the cabin.", price: 13000, category: "comfort", visual: "aircon" }),
  extra({ id: "blackout-curtains", label: "Blackout curtain set", description: "Blockout curtains for the gable glass and windows — guests sleep past sunrise.", price: 7000, category: "comfort", visual: "curtains" }),
  extra({ id: "smart-lock", label: "Smart electronic door lock", description: "Keypad/fingerprint entry — no key handovers between bookings.", price: 5500, category: "comfort", visual: "none" }),
];

const domeOptions: CustomOption[] = [
  extra({ id: "integrated-bathroom", label: "Integrated bathroom unit", description: "Factory-fitted bathroom unit with shower, toilet and basin, plumbed and ready to connect on site.", price: 56500, category: "modules", visual: "wet-room", footprintM2: 2.8, photo: "/images/products/the-dome/exterior-dome-render.png" }),
  extra({ id: "partition-wall", label: "Internal partition wall with door", description: "Divides the dome into a private bedroom and living area — priced on your quotation.", price: 0, category: "structure", visual: "walls" }),
  extra({ id: "electric-curtains", label: "Automated electric curtain system", description: "Upgrades the blackout curtain to an automated electric track — open the whole dome to the view at the touch of a button.", price: 8000, category: "comfort", visual: "curtains", photo: "/images/products/the-dome/interior-bedroom.jpg" }),
  extra({ id: "led-ambient", label: "Extended ambient lighting", description: "Extended interior and exterior ambient lighting layered over the standard LED system.", price: 8000, category: "comfort", visual: "none" }),
  extra({ id: "smart-lock", label: "Smart electronic key-lock", description: "Smart electronic key-lock on the arched door for self-check-in guests.", price: 5500, category: "comfort", visual: "none" }),
  extra({ id: "upgraded-floors", label: "Upgraded flooring", description: "Premium wood-look vinyl plank flooring throughout, warmer underfoot and more durable than the standard finish.", price: 12500, category: "interior", visual: "floors" }),
  extra({ id: "underfloor-heating", label: "Under-floor heating (24.6 m²)", description: "Electric under-floor heating with thermostat — the dome stays warm on clear winter nights.", price: 21000, category: "comfort", visual: "heating" }),
  extra({ id: "aircon-floor", label: "Climate unit (9 000 BTU)", description: "Discreet floor-standing inverter unit — cooling and heating without piercing the shell.", price: 13000, category: "comfort", visual: "aircon", footprintM2: 0.1 }),
  extra({ id: "backup-power", label: "Plug-in backup power kit", description: "1.5–2 kVA inverter trolley with battery for lights and essentials through load-shedding.", price: 16500, category: "energy", visual: "none" }),
  extra({ id: "gas-geyser", label: "Gas geyser (12 L/min)", description: "Instant gas hot water for the bathroom unit.", price: 11500, category: "energy", visual: "none" }),
];

const appleExtras: CustomOption[] = [
  extra({ id: "underfloor-heating", label: "Under-floor heating", description: "Electric under-floor heating mats with thermostat, sized to your cabin.", price: 31500, category: "comfort", visual: "heating" }),
  extra({ id: "balcony-kit", label: "Balcony platform & railing", description: "Bolt-on balcony platform with aluminium balustrade along the glass wall.", price: 13000, category: "structure", visual: "deck" }),
  extra({ id: "solar-kit", label: "Solar kit — 3 kW hybrid + 5 kWh battery", description: "Roof-mounted array with hybrid inverter and lithium battery — solar and battery systems are sized and quoted for your site.", price: 74500, category: "energy", visual: "solar" }),
  extra({ id: "electric-curtains", label: "Automated electric curtains", description: "Wi-Fi motorised track across the panoramic glass — open the view from bed.", price: 8000, category: "comfort", visual: "curtains" }),
  extra({ id: "led-ambient", label: "LED ambient lighting package", description: "Smart RGBW strip and spot package for evening ambience.", price: 8000, category: "comfort", visual: "none" }),
];

const glampingExtras: CustomOption[] = [
  extra({ id: "underfloor-heating", label: "Under-floor heating", description: "Electric under-floor heating mats with thermostat, sized to your capsule.", price: 31500, category: "comfort", visual: "heating" }),
  extra({ id: "balcony-kit", label: "Balcony platform & railing", description: "The optional capsule balcony: bolt-on platform with glass-line balustrade, removable to extend the indoor space.", price: 13000, category: "structure", visual: "deck" }),
  extra({ id: "electric-curtains", label: "Automated electric curtains", description: "Wi-Fi motorised track across the 270° glazing.", price: 8000, category: "comfort", visual: "curtains" }),
  extra({ id: "solar-kit", label: "Solar kit — 3 kW hybrid + 5 kWh battery", description: "Roof-mounted array with hybrid inverter and lithium battery — integrated solar is sized and quoted for your site.", price: 74500, category: "energy", visual: "solar" }),
  extra({ id: "led-ambient", label: "LED ambient lighting package", description: "Smart RGBW strip and spot package for hotel-grade evening light.", price: 8000, category: "comfort", visual: "none" }),
];

export const products: Product[] = [
  {
    slug: "folding-homes",
    name: "Folding Homes",
    shortName: "Folding Home",
    tagline: "Durable. Adaptable. Ready when you are.",
    summary:
      "The X-Fold folding home flips from flat-pack to a fully enclosed, insulated 15 m² room in minutes — the most affordable home in the Tiny Homes SA range, from R54 950 ex VAT, with a factory-fitted bathroom-and-kitchen option.",
    description:
      "Folding homes are the cost-smart start to tiny living: act today, be ready tomorrow. Each X-Fold unit arrives flat on a truck and unfolds into a weather-tight, insulated home with a galvanised steel frame, fire-resistant rock-wool panels, PVC windows, a steel door and pre-installed electrics — two workers complete the four-step setup in minutes. Want it move-in ready? The X-Fold with factory-fitted bathroom and kitchen is R68 900 ex VAT, and the 18 m² Flat Pack with Roof (R85 900 ex VAT) adds a pitched roof with bathroom and kitchen included. A Flat Pack without roof (5.9 × 2.9 × 2.8 m, 18 m²) is also available for tight-access sites — price on request. Waterproof, fire-resistant and stackable two units high, folding homes suit garden rooms, site offices, guest suites, rental units and rapid-deployment housing anywhere in South Africa — all backed by our 10-year guarantee.",
    startingPrice: 54950,
    sizeLabel: "15 – 18 m²",
    setupTime: "Unfolds in minutes",
    dims: { length: 5.8, width: 2.48, height: 2.56 },
    specs: [
      { label: "Floor area", value: "15 m² (18 m² Flat Pack versions)" },
      { label: "External size", value: "5.8 m × 2.48 m × 2.56 m" },
      { label: "Structure", value: "Galvanised steel frame with anti-corrosion coating" },
      { label: "Walls", value: "50 mm insulated, fireproof rock-wool panels" },
      { label: "Flooring", value: "Durable MGO board" },
      { label: "Doors & windows", value: "1 steel door, 2 PVC windows (optional burglar bars)" },
      { label: "Electrical", value: "2 SA-standard sockets, LED light & switch, DB board with earth leakage" },
      { label: "Finish", value: "White frame with grey walls, or wood-grain walls with white or black frame" },
      { label: "Stackable", value: "Up to two units high" },
      { label: "Setup", value: "Unfolds in minutes — 2 workers, 4 steps" },
      { label: "Foundation", value: "Level concrete slab or precast plinths" },
    ],
    features: [
      "Waterproof and fully insulated for summer and winter",
      "Fire-resistant panels protect occupants and adjacent units",
      "Pre-installed electrics with DB board, earth leakage and LED lighting",
      "Stackable up to two units high",
      "Relocatable — fold it back down and move it",
      "Factory-fitted bathroom and kitchen option available",
    ],
    useCases: ["Garden room", "Home office", "Guest suite", "Rental unit", "Site office", "Worker housing", "Emergency housing"],
    variants: [
      { id: "x-fold", name: "X-Fold", size: "15 m²", price: 54950, description: "Weather-tight folding unit with pre-installed electrics — bathroom and kitchen optional." },
      { id: "x-fold-bk", name: "X-Fold + bathroom & kitchen", size: "15 m²", price: 68900, description: "The same unit factory-fitted with an enclosed bathroom (shower, toilet and basin, 1.15 × 1.4 m) and a compact 1.0 × 0.5 m kitchen unit." },
      { id: "flat-pack-roof", name: "Flat Pack with Roof", size: "18 m²", price: 85900, description: "5.99 × 2.99 × 2.8 m pitched-roof version, assembled on site (not foldable) — bathroom and kitchen included, open-plan as standard." },
    ],
    options: [...standardOptions(0.8).filter((o) => o.category !== "modules"), ...foldingExtras],
    faqs: [
      {
        q: "How long does it take to set up a folding home?",
        a: "Minutes, not days. A crane or forklift offloads the unit, then two workers unfold and secure it in four simple steps — walls, windows, door and electrics arrive already installed.",
      },
      {
        q: "What foundation does a folding home need?",
        a: "A level concrete slab or properly levelled precast plinths. If you'd rather not manage that yourself, our turnkey team can prepare the groundwork while your home is being built.",
      },
      {
        q: "Can folding homes be moved after installation?",
        a: "Yes. Fold the unit back down, load it and redeploy it somewhere new — that's the whole point of the design.",
      },
      {
        q: "Are folding homes insulated?",
        a: "Yes — 50 mm insulated, fire-resistant rock-wool panels keep the unit comfortable in both summer and winter. Double-glazed aluminium window upgrades are also available.",
      },
      {
        q: "Can I get a bathroom and kitchen in a folding home?",
        a: "Yes. The X-Fold with factory-fitted bathroom and kitchen is R68 900 ex VAT, and the Flat Pack versions include a bathroom and kitchen as standard.",
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
      "A granny flat, family home or office that arrives as one compact module and opens out on site into up to 72 m² of bedrooms, bathroom and kitchen — move-in ready within hours, from R330 000 ex VAT.",
    description:
      "Expandable homes are the fastest way to put a real, full-size home on the ground — your space, your way. Delivered as a single 6 m or 12 m module, each home expands on site within hours, revealing insulated rooms with double-glazed aluminium windows and factory-installed plumbing and electrics. Fully fitted homes start with the 6m Expandable Home at R330 000 ex VAT — two bedrooms, bathroom and stainless-steel kitchen included — and go up to the 72 m² 12m Expandable Home from R600 000 with layouts up to four bedrooms. Watching the budget? The Slim 6m studio shell (no bathroom or kitchen) starts at R200 000 ex VAT. A Slim 12m shell (11.8 × 4.8 m, 55 m², no bathroom or kitchen) is also available — price on request. Pick your exterior from 107 colours and finishes, place windows and doors where you want them, and let our turnkey team handle the groundwork and connections.",
    startingPrice: 330000,
    sizeLabel: "27.5 – 72 m²",
    bedrooms: "Studio to 4 bedrooms",
    setupTime: "Expands within hours",
    dims: { length: 11.9, width: 6.3, height: 2.48 },
    specs: [
      { label: "Sizes", value: "27.5 m² to 72 m²" },
      { label: "Deployment", value: "Arrives as one module, expands on site — move-in ready within hours on a prepared site" },
      { label: "Transport size", value: "6m: 5.8 × 3.3 × 2.5 m; 12m: 12 × 2.2 × 2.5 m — compact for delivery, spacious when opened" },
      { label: "Structure", value: "Galvanised steel frame (Q235)" },
      { label: "Walls & roof", value: "75 mm EPS sandwich panel walls (Slim: 50 mm insulated walls); 50 mm EPS roof" },
      { label: "Windows & doors", value: "Aluminium double-glazed with fly screens; sliding glass and aluminium entry door" },
      { label: "Floor", value: "Water- and insect-resistant magnesium concrete composite; timber-look vinyl standard (SPC, laminate or wood upgrades)" },
      { label: "Layouts", value: "Open-plan to 4 bedrooms, including laundry, walk-in-wardrobe and office layouts" },
      { label: "Utilities", value: "Plumbing & electrical factory-installed — connect water, power and sewage on site" },
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
      { id: "b20", name: "6m Expandable Home", size: "37 m²", price: 330000, description: "6.3 × 5.9 × 2.48 m expanded. Two bedrooms as standard, with a fully fitted bathroom (toilet, sink and separate shower), kitchen, four windows and all electrics." },
      { id: "b40", name: "12m Expandable Home", size: "72 m²", price: 600000, description: "11.9 × 6.3 × 2.48 m expanded. Fully fitted bathroom and kitchen with two bedrooms standard and layouts up to four; eight double-glazed windows, plumbing and electrical included." },
      { id: "b20-slim", name: "Slim 6m", size: "27.5 m²", price: 200000, description: "5.9 × 4.8 × 2.48 m expanded. Budget studio shell with four double-glazed aluminium windows, aluminium door, two sockets and 50 mm insulated walls — no bathroom or kitchen." },
    ],
    options: [
      ...standardOptions(1, {
        "wet-room": {
          label: "Wet room unit / upgrade",
          description: "Adds a fully plumbed bathroom module to the Slim 6m shell — on the fully fitted 6m and 12m homes this upgrades the included bathroom's fittings and finishes.",
          photo: "/images/products/expandable-homes/interior-lounge.jpg",
          footprintVariantIds: ["b20-slim"], // only the Slim shell gains a new module footprint
        },
        "kitchen-unit": {
          label: "Kitchen unit / upgrade",
          description: "Adds a fitted kitchenette to the Slim 6m shell — on the fully fitted 6m and 12m homes this upgrades the included kitchen's counters and cabinetry.",
          photo: "/images/products/expandable-homes/interior-living-room.png",
          footprintVariantIds: ["b20-slim"], // only the Slim shell gains a new module footprint
        },
      }),
      ...expandableExtras,
    ],
    faqs: [
      {
        q: "How big can an expandable home get?",
        a: "From the 27.5 m² Slim 6m studio to the 72 m² 12m Expandable Home with layouts of up to four bedrooms. A Slim 12m shell (11.8 × 4.8 m, 55 m², no bathroom or kitchen) is also available — price on request.",
      },
      {
        q: "How long does installation take?",
        a: "The home arrives as one module and expands on site within hours — on a prepared site you can move in the same day. Our turnkey team can handle the groundwork, connections and handover for you.",
      },
      {
        q: "What's included as standard?",
        a: "The 6m and 12m homes include two bedrooms, a fully fitted bathroom with separate shower, a stainless-steel kitchen and factory-installed plumbing and electrics. The Slim shells are open studios without bathroom or kitchen — ideal as offices, classrooms or blank canvases.",
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
      "A 20.1 m² retreat plus 1.8 m deck that drops lightly into beach, bush or mountain sites — the warm look of timber with the strength of steel, from R385 000 ex VAT.",
    description:
      "Nature cabins are built for places worth waking up in — effortless luxury, naturally simple. Each 20.1 m² cabin pairs the warm look of timber — in natural wood grain or white colour-printed steel, with various exterior colours available — with a tough steel structure, double-glazed windows and a 1.8 m outdoor terrace that drops lightly into beach, bush or mountain sites. Inside, a light-filled space with a fully fitted bathroom included makes it the stylish, cost-effective gateway into premium capsule accommodation: eco-tourism ventures, Airbnb listings, nature retreats and private guest houses. Delivered in modular format and assembled by our team in under 3 days, with the groundwork completed beforehand.",
    startingPrice: 385000,
    sizeLabel: "20.1 m² + deck",
    setupTime: "Under 3 days",
    dims: { length: 6.3, width: 3.2, height: 3.25 },
    specs: [
      { label: "Floor area", value: "20.1 m² plus 1.8 m outdoor terrace" },
      { label: "External size", value: "6.3 m × 3.2 m × 3.25 m + 1.8 m deck" },
      { label: "Structure", value: "Steel frame with colour-printed steel panels" },
      { label: "Exterior finish", value: "Natural wood grain or white — various exterior colours available" },
      { label: "Windows", value: "Double-glazed" },
      { label: "Bathroom", value: "Fully fitted bathroom included" },
      { label: "Installation", value: "Delivered in modular format, assembled by our team in under 3 days" },
      { label: "Site", value: "Groundwork (water, electricity, sewerage, foundation) completed beforehand" },
    ],
    features: [
      "Warm timber look with steel durability",
      "Double-glazed windows as standard",
      "Included 1.8 m deck for outdoor living",
      "Fully fitted bathroom as standard",
      "Assembled by our team in under 3 days",
      "The cost-effective gateway into premium capsule accommodation",
    ],
    useCases: ["Guest farm unit", "Airbnb cabin", "Bush retreat", "Coastal getaway", "Backyard studio", "Lodge accommodation"],
    options: [
      ...standardOptions(1.2, {
        "wet-room": {
          label: "Premium wet room upgrade",
          description: "Upgrades the included fully fitted bathroom with premium finishes, fittings and a rainfall shower.",
          footprintM2: undefined, // finish upgrade of the included bathroom — no new floor consumed
        },
      }),
      ...natureExtras,
    ],
    faqs: [
      {
        q: "Where can a nature cabin be installed?",
        a: "Nature cabins suit beach, bush and mountain sites. Water, electricity, sewerage and the foundation are completed before delivery — our turnkey team can arrange the groundwork for you, and delivery is quoted separately based on your location.",
      },
      {
        q: "Are nature cabins good for Airbnb and guest farms?",
        a: "Yes — the 20.1 m² layout plus deck is designed for hospitality use, with a fully fitted bathroom and double-glazed windows as standard and turnkey interior options that make it easy to run as guest accommodation.",
      },
      {
        q: "How long does installation take?",
        a: "The cabin arrives in modular format and our team assembles it in under 3 days on a prepared site.",
      },
      {
        q: "Can a nature cabin run off-grid?",
        a: "Yes. The cabins pair well with solar power, gas geysers and rainwater tanks — we quote the right setup for your site.",
      },
      {
        q: "Is there a guarantee, and can I finance a nature cabin?",
        a: "Yes — every home we sell carries a 10-year guarantee and is backed by full after-sales support. Finance and lay-bye options are available, subject to credit approval.",
      },
    ],
    seoKeywords: [
      "nature cabin South Africa",
      "prefab cabin with bathroom",
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
    options: domeOptions,
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
      "Apple Cabins bring futuristic architecture to eco-resorts, vineyards and scenic escapes — luxury living redefined: compact, stylish, smart. The angular shell and curved, floor-to-ceiling panoramic glass flood the interior with light, while double-glazed windows and an insulated, low-maintenance build keep it comfortable year-round. Luxurious bathroom fittings are included in both sizes, with a kitchen included in the 11.5 m cabin, plus premium interior finishes with curtain tracks, smart-lock entry and integrated lighting and plumbing — plug in and you're ready. Choose the 27.2 m² Apple Cabin 8.5m from R450 000 ex VAT or the 36.8 m² Apple Cabin 11.5m at R550 000, with various sizes and designs available. Each cabin arrives fully assembled and is professionally installed — ready for occupation within hours.",
    startingPrice: 450000,
    sizeLabel: "27.2 – 36.8 m²",
    setupTime: "Ready within hours",
    dims: { length: 11.5, width: 3.2, height: 3.2 },
    specs: [
      { label: "Sizes", value: "27.2 m² (8.5 m) or 36.8 m² (11.5 m) — various sizes and designs available" },
      { label: "External size", value: "Up to 11.5 m × 3.2 m × 3.2 m" },
      { label: "Glazing", value: "Floor-to-ceiling panoramic glass with double-glazed windows" },
      { label: "Bathroom", value: "Luxurious bathroom fittings included in both sizes" },
      { label: "Kitchen", value: "Included in the 11.5 m cabin" },
      { label: "Interior", value: "Premium finishes with curtain tracks included" },
      { label: "Services", value: "Integrated lighting and plumbing — plug in and you're ready" },
      { label: "Build", value: "Insulated, low-maintenance construction with smart-lock entry" },
      { label: "Installation", value: "Arrives fully assembled — professionally installed, ready within hours" },
    ],
    features: [
      "Floor-to-ceiling panoramic glass",
      "Luxurious bathroom fittings in both sizes",
      "Kitchen included in the 11.5 m cabin",
      "Double-glazed windows and an insulated, low-maintenance build",
      "Smart-lock entry and premium interior finishes",
      "Arrives fully assembled — ready for occupation within hours",
    ],
    useCases: ["Eco-resort unit", "Airbnb getaway", "Backyard guest suite", "Scenic escape", "Stylish rental", "Vineyard suite"],
    variants: [
      { id: "apple-8-5", name: "Apple Cabin 8.5m", size: "27.2 m²", price: 450000, description: "8.5 × 3.2 × 3.2 m with luxurious bathroom fittings included." },
      { id: "apple-11-5", name: "Apple Cabin 11.5m", size: "36.8 m²", price: 550000, description: "11.5 × 3.2 × 3.2 m with luxurious bathroom fittings and a kitchen included." },
    ],
    options: [
      ...standardOptions(1.5, {
        "wet-room": {
          label: "Premium wet room upgrade",
          description: "Upgrades the included bathroom's already-luxurious fittings with premium finishes of your choice.",
          photo: "/images/products/apple-cabins/interior-bathroom.jpg",
          footprintM2: undefined, // finish upgrade of the included bathroom — no new floor consumed
        },
        "kitchen-unit": {
          label: "Kitchen unit / upgrade",
          description: "Adds a fitted kitchen to the 8.5 m cabin — on the 11.5 m it upgrades the included kitchen's counters and cabinetry.",
          photo: "/images/products/apple-cabins/interior-kitchenette-render.jpg",
          footprintVariantIds: ["apple-8-5"], // only the 8.5 m cabin gains a new module footprint
        },
      }),
      ...appleExtras,
    ],
    faqs: [
      {
        q: "What is included in an Apple Cabin?",
        a: "Luxurious bathroom fittings in both sizes, a kitchen in the 11.5 m cabin, double-glazed windows, premium interior finishes with curtain tracks, smart-lock entry and integrated lighting and plumbing — plug in and you're ready.",
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
      "Glamping dreams delivered: a two-room capsule wrapped in 270° oversized floor-to-ceiling double glazing, with premium bathroom fittings, HVAC and geyser as standard — the flagship of the range, from R1 100 000 ex VAT.",
    description:
      "Glamping Capsules are the flagship of the Tiny Homes SA range — scenic, serene luxury delivered to beaches, bush settings and vineyards. Two spacious rooms, front and back, sit either side of a central bathroom (the 11.5 m capsule adds a luxurious kitchen), each wrapped in 270-degree oversized floor-to-ceiling double-glazed windows and roomy enough for a queen bed, lounge area and full amenities. Multi-layer thermal insulation, premium bathroom fittings, complete plumbing and electrical, interior and exterior lighting, an HVAC and geyser system and intelligent front-door access all come standard, with an optional balcony that can be removed to extend the indoor space. High-tech options run from floor heating and triple-glazed skylights to smart voice control, with various designs and sizes to choose from. Each capsule is transported in sections and professionally assembled at your site — ready for immediate occupancy.",
    startingPrice: 1100000,
    sizeLabel: "27.2 – 36.8 m²",
    bedrooms: "2 rooms + central bathroom",
    setupTime: "Professional on-site assembly",
    dims: { length: 11.5, width: 3.2, height: 3.2 },
    specs: [
      { label: "Sizes", value: "27.2 m² (8.5 m) or 36.8 m² (11.5 m)" },
      { label: "External size", value: "Up to 11.5 m × 3.2 m × 3.2 m" },
      { label: "Glazing", value: "270° oversized floor-to-ceiling double-glazed windows in each room" },
      { label: "Layout", value: "Two rooms separated by a central bathroom — kitchen included in the 11.5 m" },
      { label: "Sleeps", value: "2 (8.5 m) or 2–4 (11.5 m)" },
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
      { id: "capsule-8-5", name: "Glamping Capsule 8.5m", size: "27.2 m²", price: 1100000, description: "8.5 × 3.2 × 3.2 m, sleeps 2 — two panoramic rooms around a central bathroom with luxurious fittings." },
      { id: "capsule-11-5", name: "Glamping Capsule 11.5m", size: "36.8 m²", price: 1300000, description: "11.5 × 3.2 × 3.2 m, sleeps 2–4 — luxurious kitchen and bathroom fittings included." },
    ],
    options: [
      ...standardOptions(1.8, {
        "wet-room": {
          label: "Premium wet room upgrade",
          description: "Upgrades the included central bathroom's premium fittings with finishes of your choice.",
          footprintM2: undefined, // finish upgrade of the included bathroom — no new floor consumed
        },
        "kitchen-unit": {
          label: "Kitchen unit / upgrade",
          description: "Adds a fitted kitchen to the 8.5 m capsule — on the 11.5 m it upgrades the included luxurious kitchen.",
          footprintVariantIds: ["capsule-8-5"], // only the 8.5 m capsule gains a new module footprint
        },
      }),
      ...glampingExtras,
    ],
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
      "An all-in-one outdoor entertainment kitchen with a remote-controlled motorised lift-up roof, quartz stone countertop and stainless-steel sink — four lengths from 2.5 m to 3.9 m, delivered ready to use from R159 500 ex VAT.",
    description:
      "South Africans entertain outside — the outdoor kitchen just makes it official. Press the remote and the motorised roof lifts to reveal a complete entertainment kitchen: a quartz stone countertop with a water-barrier edge and a sink cover that doubles as extra workspace, a stainless-steel sink with pull-out faucet, recessed warm or white lighting with an adjustable LED ambient strip, and rust-resistant aluminium switches and sockets. The corrosion-resistant galvanised steel frame, aluminium-alloy shell and panels and comprehensive waterproof design are built to live outdoors year-round, while the aluminium honeycomb interior panels shrug off heat and wipe clean after the braai. Plumbing and electrical are embedded, with an outdoor distribution box with leakage protection and a cement-board base. Choose from four lengths — 2.5, 2.9, 3.5 or 3.9 m — and a wide range of custom colours from white and navy to grey, charcoal and green, then tailor yours with add-ons like a gas braai grill, induction cooktop, bar fridge, range hood, outdoor audio or an illuminated 'starry sky' roof, each quoted on your quotation. From R159 500 ex VAT, delivered ready to use.",
    startingPrice: 159500,
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

/** Sum of base price + selected options for a product. */
export function configuredPrice(product: Product, selected: Partial<Record<string, boolean>>, variantId?: string): number {
  const variant = product.variants?.find((v) => v.id === variantId);
  const base = variant ? variant.price : product.startingPrice;
  return product.options.reduce((total, opt) => {
    const active = selected[opt.id] && (!opt.requires || selected[opt.requires]);
    return active ? total + opt.price : total;
  }, base);
}
