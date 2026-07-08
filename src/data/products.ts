/**
 * Tiny Homes SA product catalogue.
 *
 * This file is the single source of truth for product content, pricing and
 * configurator options. All prices are in ZAR and EXCLUDE VAT.
 *
 * Customisation options marked `provisional: true` carry provisional pricing —
 * they will be replaced with the real options list from company documents.
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
  price: number; // ZAR ex VAT — selling price
  /** Estimated supplier/installed cost, ZAR ex VAT. Internal only — never rendered. */
  cost?: number;
  category: OptionCategory;
  visual: VisualKey;
  /** Option only makes sense when another option is selected first. */
  requires?: string;
  /** Pricing to be confirmed by the company. */
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
      price: round(56500), // ~30% margin on researched pod cost
      cost: round(39500),
      category: "modules",
      visual: "wet-room",
      footprintM2: 2.8,
      provisional: true,
    },
    {
      id: "kitchen-unit",
      label: "Kitchen unit",
      description: "Fitted kitchenette with counter, sink, cabinet storage and space for a two-plate hob and under-counter fridge.",
      price: round(33000), // ~30% margin on researched 2.4–3 m kitchenette cost
      cost: round(23000),
      category: "modules",
      visual: "kitchen",
      footprintM2: 1.5,
      provisional: true,
    },
    {
      id: "overhead-cupboards",
      label: "Overhead cupboards",
      description: "Wall-mounted overhead cupboards above the kitchen counter for extra storage without losing floor space.",
      price: round(10000), // ~30% margin on researched cost
      cost: round(7000),
      category: "modules",
      visual: "cupboards",
      requires: "kitchen-unit",
      provisional: true,
    },
  ];
  return base.map((o) => ({ ...o, ...(overrides?.[o.id] ?? {}) }));
}

/* --------------------------------------------------------------------------
 * Researched optional extras (sources: research/pricing.md). Selling prices
 * hold ~30% margin on estimated SA supplier/installed cost — above the 25%
 * floor. All remain provisional until confirmed by the company.
 * ------------------------------------------------------------------------ */

const extra = (o: Omit<CustomOption, "provisional">): CustomOption => ({ ...o, provisional: true });

const foldingExtras: CustomOption[] = [
  extra({ id: "double-glazed-windows", label: "Double-glazed aluminium windows (pair)", description: "Replaces the two standard PVC windows with double-glazed aluminium units for better insulation and quiet.", price: 13000, cost: 9000, category: "structure", visual: "glazing" }),
  extra({ id: "sliding-door", label: "Aluminium sliding door", description: "Full-height aluminium sliding door in place of a window panel — opens the room to a deck or garden.", price: 12000, cost: 8500, category: "structure", visual: "glazing" }),
  extra({ id: "stacking-kit", label: "Two-high stacking kit", description: "Reinforced corner castings and link plates to stack a second unit on top or link units side by side.", price: 6000, cost: 4200, category: "structure", visual: "stack" }),
  extra({ id: "timber-deck", label: "Timber deck (5 m²)", description: "Treated-pine deck along the entrance side — an outdoor room for the price of a weekend away.", price: 7500, cost: 5250, category: "structure", visual: "deck" }),
  extra({ id: "exterior-cladding", label: "Wood-grain exterior cladding", description: "Wood-grain or colour cladding wrap over the standard panel exterior.", price: 25500, cost: 18000, category: "structure", visual: "none" }),
  extra({ id: "solar-kit", label: "Solar kit — 3 kW hybrid + 5 kWh battery", description: "Six 455 W panels, 3 kW hybrid inverter and 5 kWh lithium battery, installed. A big-ticket add-on that takes the whole unit off-grid.", price: 74500, cost: 52000, category: "energy", visual: "solar" }),
  extra({ id: "backup-power", label: "Plug-in backup power kit", description: "1.5–2 kVA inverter trolley with battery — keeps lights, Wi-Fi and the fridge running through load-shedding.", price: 16500, cost: 11500, category: "energy", visual: "none" }),
  extra({ id: "gas-geyser", label: "Gas geyser (12 L/min)", description: "SAQCC-compliant gas geyser installed for instant hot water without straining the electrical feed.", price: 11500, cost: 8000, category: "energy", visual: "none" }),
  extra({ id: "aircon-9k", label: "Inverter aircon (9 000 BTU)", description: "Midwall inverter split installed — heats in winter, cools in summer, sized for the 15 m² room.", price: 13000, cost: 9000, category: "comfort", visual: "aircon" }),
  extra({ id: "smart-lock", label: "Smart electronic door lock", description: "Fingerprint/keypad smart lock on the steel door — no keys to lose between guests.", price: 5500, cost: 3800, category: "comfort", visual: "none" }),
  extra({ id: "blackout-curtains", label: "Blackout curtain set", description: "Blockout curtains and rails for both windows — dark, cool sleep in summer.", price: 7000, cost: 5000, category: "comfort", visual: "curtains" }),
  extra({ id: "led-ambient", label: "LED ambient lighting package", description: "Smart RGBW strip and spot package with app control for warm, layered evening light.", price: 8000, cost: 5500, category: "comfort", visual: "none" }),
];

const expandableExtras: CustomOption[] = [
  extra({ id: "double-glazed-windows", label: "Double-glazed aluminium windows (pair)", description: "Upgrades two standard windows to double-glazed aluminium for insulation and quiet.", price: 13000, cost: 9000, category: "structure", visual: "glazing" }),
  extra({ id: "sliding-door", label: "Aluminium sliding door", description: "Full-height sliding door on the living-room wing, opening onto your stoep or garden.", price: 12000, cost: 8500, category: "structure", visual: "glazing" }),
  extra({ id: "exterior-cladding", label: "Wood-grain exterior cladding", description: "Wood-grain or colour cladding wrap over the standard exterior panels.", price: 43000, cost: 30000, category: "structure", visual: "none" }),
  extra({ id: "timber-deck", label: "Timber deck (10 m²)", description: "Treated-pine deck along the entrance side — outdoor living to match the indoor space.", price: 15000, cost: 10500, category: "structure", visual: "deck" }),
  extra({ id: "solar-kit", label: "Solar kit — 3 kW hybrid + 5 kWh battery", description: "Six 455 W panels, 3 kW hybrid inverter and 5 kWh lithium battery, installed — load-shedding-proof from day one.", price: 74500, cost: 52000, category: "energy", visual: "solar" }),
  extra({ id: "gas-geyser", label: "Gas geyser (12 L/min)", description: "SAQCC-compliant gas geyser installed for instant hot water.", price: 11500, cost: 8000, category: "energy", visual: "none" }),
  extra({ id: "aircon-12k", label: "Inverter aircon (12 000 BTU)", description: "Midwall inverter split sized for the open-plan living space.", price: 15000, cost: 10500, category: "comfort", visual: "aircon" }),
  extra({ id: "smart-lock", label: "Smart electronic door lock", description: "Fingerprint/keypad entry on the main door.", price: 5500, cost: 3800, category: "comfort", visual: "none" }),
  extra({ id: "blackout-curtains", label: "Blackout curtain set", description: "Blockout curtains and rails throughout the bedroom wing.", price: 7000, cost: 5000, category: "comfort", visual: "curtains" }),
  extra({ id: "led-ambient", label: "LED ambient lighting package", description: "Smart RGBW strip and spot package with app control.", price: 8000, cost: 5500, category: "comfort", visual: "none" }),
];

const natureExtras: CustomOption[] = [
  extra({ id: "double-glazed-window", label: "Double-glazed window upgrade", description: "Double-glazed aluminium unit in place of a standard window — worthwhile in mountain and coastal weather.", price: 6500, cost: 4500, category: "structure", visual: "glazing" }),
  extra({ id: "balcony-railing", label: "Deck railing kit", description: "Aluminium balustrade around the included 1.8 m deck for exposed or elevated sites.", price: 13000, cost: 9000, category: "structure", visual: "none" }),
  extra({ id: "solar-kit", label: "Solar kit — 3 kW hybrid + 5 kWh battery", description: "Six 455 W panels, 3 kW hybrid inverter and 5 kWh lithium battery — the full off-grid package.", price: 74500, cost: 52000, category: "energy", visual: "solar" }),
  extra({ id: "gas-geyser", label: "Gas geyser (12 L/min)", description: "Instant gas hot water for the included bathroom — ideal off-grid.", price: 11500, cost: 8000, category: "energy", visual: "none" }),
  extra({ id: "underfloor-heating", label: "Under-floor heating (21 m²)", description: "Electric under-floor heating mats with thermostat under the full cabin floor.", price: 18000, cost: 12600, category: "comfort", visual: "heating" }),
  extra({ id: "aircon-9k", label: "Inverter aircon (9 000 BTU)", description: "Midwall inverter split sized for the cabin.", price: 13000, cost: 9000, category: "comfort", visual: "aircon" }),
  extra({ id: "blackout-curtains", label: "Blackout curtain set", description: "Blockout curtains for the gable glass and windows — guests sleep past sunrise.", price: 7000, cost: 5000, category: "comfort", visual: "curtains" }),
  extra({ id: "smart-lock", label: "Smart electronic door lock", description: "Keypad/fingerprint entry — no key handovers between bookings.", price: 5500, cost: 3800, category: "comfort", visual: "none" }),
];

const domeExtras: CustomOption[] = [
  extra({ id: "underfloor-heating", label: "Under-floor heating (24.6 m²)", description: "Electric under-floor heating with thermostat — the dome stays warm on clear winter nights.", price: 21000, cost: 15000, category: "comfort", visual: "heating" }),
  extra({ id: "aircon-floor", label: "Climate unit (9 000 BTU)", description: "Discreet floor-standing inverter unit — cooling and heating without piercing the shell.", price: 13000, cost: 9000, category: "comfort", visual: "aircon", footprintM2: 0.1 }),
  extra({ id: "smart-lock", label: "Smart electronic key-lock", description: "Smart electronic key-lock on the arched door for self-check-in guests.", price: 5500, cost: 3800, category: "comfort", visual: "none" }),
  extra({ id: "backup-power", label: "Plug-in backup power kit", description: "1.5–2 kVA inverter trolley with battery for lights and essentials through load-shedding.", price: 16500, cost: 11500, category: "energy", visual: "none" }),
  extra({ id: "gas-geyser", label: "Gas geyser (12 L/min)", description: "Instant gas hot water for the bathroom unit.", price: 11500, cost: 8000, category: "energy", visual: "none" }),
];

const appleExtras: CustomOption[] = [
  extra({ id: "underfloor-heating", label: "Under-floor heating (36.8 m²)", description: "Electric under-floor heating mats with thermostat under the full cabin floor.", price: 31500, cost: 22000, category: "comfort", visual: "heating" }),
  extra({ id: "balcony-kit", label: "Balcony platform & railing", description: "Bolt-on balcony platform with aluminium balustrade along the glass wall.", price: 13000, cost: 9000, category: "structure", visual: "deck" }),
  extra({ id: "solar-kit", label: "Solar kit — 3 kW hybrid + 5 kWh battery", description: "Roof-mounted array with hybrid inverter and lithium battery (roof supports up to 4 kW).", price: 74500, cost: 52000, category: "energy", visual: "solar" }),
  extra({ id: "electric-curtains", label: "Automated electric curtains", description: "Wi-Fi motorised track across the panoramic glass — open the view from bed.", price: 8000, cost: 5600, category: "comfort", visual: "curtains" }),
  extra({ id: "led-ambient", label: "LED ambient lighting package", description: "Smart RGBW strip and spot package for evening ambience.", price: 8000, cost: 5500, category: "comfort", visual: "none" }),
];

const glampingExtras: CustomOption[] = [
  extra({ id: "underfloor-heating", label: "Under-floor heating (36.8 m²)", description: "Electric under-floor heating mats with thermostat throughout the capsule.", price: 31500, cost: 22000, category: "comfort", visual: "heating" }),
  extra({ id: "balcony-kit", label: "Balcony platform & railing", description: "The optional capsule balcony: bolt-on platform with glass-line balustrade.", price: 13000, cost: 9000, category: "structure", visual: "deck" }),
  extra({ id: "electric-curtains", label: "Automated electric curtains", description: "Wi-Fi motorised track across the 270° glazing.", price: 8000, cost: 5600, category: "comfort", visual: "curtains" }),
  extra({ id: "solar-kit", label: "Solar kit — 3 kW hybrid + 5 kWh battery", description: "Roof-mounted array with hybrid inverter and lithium battery (roof supports up to 4 kW).", price: 74500, cost: 52000, category: "energy", visual: "solar" }),
  extra({ id: "led-ambient", label: "LED ambient lighting package", description: "Smart RGBW strip and spot package for hotel-grade evening light.", price: 8000, cost: 5500, category: "comfort", visual: "none" }),
];

export const products: Product[] = [
  {
    slug: "folding-homes",
    name: "Folding Homes",
    shortName: "Folding Home",
    tagline: "From flat-pack to livable home in under 30 minutes.",
    summary:
      "The X-Fold folding home flips from flat-pack to a fully enclosed, insulated 15 m² room in minutes — the most affordable home in the Tiny Homes SA range, from R54 950 ex VAT.",
    description:
      "Folding homes are the cost-smart start to tiny living. Each X-Fold unit arrives flat on a truck and unfolds into a weather-tight, insulated home with windows, a steel door and plug-and-play electrics — two people with a cordless drill can complete setup in under 30 minutes. Waterproof, fireproof and stackable two units high, they're ideal for garden rooms, site offices, guest suites, rental units and rapid-deployment housing anywhere in South Africa.",
    startingPrice: 54950,
    sizeLabel: "15 m²",
    setupTime: "10–30 minutes",
    dims: { length: 5.8, width: 2.4, height: 2.5 },
    specs: [
      { label: "Floor area", value: "15 m²" },
      { label: "External size", value: "5.8 m × 2.4 m × 2.5 m" },
      { label: "Walls", value: "50 mm insulated, fireproof panels" },
      { label: "Setup", value: "10–30 minutes with crane and two people" },
      { label: "Doors & windows", value: "1 steel door, 2 PVC windows" },
      { label: "Electrical", value: "Pre-wired DB board, LED lights, SA sockets" },
      { label: "Stackable", value: "Up to two units high" },
      { label: "Foundation", value: "Level concrete slab or four precast plinths" },
    ],
    features: [
      "Waterproof and insulated for summer and winter",
      "Fireproof construction prevents fire spread",
      "Pre-installed electrics with DB board and LED lighting",
      "Stackable up to two units high",
      "Relocatable — fold it back up and move it",
      "Ideal for emergency and rapid-deployment housing",
    ],
    useCases: ["Garden room", "Home office", "Guest suite", "Rental unit", "Site office", "Emergency housing"],
    options: [
      ...standardOptions(0.8, {
        "wet-room": {
          label: "Plug-in shower-toilet pod",
          description: "The factory shower-toilet pod: fully plumbed shower, toilet and basin module that plugs into the unit on site.",
          photo: "/images/products/expandable-homes/installation-collage.png",
        },
      }),
      ...foldingExtras,
    ],
    faqs: [
      {
        q: "How long does it take to set up a folding home?",
        a: "Two people with a cordless drill and a crane or forklift can unfold and secure an X-Fold home in 10 to 30 minutes. It arrives with walls, windows, a door and electrics already installed.",
      },
      {
        q: "What foundation does a folding home need?",
        a: "A level concrete slab is recommended. Alternatively, four properly levelled precast plinths work on most sites.",
      },
      {
        q: "Can folding homes be moved after installation?",
        a: "Yes. As long as the factory corner castings remain intact, the unit can be folded back down, transported and redeployed.",
      },
      {
        q: "Are folding homes insulated?",
        a: "Yes — 50 mm insulated, fireproof wall panels keep the unit comfortable in both summer and winter. Upgrades like double-glazed aluminium windows are also available.",
      },
    ],
    seoKeywords: [
      "folding home South Africa",
      "flat pack home price",
      "foldable container home",
      "X-Fold tiny home",
      "affordable tiny home South Africa",
    ],
  },
  {
    slug: "expandable-homes",
    name: "Expandable Homes",
    shortName: "Expandable Home",
    tagline: "One module arrives. A whole home glides out.",
    summary:
      "Expandable homes arrive as a single compact module and glide outward on site into up to 72 m² of lounges, bedrooms and kitchens — from R200 000 ex VAT, deployed in under two hours.",
    description:
      "Expandable homes are the fastest way to put a real, full-size home on the ground. Delivered as a single 6 m or 12 m module, each home expands outward on site in under two hours, revealing insulated rooms with factory-installed electrics and plumbing. Choose a studio-sized B20 Slim or go up to the 72 m² B40 with three- or four-bedroom layouts — or order a blank-canvas shell for a restaurant or mobile office. From R200 000 ex VAT for slim versions and R330 000 fully kitted.",
    startingPrice: 200000,
    sizeLabel: "27.5 – 72 m²",
    bedrooms: "Studio to 4 bedrooms",
    setupTime: "Under 2 hours",
    dims: { length: 11.8, width: 6.22, height: 2.48 },
    specs: [
      { label: "Sizes", value: "27.5 m² to 72 m²" },
      { label: "Deployment", value: "Glides open on site in under 2 hours" },
      { label: "Walls", value: "50 mm insulated, fireproof panels" },
      { label: "Layouts", value: "Studio, 1, 2, 3 or 4 bedrooms — or open shell" },
      { label: "Utilities", value: "Electrics & plumbing factory-installed" },
      { label: "Power", value: "40 A electrical feed required" },
      { label: "Water", value: "22 mm water line within 3 m" },
      { label: "Foundation", value: "Level concrete slab or precast plinths" },
    ],
    features: [
      "Full home delivered as one compact module",
      "Expands on site in under two hours",
      "Repositionable doors and windows",
      "Multiple exterior colours and timber finishes",
      "Pre-designed multi-bedroom layouts available",
      "Blank-shell versions for restaurants, offices and shops",
    ],
    useCases: ["Family home", "Granny flat", "Farm cottage", "Restaurant or café", "Office", "Guest lodge"],
    variants: [
      { id: "b20-slim", name: "B20 Slim", size: "27.5 m²", price: 200000, description: "Studio-size shell with basic finishes — the affordable entry point." },
      { id: "b20", name: "B20", size: "37 m²", price: 330000, description: "Fully kitted one-bedroom layout with kitchen and bathroom." },
      { id: "b40-slim", name: "B40 Slim", size: "48 m²", price: 450000, description: "Long-format shell with generous open-plan living space. Indicative price — confirmed on your quote." },
      { id: "b40", name: "B40", size: "72 m²", price: 600000, description: "Fully specced family home with three- or four-bedroom layouts." },
    ],
    options: [
      ...standardOptions(1, {
        "wet-room": {
          label: "Wet room unit / upgrade",
          description: "Adds a fully plumbed bathroom module to the Slim shells — on the fully kitted B20 and B40 this upgrades the included bathroom's fittings and finishes.",
          photo: "/images/products/expandable-homes/interior-lounge.jpg",
          footprintVariantIds: ["b20-slim", "b40-slim"], // only the Slim shells gain a new module footprint
        },
        "kitchen-unit": {
          label: "Kitchen unit / upgrade",
          description: "Adds a fitted kitchenette to the Slim shells — on the fully kitted B20 and B40 this upgrades the included kitchen's counters and cabinetry.",
          photo: "/images/products/expandable-homes/interior-living-room.png",
          footprintVariantIds: ["b20-slim", "b40-slim"], // only the Slim shells gain a new module footprint
        },
      }),
      ...expandableExtras,
    ],
    faqs: [
      {
        q: "How big can an expandable home get?",
        a: "The range runs from the 27.5 m² B20 Slim studio to the 72 m² B40 with layouts of up to four bedrooms. Slim shells start from R200 000 ex VAT and fully kitted homes from R330 000 ex VAT.",
      },
      {
        q: "How long does installation take?",
        a: "The module glides outward on site in under two hours — the crew fully extends, levels and weather-seals the wings the same day it arrives.",
      },
      {
        q: "What services do I need on site?",
        a: "A level concrete slab or precast plinths, a 40 A electrical feed, and a 22 mm water line within 3 m of the unit.",
      },
      {
        q: "How much does delivery cost?",
        a: "Delivery within South Africa averages R6 000 to R22 000 per unit depending on distance, current diesel rates and abnormal-load permits.",
      },
    ],
    seoKeywords: [
      "expandable home South Africa",
      "expandable container house price",
      "prefab home Gauteng",
      "3 bedroom prefab home",
      "granny flat prefab",
    ],
  },
  {
    slug: "nature-cabins",
    name: "Nature Cabins",
    shortName: "Nature Cabin",
    tagline: "The warmth of timber. The strength of steel.",
    summary:
      "A 21 m² retreat plus deck that drops lightly into beach, bush or mountain sites — the warm look of timber with the durability and convenience of steel, from R375 000 ex VAT.",
    description:
      "Nature cabins are built for places worth waking up in. Each 21 m² cabin pairs the warm look of timber — in a choice of natural wood grain or white colour-printed steel — with a tough steel structure, arriving with a 1.8 m deck that drops lightly into beach, bush or mountain sites. Inside, a light-filled space with a fully equipped bathroom included makes it a natural fit for guest farms, lodges, Airbnb hosts and anyone carving out a retreat on their own land.",
    startingPrice: 375000,
    sizeLabel: "21 m² + deck",
    setupTime: "3 days",
    dims: { length: 6.3, width: 3.2, height: 3.25 },
    specs: [
      { label: "Floor area", value: "21 m² plus 1.8 m deck" },
      { label: "External size", value: "6.3 m × 3.2 m × 3.25 m + 1.8 m deck" },
      { label: "Structure", value: "Steel frame and colour-printed steel panels" },
      { label: "Exterior finish", value: "Natural wood grain or white" },
      { label: "Bathroom", value: "Fully equipped bathroom included" },
      { label: "Installation", value: "3 working days on a prepared site" },
    ],
    features: [
      "Warm timber look with steel durability",
      "Included 1.8 m deck for outdoor living",
      "Fully equipped bathroom as standard",
      "Designed for off-grid solar and water setups",
      "Weather-resistant in coastal and bushveld conditions",
      "Turnkey interior options for hospitality use",
    ],
    useCases: ["Guest farm unit", "Airbnb cabin", "Bush retreat", "Coastal getaway", "Backyard studio", "Lodge accommodation"],
    options: [
      ...standardOptions(1.2, {
        "wet-room": {
          label: "Premium wet room upgrade",
          description: "Upgrades the included fully equipped bathroom with premium finishes, fittings and a rainfall shower.",
          footprintM2: undefined, // finish upgrade of the included bathroom — no new floor consumed
        },
      }),
      ...natureExtras,
    ],
    faqs: [
      {
        q: "Where can a nature cabin be installed?",
        a: "Nature cabins suit beach, bush and mountain sites. Water, electricity and groundwork connections need to be prepared in advance — we confirm the exact site requirements for your cabin when you order.",
      },
      {
        q: "Are nature cabins good for Airbnb and guest farms?",
        a: "Yes — the 21 m² layout plus deck is designed for hospitality use, with a fully equipped bathroom included and turnkey interior options that make it easy to run as guest accommodation.",
      },
      {
        q: "Can a nature cabin run off-grid?",
        a: "Yes. The cabins are designed to pair with solar power, gas geysers and rainwater tanks for fully off-grid operation.",
      },
    ],
    seoKeywords: [
      "nature cabin South Africa",
      "timber cabin prefab price",
      "Airbnb cabin South Africa",
      "off-grid cabin",
      "steel frame cabin",
    ],
  },
  {
    slug: "the-dome",
    name: "The Dome",
    shortName: "Dome",
    tagline: "A curved, transparent space that brings the outdoors in.",
    summary:
      "A beautifully curved, panoramic living space for luxury glamping, boutique dining and unforgettable stays — 24.6 m² of transparent architecture from R180 000 ex VAT.",
    description:
      "The Dome is a beautifully curved, light-filled structure that dissolves the line between inside and out. Its anti-UV polycarbonate panels, arched aluminium doors and windows, and blackout curtain system create a comfortable, private cocoon with panoramic views of sky and landscape — ideal for luxury glamping, boutique dining, lounges and standout Airbnb stays. Professional installation takes just 2–3 days.",
    startingPrice: 180000,
    sizeLabel: "24.6 m²",
    setupTime: "2–3 days",
    dims: { length: 7, width: 4, height: 2.8 },
    specs: [
      { label: "Internal space", value: "24.6 m²" },
      { label: "Size", value: "4 m diameter × 7 m length × 2.8 m height" },
      { label: "Terrace", value: "1.8 m outdoor terrace" },
      { label: "Panels", value: "PC dome panels with anti-UV coating" },
      { label: "Structure", value: "Internal steel lining, silicone-sealed joints" },
      { label: "Doors & windows", value: "Arched aluminium with physical locks" },
      { label: "Lighting", value: "LED system with Bluetooth controller & amplifier" },
      { label: "Curtains", value: "Customisable blackout curtains on tracks" },
    ],
    features: [
      "Panoramic transparent dome with anti-UV coating",
      "Blackout curtain system for privacy and sleep",
      "LED lighting with Bluetooth audio built in",
      "Arched aluminium doors and windows with locks",
      "Off-grid compatible with solar and water solutions",
      "Professional installation in 2–3 days",
    ],
    useCases: ["Luxury glamping", "Boutique dining", "Airbnb experience", "Guest accommodation", "Garden lounge", "Private retreat"],
    options: [
      ...standardOptions(1, {
        "upgraded-walls": {
          label: "Automated electric curtains",
          description: "Upgrades the blackout curtain system to an automated electric track — open the whole dome to the view at the touch of a button.",
          category: "interior",
          visual: "curtains",
          price: 8000,
          cost: 5600,
          photo: "/images/products/the-dome/interior-bedroom.jpg",
        },
        "premium-insulation": {
          label: "Wind-proof kit & reinforced base",
          description: "Robust wind-proof kit with prefabricated connectors and a reinforced, insulated base for exposed sites.",
        },
        "wet-room": {
          label: "Integrated bathroom unit",
          description: "Factory-fitted bathroom unit with shower, toilet and basin, plumbed and ready to connect on site.",
          photo: "/images/products/the-dome/exterior-dome-render.png",
        },
      }),
      ...domeExtras,
    ],
    faqs: [
      {
        q: "Does The Dome get hot in the South African sun?",
        a: "The polycarbonate panels carry an anti-UV coating and the blackout curtain system lets you control light and heat throughout the day.",
      },
      {
        q: "How long does The Dome take to install?",
        a: "Professional installation takes 2 to 3 days on a prepared site with pre-connected water, electricity and groundwork.",
      },
      {
        q: "What is The Dome used for?",
        a: "Most owners run it as luxury glamping or boutique hospitality — guest accommodation, dining spaces, lounges and standout Airbnb listings.",
      },
    ],
    seoKeywords: [
      "glamping dome South Africa",
      "geodesic dome price",
      "transparent dome accommodation",
      "stargazing dome",
      "dome house South Africa",
    ],
  },
  {
    slug: "apple-cabins",
    name: "Apple Cabins",
    shortName: "Apple Cabin",
    tagline: "Spaceship looks. Five-star comfort.",
    summary:
      "A spaceship-inspired 36.8 m² cabin wrapped in 180° panoramic glass, with rainfall shower, stone vanity, climate control and smart-lock entry — from R550 000 ex VAT.",
    description:
      "Apple Cabins bring futuristic architecture to eco-resorts, vineyards and safari sites. The angular shell and curved, floor-to-ceiling glass on three sides flood the two-room interior with light and frame 180-degree views. Inside: a rainfall shower, stone vanity, climate control, fitted kitchen and smart-lock entry, with multi-layer insulation, HVAC and geyser included. Delivered in modular segments and bolted together on a simple plinth foundation in 2–3 days.",
    startingPrice: 550000,
    sizeLabel: "36.8 m²",
    bedrooms: "2 rooms + central bathroom",
    setupTime: "2–3 days",
    // NOTE: site lists 2.2 m (transport width?) but 36.8 m² requires 3.2 m — confirm with supplier
    dims: { length: 11.5, width: 3.2, height: 2.48 },
    specs: [
      { label: "Floor area", value: "36.8 m²" },
      { label: "External size", value: "11.5 m × 3.2 m × 2.48 m" },
      { label: "Layout", value: "Two rooms with central bathroom" },
      { label: "Glazing", value: "180° floor-to-ceiling panoramic glass" },
      { label: "Bathroom", value: "Rainfall shower, stone vanity" },
      { label: "Climate", value: "HVAC system and geyser included" },
      { label: "Insulation", value: "Multi-layer thermal insulation" },
      { label: "Assembly", value: "2–3 days, four-person crew" },
    ],
    features: [
      "180-degree panoramic floor-to-ceiling glass",
      "Rainfall shower and stone vanity",
      "Kitchen area included — fitted kitchen standard in larger units",
      "Smart-lock entry and climate control",
      "Solar-ready roof (up to 4 kW) with battery options",
      "Optional balcony and under-floor heating",
    ],
    useCases: ["Eco-resort unit", "Vineyard suite", "Safari accommodation", "Airbnb flagship", "Entertainment pod", "Executive retreat"],
    options: [
      ...standardOptions(1.5, {
        "wet-room": {
          label: "Premium wet room upgrade",
          description: "Upgrade the included central bathroom with premium stone finishes, black fittings and a double rainfall shower.",
          photo: "/images/products/apple-cabins/interior-bathroom.jpg",
          footprintM2: undefined, // finish upgrade of the included bathroom — no new floor consumed
        },
        "kitchen-unit": {
          label: "Premium kitchen upgrade",
          description: "Upgrade the included kitchen with stone counters, integrated appliances and soft-close cabinetry.",
          photo: "/images/products/apple-cabins/interior-kitchenette-render.jpg",
          footprintM2: undefined, // finish upgrade of the included kitchen — no new floor consumed
        },
      }),
      ...appleExtras,
    ],
    faqs: [
      {
        q: "What is included in an Apple Cabin?",
        a: "Each cabin ships with a kitchen area (a fitted kitchen is standard in larger units), a bathroom with rainfall shower and stone vanity, HVAC climate control, geyser, smart-lock entry and full electrical and plumbing systems.",
      },
      {
        q: "Can Apple Cabins run off-grid?",
        a: "Yes — the roof supports up to 4 kW of solar and pairs with a 7 kWh lithium battery, making off-grid operation practical for remote sites.",
      },
      {
        q: "How are Apple Cabins delivered and installed?",
        a: "Cabins arrive in modular segments on flatbed trucks and bolt together on six precast concrete piers or ground screws. A crane plus a four-person crew completes assembly in 2–3 days.",
      },
    ],
    seoKeywords: [
      "apple cabin South Africa",
      "space cabin prefab",
      "panoramic glass cabin",
      "eco resort accommodation pods",
      "luxury prefab cabin price",
    ],
  },
  {
    slug: "glamping-capsules",
    name: "Glamping Capsules",
    shortName: "Glamping Capsule",
    tagline: "Sleek, future-forward suites your guests will queue for.",
    summary:
      "A premium 36.8 m² capsule with 270° panoramic glazing, rainfall shower, fitted kitchen and hotel-grade comfort — the flagship of the range, from R1 100 000 ex VAT.",
    description:
      "Glamping Capsules are the flagship of the Tiny Homes SA range — sleek, future-forward shells wrapped in 270 degrees of floor-to-ceiling glass. The two-room layout sleeps two adults in a queen bed, with a central bathroom, rainfall shower, stone vanity, fitted kitchen and HVAC throughout, plus an optional balcony. Comparable luxury pods list at R2 500 – R4 000 a night at around 60% occupancy, with most operators reaching return on investment in 18–24 months. Crane-assisted installation takes 2–3 days.",
    startingPrice: 1100000,
    sizeLabel: "36.8 m²",
    bedrooms: "2 rooms + central bathroom",
    setupTime: "2–3 days",
    dims: { length: 11.5, width: 3.2, height: 3.2 },
    specs: [
      { label: "Floor area", value: "36.8 m²" },
      { label: "External size", value: "11.5 m × 3.2 m × 3.2 m" },
      { label: "Glazing", value: "270° floor-to-ceiling panoramic glass" },
      { label: "Layout", value: "Two rooms, central bathroom, kitchen" },
      { label: "Sleeps", value: "Two adults, queen bed" },
      { label: "Foundation", value: "Six precast piers or ground screws" },
      { label: "Off-grid", value: "4 kW solar roof, 7 kWh battery, 1 500 L tank" },
      { label: "Assembly", value: "2–3 days, four-person crew + crane" },
    ],
    features: [
      "270-degree panoramic glazing floods interiors with light",
      "Rainfall shower, stone vanity and premium bathroom",
      "Fitted kitchen and HVAC climate control included",
      "Smart-lock entry and multi-layer insulation",
      "Off-grid ready: solar, battery, gas geyser, rainwater tank",
      "Proven hospitality returns — ROI in 18–24 months",
    ],
    useCases: ["Luxury lodge suite", "Vineyard accommodation", "Private estate retreat", "Premium Airbnb", "Wellness resort", "Honeymoon suite"],
    options: [
      ...standardOptions(1.8, {
        "wet-room": {
          label: "Premium wet room upgrade",
          description: "Upgrade the included central bathroom with premium stone finishes, black fittings and a double rainfall shower.",
          footprintM2: undefined, // finish upgrade of the included bathroom — no new floor consumed
        },
        "kitchen-unit": {
          label: "Premium kitchen upgrade",
          description: "Upgrade the included kitchen with stone counters, integrated appliances and soft-close cabinetry.",
          footprintM2: undefined, // finish upgrade of the included kitchen — no new floor consumed
        },
      }),
      ...glampingExtras,
    ],
    faqs: [
      {
        q: "What returns do Glamping Capsules generate?",
        a: "Comparable units achieve nightly rates of R2 500 – R4 000 at around 60% occupancy, putting most operators at return on investment within 18–24 months.",
      },
      {
        q: "What foundation does a Glamping Capsule need?",
        a: "Six precast concrete piers or ground screws. The capsule arrives in bolt-together sections and a four-person crew with a crane completes installation in 2–3 days.",
      },
      {
        q: "Can a Glamping Capsule operate off-grid?",
        a: "Yes — the roof supports a 4 kW solar array, paired with a 7 kWh lithium battery, gas geyser and a 1 500-litre rainwater tank.",
      },
    ],
    seoKeywords: [
      "glamping capsule South Africa",
      "luxury glamping pod price",
      "capsule hotel pod",
      "vineyard accommodation unit",
      "glamping investment ROI",
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
