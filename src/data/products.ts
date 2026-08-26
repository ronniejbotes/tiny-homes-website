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
   * Per-m² pricing, when set, the effective price is pricePerM2 × the selected
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
  /** Floor area the option consumes, m², used by the floor plan space math. */
  footprintM2?: number;
  /**
   * Variants on which footprintM2 applies (the option genuinely adds the module
   * there). On other variants the same option is a finish upgrade of an included
   * room and consumes no new floor. Omit when the footprint applies everywhere.
   */
  footprintVariantIds?: string[];
  /** Variants this option is offered on. Omit to offer it on every variant. */
  availableVariantIds?: string[];
  /** Options sharing an exclusiveGroup are mutually exclusive, only one can be on. */
  exclusiveGroup?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  size: string;
  price: number; // ZAR ex VAT
  /** Numeric floor area in m², drives per-m² option pricing (see optionPrice). */
  areaM2?: number;
  description: string;
}

export interface ProductFaq {
  q: string;
  a: string;
}

/**
 * One thing the product is actually bought for, written as a search term
 * rather than a brand word.
 *
 * The catalogue names ("X-Fold", "Apple Cabin") are ours, not the market's,
 * nobody types them into Google. People search for the job: a site office, a
 * granny flat, staff accommodation, a wendy house. Each entry pairs that term
 * with a paragraph explaining how this product does that job, which is what
 * gives a search engine something to rank and a reader something to weigh.
 */
export interface UseCase {
  /** The search term itself: becomes the card's heading. */
  title: string;
  /** How this product serves that job. Must stay true to the spec above. */
  body: string;
}

export interface Product {
  slug: string;
  name: string;
  shortName: string;
  /**
   * Page heading. The catalogue name plus the generic noun people search for
   * ("X-Fold folding homes", not "X-Folds"), so the H1 carries a term with
   * demand behind it. Falls back to `name`.
   */
  h1?: string;
  /**
   * Title tag, led by the use case rather than the brand name. Falls back to
   * the generated "<name> from <price>". Kept short, the root layout appends
   * " | Tiny Homes SA" (16 chars) to whatever this is.
   */
  seoTitle?: string;
  tagline: string;
  /** One-paragraph summary used on cards and meta descriptions. */
  summary: string;
  /** Longer, SEO-rich body copy for the product page intro. */
  description: string;
  startingPrice: number; // ZAR ex VAT
  /**
   * No public price: quoted per project after a consultation. When true,
   * startingPrice is a 0 sentinel that must NEVER render; every price
   * derivation and "From R…" card must skip or special-case this product.
   */
  priceOnRequest?: boolean;
  /**
   * Trade only: offered to businesses and hospitality operators (lodges,
   * resorts, hotels, event venues), never sold to a member of the public and
   * never orderable through the site.
   *
   * This is a harder rule than `priceOnRequest`, which only says the price is
   * quoted rather than published. A trade-only product must be kept out of
   * every ordering surface — the quote builder's picker and its deep links —
   * and it is not kept at the showroom, so it must also stay out of the
   * viewing booker's "what would you like to see?" list. Viewings are arranged
   * one at a time by email (`site.safariTentsEmail`).
   */
  tradeOnly?: boolean;
  sizeLabel: string;
  bedrooms?: string;
  setupTime: string;
  dims: { length: number; width: number; height: number }; // metres, external
  specs: { label: string; value: string }[];
  features: string[];
  useCases: UseCase[];
  variants?: ProductVariant[];
  options: CustomOption[];
  faqs: ProductFaq[];
  seoKeywords: string[];
}

/* --------------------------------------------------------------------------
 * Optional extras. All remain provisional, every extra is confirmed line by
 * line on the formal quotation. Doc-sourced extras with no published price
 * are listed at 0 and quoted per site.
 * ------------------------------------------------------------------------ */

const extra = (o: Omit<CustomOption, "provisional">): CustomOption => ({ ...o, provisional: true });

const foldingExtras: CustomOption[] = [
  extra({ id: "metal-carved-board", label: "Metal carved board exterior", description: "Replaces the standard panel exterior with metal carved board, in a wide choice of colours and textures. It also resists salt-air corrosion, so it is required on coastal sites.", price: 9900, category: "structure", visual: "none" }),
  extra({ id: "aluminium-window-frames", label: "Aluminium window frames", description: "Upgrades both standard PVC window frames to aluminium, at R1 950 per window, two windows per unit.", price: 3900, category: "structure", visual: "glazing" }),
];

export const products: Product[] = [
  {
    slug: "folding-homes",
    name: "X-Folds",
    shortName: "X-Fold",
    h1: "X-Fold folding homes",
    seoTitle: "Folding Homes South Africa from R54 900",
    tagline: "Durable. Adaptable. Ready when you are.",
    summary:
      "The X-Fold flips from flat-pack to a fully enclosed, EPS-insulated 15 m² room in minutes. It's the most affordable home in the Tiny Homes SA range, at R54 900 ex VAT. It arrives wired for electricity, ready for you to add plumbing locally.",
    description:
      "The X-Fold is the cost-smart start to tiny living: act today, be ready tomorrow. Each unit arrives flat on a truck and unfolds into a weather-tight 15 m² home in minutes: two workers, four steps. It comes standard with upgraded floor beams for added support, EPS insulation to keep it warmer in winter and cooler in summer, and a basic electrical setup: two plug points, a light fitting and a small DB board. The X-Fold arrives wired for electricity but without plumbing. If you'd like a bathroom or wet room, it's best to have a local installer fit one on site. Waterproof, insulated and stackable two units high, the X-Fold suits garden rooms, site offices, guest suites, rental units and rapid-deployment housing anywhere in South Africa, all at R54 900 ex VAT and backed by our 1-year limited guarantee.",
    startingPrice: 54900,
    sizeLabel: "15 m²",
    setupTime: "Unfolds in minutes",
    dims: { length: 5.8, width: 2.48, height: 2.56 },
    specs: [
      { label: "Floor area", value: "15 m²" },
      { label: "External size", value: "5.8 m × 2.48 m × 2.56 m" },
      { label: "Structure", value: "Steel frame with upgraded floor beams for added support" },
      { label: "Insulation", value: "EPS-insulated panels: warmer in winter, cooler in summer" },
      { label: "Doors & windows", value: "1 steel door, 2 PVC windows (aluminium-frame upgrade available)" },
      { label: "Electrical", value: "2 plug points, a light fitting and a small DB board, electricity included" },
      { label: "Plumbing", value: "None. Add a bathroom or wet room with a local installer" },
      { label: "Finish", value: "White frame with grey walls, or wood-grain walls with white or black frame; metal carved board exterior available, and required on coastal sites" },
      { label: "Stackable", value: "Up to two units high" },
      { label: "Setup", value: "Unfolds in minutes: 2 workers, 4 steps" },
      { label: "Foundation", value: "Level concrete slab or precast plinths" },
    ],
    features: [
      "Upgraded floor beams for added structural support",
      "EPS insulation: warmer in winter, cooler in summer",
      "Wired for electricity: two plug points, a light fitting and a small DB board",
      "No plumbing. Add a bathroom or wet room with a local installer",
      "Stackable up to two units high",
      "Relocatable: fold it back down and move it",
    ],
    useCases: [
      {
        title: "Site office",
        body: "Two workers unfold an X-Fold into a weather-tight 15 m² site office in minutes, so the project office is open the day the unit lands instead of a fortnight later. Two plug points, a light fitting and a small DB board arrive already wired. When the job finishes, fold it back down and send it to the next site.",
      },
      {
        title: "Staff accommodation and living quarters",
        body: "A 15 m² insulated room for on-site staff, farm workers or construction and mining crews. EPS panels keep it warmer in winter and cooler in summer, and units stack two high where ground space is tight. It ships wired but without plumbing, so ablutions are either a shared block or a local plumber's fit-out.",
      },
      {
        title: "Wendy house alternative",
        body: "A steel-framed, EPS-insulated alternative to a timber or nutec wendy house, at a price that overlaps the premium nutec end of that market. The difference is what arrives: a finished, insulated, wired room that unfolds in minutes rather than a kit built up on site, and one you can fold down and take with you if you move.",
      },
      {
        title: "Garden room and home office",
        body: "A separate 15 m² room at the bottom of the garden, far enough from the house to take calls in. It needs a level slab or precast plinths and no council-scale building work, and the electrics are already in: two plugs, a light and a small DB board ready to connect.",
      },
      {
        title: "Guest room or rental unit",
        body: "An insulated spare room for guests, a lodger or a backyard rental. It arrives finished inside, and adding a shower and toilet through a local installer turns it into a self-contained let. The X-Fold itself carries electrics only.",
      },
      {
        title: "Emergency and rapid-deployment housing",
        body: "Where shelter is needed in days rather than months, X-Folds ship flat, stack on a truck and unfold in four steps with two people and no specialist crew. Stackable two high, relocatable, and priced at R54 900 ex VAT per unit for volume deployment.",
      },
      {
        title: "Secure storeroom",
        body: "A lockable, weatherproof, insulated 15 m² store for tools, stock or equipment on a farm, yard or site. The steel frame and steel door take daily use, and the whole unit folds down and moves when the operation does.",
      },
    ],
    options: [...foldingExtras],
    faqs: [
      {
        q: "How long does it take to set up an X-Fold?",
        a: "Minutes, not days. We arrange the crane or forklift that offloads the unit, quoted with your delivery, then two workers unfold and secure it in four simple steps: walls, windows, door and electrics arrive already installed.",
      },
      {
        q: "What foundation does an X-Fold need?",
        a: "A level concrete slab or properly levelled precast plinths. In Gauteng, if you'd rather not manage that yourself, our turnkey team can prepare the groundwork while your home is being built. Elsewhere the groundwork is arranged by you.",
      },
      {
        q: "Can X-Folds be moved after installation?",
        a: "Yes. Fold the unit back down, load it and redeploy it somewhere new. That's the whole point of the design.",
      },
      {
        q: "What comes standard on an X-Fold?",
        a: "Upgraded floor beams for added support, EPS insulation to keep it comfortable year-round, and a basic electrical setup: two plug points, a light fitting and a small DB board. It arrives wired for electricity but without plumbing. A metal carved board exterior finish and aluminium window frames are available upgrades, and near the coast the metal carved board is required, because standard panels corrode in salt air.",
      },
      {
        q: "Does the X-Fold come with a bathroom or kitchen?",
        a: "No. The X-Fold arrives wired for electricity but without plumbing. If you'd like a bathroom or wet room, we recommend arranging a local installer to fit one on site.",
      },
      {
        q: "Is there a guarantee?",
        a: "Yes. Every Tiny Homes SA product carries a 1-year limited guarantee, and we provide full after-sales support.",
      },
      {
        q: "Can I finance an X-Fold?",
        a: "Yes. Finance is available through a third-party provider, subject to credit approval. You'll need a valid SA ID or passport, your latest three months' bank statements or proof of income and a good credit record.",
      },
    ],
    seoKeywords: [
      "folding home South Africa",
      "flat pack home South Africa",
      "site office for sale South Africa",
      "staff accommodation units South Africa",
      "living quarters prefab",
      "wendy house alternative",
      "park home South Africa",
      "garden office South Africa",
      "foldable container home",
      "affordable tiny home South Africa",
    ],
  },
  {
    slug: "expandable-homes",
    name: "Expandable Homes",
    shortName: "Expandable Home",
    h1: "Expandable prefab homes",
    seoTitle: "Granny Flats South Africa from R199 900",
    tagline: "Smart living, fast, flexible and future-ready.",
    summary:
      "A granny flat, family home or office that arrives as one compact module and expands on site into as much as 74 m² of living space, with bedrooms, bathroom and kitchen included, move-in ready within hours, from R199 900 ex VAT.",
    description:
      "Expandable homes are the fastest way to put a real, full-size home on the ground: your space, your way. Delivered as a single module, each home expands on site within hours, revealing insulated rooms with double-glazed windows and factory-installed plumbing and electrics. Every size comes standard with 75 mm EPS insulated walls, vinyl flooring and double-glazed windows and a door. Start with the compact 18 m² at R199 900 ex VAT, an open-plan space with a bathroom and a small basic kitchen, then step up to the fully fitted 6m Expandable Home at R329 900 with two bedrooms, bathroom and stainless-steel kitchen included, or go all the way to the 74 m² 12m Expandable Home from R599 900 with layouts up to four bedrooms. Upgrade the walls to polyurethane insulation, the floor to waterproof SPC laminate or add a full glass front wall.",
    startingPrice: 199900,
    sizeLabel: "18 – 74 m²",
    bedrooms: "Open plan – 4 bedrooms",
    setupTime: "Expands within hours",
    dims: { length: 12, width: 6.3, height: 2.5 },
    specs: [
      { label: "Sizes", value: "18 m², 37 m² or 74 m²" },
      { label: "Deployment", value: "Arrives as one module, expands on site, move-in ready within hours on a prepared site" },
      { label: "Structure", value: "Galvanised steel frame (Q235)" },
      { label: "Walls", value: "75 mm EPS insulated panels, standard (polyurethane metal carved board upgrade available, required on coastal sites)" },
      { label: "Flooring", value: "Timber-look vinyl on a magnesium concrete composite floor, standard (waterproof SPC laminate upgrade available)" },
      { label: "Windows & doors", value: "Aluminium double-glazed windows with fly screens and a sliding glass entry door, standard" },
      { label: "Layouts", value: "Open-plan to 4 bedrooms, including laundry, walk-in-wardrobe and office layouts" },
      { label: "Utilities", value: "Plumbing and electrical factory-installed on every size" },
      { label: "Bathroom & kitchen", value: "Included on every size: the 18 m² has a bathroom and small basic kitchen; the 6m and 12m add a full stainless-steel kitchen" },
      { label: "Foundation", value: "Level concrete slab or precast plinths" },
    ],
    features: [
      "Full home delivered as one compact module, expanding within hours",
      "Bathroom and kitchen included on every size, with a full stainless-steel kitchen in the 6m and 12m models",
      "107 exterior colours and finishes: brick, timber-grain, plain or textured",
      "Window and door placement of your choice",
      "Layouts from open-plan to four bedrooms",
    ],
    useCases: [
      {
        title: "Granny flat",
        body: "Building a granny flat conventionally in Gauteng runs roughly R11 000 to R15 000 per m², which puts a 50 m² unit somewhere between R550 000 and R750 000 before it is furnished. A 74 m² expandable home is R599 900 ex VAT with two to four bedrooms, a fitted bathroom and a full stainless-steel kitchen already in it, and it expands on site within hours rather than tying up the garden for months.",
      },
      {
        title: "Family home",
        body: "A complete house delivered as one module: up to 74 m², layouts to four bedrooms, a fully fitted bathroom with a separate shower, a stainless-steel kitchen, and plumbing and electrics installed in the factory. On a prepared slab you can move in the same day it arrives.",
      },
      {
        title: "Farm cottage and farmworker housing",
        body: "Insulated, double-glazed housing that reaches remote farms as a single load and opens out within hours, with no local build crew to organise. The compact 18 m² starts at R199 900 ex VAT with its own bathroom and small kitchen; the 37 m² adds two bedrooms and a full kitchen for R329 900.",
      },
      {
        title: "Staff accommodation and living quarters",
        body: "Self-contained units for mine, lodge, security or estate staff, each with its own bathroom and kitchen, so there is no shared ablution block to build. 75 mm EPS insulated walls come standard, upgradeable to polyurethane for roughly 40% better thermal performance on hot or cold sites.",
      },
      {
        title: "Student accommodation",
        body: "Repeatable, self-contained rooms for private student housing, delivered as modules and expanded on site so a block goes up in a fraction of a conventional programme. Layouts run from open-plan to four bedrooms, and 107 exterior finishes let a scheme match what is already there.",
      },
      {
        title: "Site office and project office",
        body: "A 37 m² or 74 m² office that expands within hours and arrives with plumbing, electrics, double glazing and a bathroom, closer to a permanent office than a site cabin. Office layouts are available alongside the residential ones, and a full glass front wall can be added for a reception frontage.",
      },
      {
        title: "Clinic, classroom or community centre",
        body: "A serviced, insulated building for a rural clinic, classroom or community hall, on the ground within hours of arrival. Bathroom plumbing is factory-installed, window and door placement is yours to choose, and layouts adapt to consulting rooms or an open hall.",
      },
      {
        title: "Developer and rental projects",
        body: "Predictable unit costs and a fixed factory build make expandable homes straightforward to repeat across a rental or resort scheme. Order in volume, take delivery in phases, and finish each unit identically, from R199 900 ex VAT per unit, delivered nationwide.",
      },
    ],
    variants: [
      { id: "b20-slim", name: "Compact 18 m²", size: "18 m²", areaM2: 18, price: 199900, description: "2.95 × 6.3 × 2.5 m, 18 m². The compact, budget-friendly expandable: an open-plan space with a bathroom and a small basic kitchen, plus 75 mm EPS walls, vinyl flooring, double-glazed windows and a door as standard." },
      { id: "b20", name: "6m Expandable Home", size: "37 m²", areaM2: 37, price: 329900, description: "5.8 × 6.3 × 2.5 m expanded, 5.8 × 3.3 × 2.5 m folded for transport. Two bedrooms as standard, with a fully fitted bathroom (toilet, sink and separate shower), kitchen, four windows and all electrics." },
      { id: "b40", name: "12m Expandable Home", size: "74 m²", areaM2: 74, price: 599900, description: "12 × 6.3 × 2.5 m expanded, 12 × 2.2 × 2.5 m folded for transport. Fully fitted bathroom and kitchen with two bedrooms standard and layouts up to four; eight double-glazed windows, plumbing and electrical included." },
    ],
    options: [
      { id: "pu-wall-insulation", label: "Upgraded wall insulation (polyurethane)", description: "Swaps the standard 75 mm EPS wall panels for polyurethane metal carved board, for around 40% better insulation. The metal carved board also resists salt-air corrosion, so it is required on coastal sites. Priced per m² of floor area.", price: 0, pricePerM2: 300, category: "structure", visual: "walls", provisional: false },
      { id: "spc-flooring", label: "Waterproof SPC laminate flooring", description: "Upgrades the standard vinyl to waterproof SPC stone-composite laminate. Priced per m² of floor area.", price: 0, pricePerM2: 185, category: "interior", visual: "floors", provisional: false },
      { id: "glass-front-wall", label: "Full glass front wall", description: "Replaces a front wall panel with a full-height glass wall for light and views.", price: 14900, category: "structure", visual: "glazing", provisional: false },
    ],
    faqs: [
      {
        q: "What sizes and prices are available?",
        a: "Three sizes: the compact 18 m² from R199 900 ex VAT (open plan, with a bathroom and a small basic kitchen), the 37 m² 6m Expandable Home at R329 900 and the 74 m² 12m Expandable Home at R599 900. The 6m and 12m homes include two bedrooms, a fully fitted bathroom and a full stainless-steel kitchen, with layouts up to four bedrooms on the 12m.",
      },
      {
        q: "How long does installation take?",
        a: "The 6m and 12m homes arrive as one module and expand on site within hours. On a prepared site you can move in the same day. The compact 18 m² ships as a single module, ready to place and connect.",
      },
      {
        q: "What's included as standard?",
        a: "Every size comes standard with 75 mm EPS insulated walls, vinyl flooring, double-glazed glass windows and a door, a bathroom and factory-installed plumbing and electrics. The compact 18 m² is open plan with a bathroom and a small basic kitchen; the 6m and 12m homes add two bedrooms, a fully fitted bathroom with separate shower and a full stainless-steel kitchen.",
      },
      {
        q: "What upgrades can I add to an expandable home?",
        a: "Three upgrades are available on every size: polyurethane wall insulation for around 40% better thermal performance (R300 per m²), waterproof SPC laminate flooring (R185 per m²), and a full glass front wall (R14 900). The per-m² upgrades scale with the size you choose.",
      },
      {
        q: "How much does delivery cost?",
        a: "Delivery is quoted separately based on distance and site accessibility. We deliver nationwide and can arrange the full turnkey installation.",
      },
      {
        q: "Can I finance an expandable home?",
        a: "Yes. Finance is available through a third-party provider, subject to credit approval. You'll need a valid SA ID or passport, your latest three months' bank statements or proof of income and a good credit record; a deposit may be required depending on the unit.",
      },
      {
        q: "Is an expandable home the same as a granny pod?",
        a: "In practice, yes. A granny pod is a self-contained second dwelling in the garden of an existing house, and it is one of the most common things an expandable home is bought for. Every size is self-contained, with its own bathroom and kitchen, so nobody has to share the main house: the compact 18 m² from R199 900 ex VAT, or the 37 m² and 74 m² homes, which add two bedrooms, a fully fitted bathroom and a full stainless-steel kitchen and expand on site within hours.",
      },
    ],
    seoKeywords: [
      "prefab granny flat South Africa",
      "granny flat cost South Africa",
      "expandable home South Africa",
      "expandable container home 3 bedroom",
      "farm cottage prefab",
      "staff accommodation units for sale",
      "student accommodation modular units",
      "prefab home Gauteng",
      "modular classroom clinic South Africa",
      "2 bedroom expandable container home",
    ],
  },
  {
    slug: "nature-cabins",
    name: "Nature Cabins",
    shortName: "Nature Cabin",
    h1: "Nature cabins",
    seoTitle: "Airbnb Cabins South Africa from R810 900",
    tagline: "Effortless luxury. Naturally simple.",
    summary:
      "A 21 m² cabin with a 1.5 × 3.2 m viewing terrace, 26 m² in total, that drops lightly into beach, bush or mountain sites, pairing the warm look of timber with the strength of steel, with kitchen, Midea air conditioning and a storage geyser included, from R810 900 ex VAT.",
    description:
      "Nature cabins are built for places worth waking up in: effortless luxury, naturally simple. The cabin gives 21 m² of enclosed floor, and with its 1.5 × 3.2 m viewing terrace it measures 8.1 × 3.2 × 3.4 m overall: 26 m² of total floor space including the terrace. It pairs the warm look of timber with a tough steel structure and a terrace that drops lightly into beach, bush or mountain sites. Nothing is left on the options list: it arrives fully specced as standard with polyurethane-insulated walls, double-glazed glass windows and doors in aluminium frames, an 18 mm cement-fibre floor finished in waterproof SPC laminate, a fully fitted bathroom, a kitchen with a stone countertop, wash basin and induction cooker, Midea air conditioning and a 40–60 L storage electric water heater. The stylish gateway into premium capsule accommodation for eco-tourism ventures, Airbnb listings, nature retreats and private guest houses, it now arrives as a fully built unit that needs only its final connections to services on site. Delivery is by oversized cargo truck, so the site has to be reachable without 4x4 access, and the groundwork and final connections are arranged by the client beforehand. R810 900 ex VAT.",
    startingPrice: 810900,
    sizeLabel: "21 m² + terrace",
    /** Owner-confirmed 2026-08-04: units are now imported fully built, so there
     *  is no on-site assembly programme. The old "under 3 days" figure is
     *  superseded and must not reappear in copy, FAQs or brochures. */
    setupTime: "Delivered fully built",
    dims: { length: 8.1, width: 3.2, height: 3.4 },
    specs: [
      { label: "Floor area", value: "21 m² cabin plus a 1.5 × 3.2 m viewing terrace: 26 m² in total" },
      { label: "External size", value: "8.1 m × 3.2 m × 3.4 m" },
      { label: "Structure", value: "Steel frame with timber-look exterior" },
      { label: "Walls", value: "Polyurethane-insulated, standard" },
      { label: "Interior finish", value: "White wall boards as standard; bamboo boards available on request. The cabin is not clad in timber inside" },
      { label: "Windows & doors", value: "Double-glazed glass with aluminium frames, standard" },
      { label: "Flooring", value: "18 mm cement-fibre board with waterproof SPC laminate, standard" },
      { label: "Kitchen", value: "Stone countertop, wash basin and induction cooker, included" },
      { label: "Bathroom", value: "Fully fitted bathroom, included" },
      { label: "Air conditioning", value: "Midea air conditioning, included as standard" },
      { label: "Hot water", value: "40–60 L storage electric water heater, included as standard" },
      { label: "Terrace", value: "1.5 m × 3.2 m viewing terrace, included in the 26 m² total" },
      { label: "Installation", value: "Arrives as a fully built unit; only the final connections to services are needed on site" },
      { label: "Site", value: "Groundwork (water, electricity, sewerage, foundation) and the final connections are arranged by the client" },
      { label: "Site access", value: "Delivered by oversized cargo truck. Sites reachable only by 4x4 cannot be serviced" },
    ],
    features: [
      "Warm timber look with steel durability",
      "Polyurethane-insulated walls, double-glazed glass windows and doors in aluminium frames",
      "18 mm cement-fibre floor with waterproof SPC laminate",
      "Kitchen included: stone countertop, wash basin and induction cooker",
      "Fully fitted bathroom included",
      "Midea air conditioning and a 40–60 L storage electric water heater included as standard",
      "1.5 × 3.2 m viewing terrace",
      "Arrives fully built: only the final connections to services remain",
    ],
    useCases: [
      {
        title: "Airbnb and self-catering unit",
        body: "A guest unit that arrives able to earn from the first booking: fitted bathroom, kitchen with a stone countertop and induction cooker, air conditioning and a 40–60 L geyser all included as standard, with nothing left on an options list to budget for later.",
      },
      {
        title: "Guest farm and farm cottage",
        body: "A 21 m² cabin with a 1.5 × 3.2 m viewing terrace, delivered as a fully built unit that needs only its final connections once the groundwork is in. Timber looks with a steel structure behind it, which is what makes it viable on working land rather than just pretty.",
      },
      {
        title: "Bush retreat",
        body: "Polyurethane-insulated walls and double-glazed aluminium-framed glazing hold their temperature through bushveld heat and cold nights, with Midea air conditioning included. It sits lightly enough to drop into a site without a conventional build programme.",
      },
      {
        title: "Coastal getaway",
        body: "A steel-framed cabin finished for exposure, with double-glazed glass and a waterproof SPC laminate floor over an 18 mm cement-fibre board. The terrace is oriented for the view, and coastal sites are specified for salt air on quotation.",
      },
      {
        title: "Lodge accommodation",
        body: "Repeatable guest suites for an existing lodge, each self-contained with its own bathroom and kitchen so the main building carries less. Because every unit arrives fully built, disruption to trading guests stays short.",
      },
      {
        title: "Backyard studio",
        body: "A fully serviced 21 m² studio at the end of the garden, with bathroom, kitchen, air conditioning and hot water included, for a home office, a teenager, or a long-stay guest who needs their own front door.",
      },
    ],
    options: [],
    faqs: [
      {
        q: "Where can a nature cabin be installed?",
        a: "Nature cabins suit beach, bush and mountain sites. Water, electricity, sewerage and the foundation are the client's responsibility and must be completed before delivery, along with the final connections once the cabin is placed. Delivery is by oversized cargo truck, so the site has to be reachable without 4x4 access, and it is quoted separately based on your location.",
      },
      {
        q: "Are nature cabins good for Airbnb and guest farms?",
        a: "Yes. The 21 m² layout plus its viewing terrace, 26 m² in total, is designed for hospitality use, with a fitted kitchen (stone countertop, wash basin and induction cooker), a fully fitted bathroom, Midea air conditioning, a 40–60 L storage electric water heater, polyurethane-insulated walls and double-glazed aluminium windows and doors as standard, making it easy to run as guest accommodation.",
      },
      {
        q: "What's included as standard?",
        a: "Everything: polyurethane-insulated walls, double-glazed glass windows and doors in aluminium frames, an 18 mm cement-fibre floor with waterproof SPC laminate, a fully fitted bathroom, a kitchen with a stone countertop, wash basin and induction cooker, Midea air conditioning, a 40–60 L storage electric water heater and a 1.5 × 3.2 m viewing terrace, all in the R810 900 ex VAT price.",
      },
      {
        q: "How long does installation take?",
        a: "There is no on-site assembly programme. The cabin arrives as a fully built unit, so once it is placed on a prepared site only the final connections to water, electricity and sewerage remain, and those are arranged by the client.",
      },
      {
        q: "Is there a guarantee, and can I finance a nature cabin?",
        a: "Yes. Every home we sell carries a 1-year limited guarantee and is backed by full after-sales support. Finance is available through a third-party provider, subject to credit approval.",
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
    slug: "apple-cabins",
    name: "Apple Cabins",
    shortName: "Apple Cabin",
    h1: "Apple cabins",
    seoTitle: "Resort Pods South Africa from R449 900",
    tagline: "Sleek. Smart. Instantly livable.",
    summary:
      "Big living in a small package: a futuristic cabin wrapped in floor-to-ceiling panoramic glass, with luxurious bathroom fittings and smart-lock entry, arriving fully assembled and ready within hours. From R449 900 ex VAT.",
    description:
      "Apple Cabins bring futuristic architecture to eco-resorts, vineyards and scenic escapes. Luxury living redefined: compact, stylish, smart. The angular shell and curved, floor-to-ceiling panoramic glass flood the interior with light, while double-glazed windows and an insulated, low-maintenance build keep it comfortable year-round. Luxurious bathroom fittings are included in all three sizes, with a kitchenette included in the 9 m and 11.8 m cabins, plus premium interior finishes with curtain tracks, smart-lock entry and integrated lighting and plumbing: plug in and you're ready. Choose the 13 m² Apple Cabin 5.8m from R449 900 ex VAT, the 20 m² Apple Cabin 9m at R549 900 or the 26.5 m² Apple Cabin 11.8m at R649 900, with various sizes and designs available. Each cabin arrives fully assembled and is professionally installed, ready for occupation within hours.",
    startingPrice: 449900,
    sizeLabel: "13 – 26.5 m²",
    setupTime: "Ready within hours",
    dims: { length: 11.8, width: 2.25, height: 2.63 },
    specs: [
      { label: "Sizes", value: "13 m² (5.8 m), 20 m² (9 m) or 26.5 m² (11.8 m), with various sizes and designs available" },
      { label: "External size", value: "Up to 11.8 m × 2.25 m × 2.63 m" },
      { label: "Glazing", value: "Floor-to-ceiling panoramic glass with double-glazed windows" },
      { label: "Bathroom", value: "Luxurious bathroom fittings included in all three sizes" },
      { label: "Kitchenette", value: "Included in the 9 m and 11.8 m cabins" },
      { label: "Interior", value: "Premium finishes with curtain tracks included" },
      { label: "Services", value: "Integrated lighting and plumbing: plug in and you're ready" },
      { label: "Build", value: "Insulated, low-maintenance construction with smart-lock entry" },
      { label: "Installation", value: "Arrives fully assembled and professionally installed, ready within hours" },
    ],
    features: [
      "Floor-to-ceiling panoramic glass",
      "Luxurious bathroom fittings in all three sizes",
      "Kitchenette included in the 9 m and 11.8 m cabins",
      "Double-glazed windows and an insulated, low-maintenance build",
      "Smart-lock entry and premium interior finishes",
      "Arrives fully assembled, ready for occupation within hours",
    ],
    useCases: [
      {
        title: "Eco-resort unit",
        body: "Curved floor-to-ceiling panoramic glass is the reason guests book a pod rather than a room, and it is what an Apple Cabin leads with. Each arrives fully assembled and is professionally installed, ready for occupation within hours, so a resort adds keys without a building site.",
      },
      {
        title: "Glamping pod",
        body: "A hard-shell, insulated alternative to canvas that trades in all year and locks: double glazing, smart-lock entry, integrated lighting and plumbing, and luxurious bathroom fittings in all three sizes. From 13 m² at R449 900 ex VAT up to 26.5 m² at R649 900.",
      },
      {
        title: "Airbnb and short-stay rental",
        body: "A listing that photographs unlike anything else on the platform, with the bathroom fittings included on every size and a kitchenette on the 9 m and 11.8 m cabins. Plug it in and it is ready to let.",
      },
      {
        title: "Vineyard and wine estate suite",
        body: "Angular architecture and panoramic glazing aimed straight at the view across the vines, on a footprint from 2.25 m wide that fits between established plantings. Premium interior finishes and curtain tracks come as standard.",
      },
      {
        title: "Backyard guest suite",
        body: "A self-contained guest suite with its own bathroom and smart-lock entry, delivered fully assembled so the garden is disrupted for hours rather than months. The 5.8 m cabin fits 13 m² into a compact plot.",
      },
      {
        title: "Scenic escape and off-site retreat",
        body: "An insulated, low-maintenance shell built to sit somewhere remote and beautiful without constant upkeep. Double-glazed and comfortable year-round, and installed professionally on arrival.",
      },
    ],
    variants: [
      { id: "apple-5-8", name: "Apple Cabin 5.8m", size: "13 m²", price: 449900, description: "5.8 × 2.25 × 2.63 m, with luxurious bathroom fittings included." },
      { id: "apple-9", name: "Apple Cabin 9m", size: "20 m²", price: 549900, description: "9 × 2.25 × 2.63 m, with luxurious bathroom fittings and a kitchenette included." },
      { id: "apple-11-8", name: "Apple Cabin 11.8m", size: "26.5 m²", price: 649900, description: "11.8 × 2.25 × 2.63 m, the largest Apple cabin, with bathroom and kitchenette included." },
    ],
    options: [],
    faqs: [
      {
        q: "What is included in an Apple Cabin?",
        a: "Luxurious bathroom fittings in all three sizes, a kitchenette in the 9 m and 11.8 m cabins, double-glazed windows, premium interior finishes with curtain tracks, smart-lock entry and integrated lighting and plumbing: plug in and you're ready.",
      },
      {
        q: "How are Apple Cabins delivered and installed?",
        a: "The cabin arrives fully assembled and is professionally installed on a prepared site, ready for occupation within hours. Delivery is quoted separately based on your location and site accessibility.",
      },
      {
        q: "Can Apple Cabins run off-grid?",
        a: "They can be paired with solar and battery systems, quoted for your site, along with gas geysers and rainwater tanks for remote locations.",
      },
      {
        q: "Is there a guarantee?",
        a: "Yes. Every Tiny Homes SA product carries a 1-year limited guarantee, and finance is available through a third-party provider, subject to credit approval.",
      },
    ],
    seoKeywords: [
      "apple cabin South Africa",
      "panoramic glass cabin",
      "luxury prefab cabin price",
      "eco resort accommodation pods",
      "luxury pod cabin South Africa",
    ],
  },
  {
    slug: "glamping-capsules",
    name: "Glamping Capsules",
    shortName: "Glamping Capsule",
    h1: "Glamping capsules",
    seoTitle: "Glamping Pods South Africa from R689 900",
    tagline: "Luxury in the heart of nature: the art of glamping, perfected.",
    summary:
      "Glamping dreams delivered: capsules wrapped in 270° oversized floor-to-ceiling double glazing, with the bathroom, its premium fittings and a geyser standard on every model, in a core range from R689 900 ex VAT and a more premium Space range with a much longer options list.",
    description:
      "Glamping Capsules are the flagship of the Tiny Homes SA range: scenic, serene luxury delivered to beaches, bush settings and vineyards. Rooms sit either side of the bathroom, each wrapped in 270-degree oversized floor-to-ceiling double-glazed windows and roomy enough for a queen bed, lounge area and full amenities. Multi-layer thermal insulation, premium bathroom fittings, complete plumbing and electrical, interior and exterior lighting, a geyser and intelligent front-door access all come standard, with the kitchen and air conditioning offered as extras so you only pay for what you need. Choose the core range: 18.6 m² from R689 900 ex VAT, 30.4 m² at R849 900 or 37 m² with a balcony at R949 900, or step up to the Space range, a more premium build with a far wider options list, from R849 900 for the 8.5 m Space D5 to R1 099 900 for the 38 m² Space D7. The six models here are a sample of the most popular layouts: both ranges build other sizes and layouts to order, and there are far more options than we can list, so tell us what you need and we'll check. Each capsule arrives fully built and is delivered to your site, so there's no on-site construction and it's ready for immediate occupancy.",
    startingPrice: 689900,
    sizeLabel: "18.6 – 38 m²",
    bedrooms: "1 – 2 rooms + bathroom",
    setupTime: "Delivered fully built",
    dims: { length: 11.5, width: 3.3, height: 3.3 },
    specs: [
      { label: "Core range", value: "18.6 m² (5.85 m), 30.4 m² (9.5 m) or 37 m² (11.5 m, with balcony)" },
      { label: "Space range", value: "30.4 m² (8.5 m Space D5), 30 m² (9.0 m Space D8) or 38 m² (11.5 m Space D7), a more premium build with a wider options list" },
      { label: "External size", value: "Up to 11.5 m × 3.3 m × 3.3 m" },
      { label: "Glazing", value: "270° oversized floor-to-ceiling double-glazed windows in each room" },
      { label: "Layout", value: "One or two rooms with a bathroom; a balcony on the 11.5 m core capsule and on the Space D5 and D7" },
      { label: "Sleeps", value: "2 – 4 depending on the model" },
      { label: "Kitchen", value: "Optional on every model: basic cabinetry with a sink and stone top in the core range, or a full kitchen with a 900 mm double stove and 80 L oven in the Space range" },
      { label: "Air conditioning", value: "Optional on every model" },
      { label: "Standard", value: "Bathroom with premium fittings, geyser, multi-layer insulation, plumbing & electrical, interior & exterior lighting, intelligent front-door access" },
      { label: "Models shown", value: "A sample of the most popular layouts; other sizes and layouts are built to order" },
      { label: "Assembly", value: "Arrives fully built, delivered and placed on site with no on-site construction, ready for immediate occupancy" },
    ],
    features: [
      "270° oversized double-glazed panoramic windows in each room",
      "Two ranges: the core capsules, and the more premium Space range",
      "Bathroom with premium fittings and a geyser standard on every model",
      "Multi-layer thermal insulation and intelligent front-door access",
      "Optional balcony, removable to extend the indoor space",
      "Arrives fully built, with no on-site construction",
    ],
    useCases: [
      {
        title: "Luxury lodge suite",
        body: "Rooms sit either side of the bathroom, each wrapped in 270-degree floor-to-ceiling double glazing and roomy enough for a queen bed and a lounge area. Capsules arrive fully built, so a lodge adds suites without closing to guests for a construction programme.",
      },
      {
        title: "Glamping pod business",
        body: "The premium end of the glamping market, where the unit itself is the reason for the booking and the nightly rate. Premium bathroom fittings, a geyser, complete plumbing and electrics and intelligent front-door access are standard; kitchen and air conditioning are extras, so you only pay for what the site needs.",
      },
      {
        title: "Vineyard and wine estate accommodation",
        body: "Panoramic glazing turned toward the vines, from an 18.6 m² capsule at R689 900 ex VAT up to a 37 m² model with a balcony at R949 900. The Space range adds a wider options list where an estate wants the specification pushed further.",
      },
      {
        title: "Beach and coastal retreat",
        body: "Multi-layer thermal insulation and oversized double glazing hold a comfortable interior against coastal glare and wind. Coastal exposure is specified on quotation, because salt air changes what the exterior has to be.",
      },
      {
        title: "Bush getaway",
        body: "Delivered fully built and ready for immediate occupancy, which matters most where a site is hours from the nearest contractor. The 11.5 m capsule sleeps 2–4 across two bedrooms with a central bathroom and a balcony.",
      },
      {
        title: "Honeymoon suite",
        body: "A single freestanding suite with 270° glazing, a premium bathroom and a balcony on the larger models: private, and separate from the main guest block. Other sizes and layouts are built to order.",
      },
    ],
    variants: [
      { id: "capsule-5-85", name: "Glamping Capsule 5.85m", size: "18.6 m²", price: 689900, description: "5.85 × 3.15 × 3.2 m, with one bedroom and a bathroom wrapped in panoramic glazing. The entry to the capsule range." },
      { id: "capsule-8-5", name: "Glamping Capsule 9.5m", size: "30.4 m²", price: 849900, description: "9.5 × 3.25 × 3.2 m, with two bedrooms either side of a central bathroom with luxurious fittings." },
      { id: "capsule-11-5", name: "Glamping Capsule 11.5m", size: "37 m²", price: 949900, description: "11.5 × 3.25 × 3.2 m, sleeps 2–4, with two bedrooms, a central bathroom and a balcony. The largest of the core range." },
      { id: "space-d5", name: "Space D5 (8.5 m)", size: "30.4 m²", price: 849900, description: "8.5 × 3.3 × 3.3 m, with one bedroom, a lounge area and a balcony, in the more premium Space build with its wider options list." },
      { id: "space-d8", name: "Space D8 (9.0 m)", size: "30 m²", price: 998900, description: "9.0 × 3.3 × 3.3 m, with two bedrooms and a bathroom with a tub, no balcony. The two-bedroom Space capsule." },
      { id: "space-d7", name: "Space D7 (11.5 m)", size: "38 m²", price: 1099900, description: "11.5 × 3.3 × 3.3 m, the largest capsule: a bedroom, lounge area and balcony in the premium Space build. A two-bedroom layout is available on request." },
    ],
    options: [
      /* Core range: the supplier's shorter options list. The kitchen here is the
         same basic cabinetry we fit in the expandable homes: no appliances. */
      { id: "capsule-aircon", label: "Central air conditioning", description: "Central air conditioning fitted through the capsule.", price: 19900, category: "comfort", visual: "aircon", availableVariantIds: ["capsule-5-85", "capsule-8-5", "capsule-11-5"], provisional: false },
      { id: "capsule-kitchen", label: "Kitchen (per metre)", description: "A 1-metre run of the same kitchen we fit in our expandable homes: basic cabinetry with a sink, no appliances, at R4 900/m. Add as many metres as the space allows; the length is confirmed on your quotation.", price: 4900, category: "modules", visual: "kitchen", footprintM2: 0.75, availableVariantIds: ["capsule-5-85", "capsule-8-5", "capsule-11-5"], provisional: false },
      { id: "underfloor-heating", label: "Under-floor heating", description: "Electric under-floor heating throughout the capsule, at one price for any size.", price: 12900, category: "comfort", visual: "heating", availableVariantIds: ["capsule-5-85", "capsule-8-5", "capsule-11-5"], provisional: false },
      { id: "smart-curtains", label: "Motorised curtains", description: "Motorised curtains across the 270° glazing.", price: 16900, category: "comfort", visual: "curtains", availableVariantIds: ["capsule-5-85", "capsule-8-5", "capsule-11-5"], provisional: false },
      { id: "capsule-skylight", label: "Skylight with roller shade", description: "Roof skylight with a roller shade for star-gazing and daylight.", price: 8900, category: "structure", visual: "glazing", availableVariantIds: ["capsule-5-85", "capsule-8-5", "capsule-11-5"], provisional: false },
      /* Space range: a much longer list than we publish. The size-banded extras
         are split in two so only the price for the selected model is offered:
         the 8.5 m and 9.0 m take the small/medium price, the 11.5 m the large. */
      { id: "space-kitchen", label: "Full kitchen", description: "A 2 m cabinet run with a stone countertop, a sink and a 900 mm double stove with an 80 L oven.", price: 37900, category: "modules", visual: "kitchen", footprintM2: 1.5, availableVariantIds: ["space-d5", "space-d8", "space-d7"], provisional: false },
      { id: "space-floor-heating-sm", label: "Under-floor heating", description: "Electric under-floor heating throughout the capsule.", price: 14900, category: "comfort", visual: "heating", availableVariantIds: ["space-d5", "space-d8"], provisional: false },
      { id: "space-floor-heating-l", label: "Under-floor heating", description: "Electric under-floor heating throughout the capsule.", price: 17900, category: "comfort", visual: "heating", availableVariantIds: ["space-d7"], provisional: false },
      { id: "space-curtains-sm", label: "Smart double-track curtains", description: "Motorised double-track curtains across the 270° glazing, with blackout and gauze layers included, run from the capsule's control system.", price: 23900, category: "comfort", visual: "curtains", availableVariantIds: ["space-d5", "space-d8"], provisional: false },
      { id: "space-curtains-l", label: "Smart double-track curtains", description: "Motorised double-track curtains across the 270° glazing, with blackout and gauze layers included, run from the capsule's control system.", price: 32900, category: "comfort", visual: "curtains", availableVariantIds: ["space-d7"], provisional: false },
      { id: "space-insulation-sm", label: "Upgraded 100 mm polyurethane insulation", description: "Doubles the standard 50 mm polyurethane insulation to 100 mm for hotter and colder sites.", price: 15900, category: "structure", visual: "insulation", availableVariantIds: ["space-d5", "space-d8"], provisional: false },
      { id: "space-insulation-l", label: "Upgraded 100 mm polyurethane insulation", description: "Doubles the standard 50 mm polyurethane insulation to 100 mm for hotter and colder sites.", price: 20900, category: "structure", visual: "insulation", availableVariantIds: ["space-d7"], provisional: false },
      { id: "space-skylight", label: "Skylight with electric sunshade", description: "Roof skylight with a remote-controlled electric sunshade.", price: 12900, category: "structure", visual: "glazing", availableVariantIds: ["space-d5", "space-d8", "space-d7"], provisional: false },
      { id: "space-enclosed-balcony", label: "Fully enclosed balcony", description: "Encloses the balcony in double glazing, turning it into a year-round sun room.", price: 12900, category: "structure", visual: "glazing", availableVariantIds: ["space-d5", "space-d7"], provisional: false },
      { id: "space-projector", label: "HD projector and 100-inch screen", description: "HD projector on a lifting rod with a 100-inch screen for cinema nights. Other screen sizes on request.", price: 20900, category: "comfort", visual: "none", availableVariantIds: ["space-d5", "space-d8", "space-d7"], provisional: false },
    ],
    faqs: [
      {
        q: "What comes standard in a Glamping Capsule?",
        a: "Every model comes with the bathroom and its premium fittings, a geyser, multi-layer thermal insulation, complete plumbing and electrical, interior and exterior lighting, intelligent front-door access and the 270° double-glazed windows. The kitchen and air conditioning are optional extras, so you only pay for them if you want them.",
      },
      {
        q: "What's the difference between the core capsules and the Space range?",
        a: "Same idea, two builds. The core range is the more affordable option with a shorter options list, and its kitchen extra is the same basic cabinetry and sink we fit in our expandable homes, with no appliances. The Space range is a more premium build with a much wider choice of extras, including a full kitchen with a 900 mm double stove and 80 L oven, an enclosed balcony and upgraded 100 mm insulation.",
      },
      {
        q: "Are these the only models and options?",
        a: "No. The six models here are a sample of the most popular layouts, and the extras we list are a selection. Both ranges build other sizes and layouts to order (the 11.5 m Space capsule can be done as a two-bedroom, for example) and there are far more options than we can sensibly list. Tell us what you're after and we'll check it with the factory.",
      },
      {
        q: "How is a Glamping Capsule delivered and installed?",
        a: "The capsule arrives fully built and is delivered to your site, so there's no on-site construction, so it's ready for immediate occupancy. We assist with site preparation: groundwork, electrical and plumbing are completed before delivery, and delivery is quoted separately based on your location.",
      },
      {
        q: "Can I customise my capsule?",
        a: "Yes. On the core range: central air conditioning (R19 900), a kitchen at R4 900/m, under-floor heating (R12 900), motorised curtains (R16 900) and a skylight with roller shade (R8 900). On the Space range: a full kitchen (R37 900), under-floor heating (from R14 900), smart double-track curtains (from R23 900), upgraded 100 mm insulation (from R15 900), a skylight with electric sunshade (R12 900), a fully enclosed balcony (R12 900) and an HD projector with a 100-inch screen (R20 900).",
      },
      {
        q: "Can I finance a Glamping Capsule?",
        a: "Yes. Finance is available through a third-party provider, subject to credit approval, and every Tiny Homes SA product carries a 1-year limited guarantee.",
      },
    ],
    seoKeywords: [
      "glamping capsule South Africa",
      "luxury glamping pod price",
      "glamping pods for sale South Africa",
      "space capsule house South Africa",
      "vineyard accommodation unit",
      "luxury glamping South Africa",
    ],
  },
  {
    slug: "outdoor-kitchens",
    name: "Outdoor Kitchens",
    shortName: "Outdoor Kitchen",
    h1: "Outdoor kitchens",
    seoTitle: "Outdoor Kitchens South Africa from R154 400",
    tagline: "Braai, cook, host, then close the roof on the weather.",
    summary:
      "An all-in-one outdoor entertainment kitchen with a remote-controlled motorised lift-up roof, quartz stone countertop and stainless-steel sink, in four lengths from 2.5 m to 3.9 m, delivered ready to use from R154 400 ex VAT.",
    description:
      "South Africans entertain outside, and the outdoor kitchen just makes it official. Press the remote and the motorised roof lifts to reveal a complete entertainment kitchen: a quartz stone countertop with a water-barrier edge and a sink cover that doubles as extra workspace, a stainless-steel sink with pull-out faucet, recessed warm or white lighting with an adjustable LED ambient strip, and rust-resistant aluminium switches and sockets. The corrosion-resistant galvanised steel frame, aluminium-alloy shell and panels and comprehensive waterproof design are built to live outdoors year-round, while the aluminium honeycomb interior panels shrug off heat and wipe clean after the braai. Plumbing and electrical are embedded, with an outdoor distribution box with leakage protection and a cement-board base. Choose from four lengths, 2.5, 2.9, 3.5 or 3.9 m, and a wide range of custom colours from white and navy to grey, charcoal and green, then tailor yours in the configurator with add-ons: a gas grill, induction stove or kettle grill, an extractor fan, bar fridge, stainless-steel countertop, outdoor speaker or an illuminated 'starry sky' ceiling. From R154 400 ex VAT, delivered ready to use.",
    startingPrice: 154400,
    sizeLabel: "2.5 – 3.9 m",
    setupTime: "Delivered ready to use",
    dims: { length: 2.5, width: 0.8, height: 2.4 },
    specs: [
      { label: "Sizes", value: "Four lengths: 2.5 m, 2.9 m, 3.5 m or 3.9 m (all 0.8 m deep × 2.4 m high)" },
      { label: "Weight", value: "500 – 750 kg, depending on length" },
      { label: "Roof", value: "Remote-controlled motorised lift-up roof" },
      { label: "Structure", value: "Corrosion-resistant galvanised steel frame with aluminium-alloy shell and panels" },
      { label: "Weatherproofing", value: "Comprehensive outdoor waterproof design" },
      { label: "Countertop", value: "Quartz stone with water-barrier edge; sink cover doubles as extra workspace" },
      { label: "Sink", value: "Stainless-steel sink with pull-out faucet" },
      { label: "Interior panels", value: "Aluminium honeycomb: high-temperature resistant, easy to clean" },
      { label: "Electrical", value: "Embedded plumbing & electrical; outdoor distribution box with leakage protection" },
      { label: "Lighting", value: "Recessed warm/white lighting plus adjustable LED ambient strip" },
      { label: "Switches & sockets", value: "Rust-resistant aluminium" },
      { label: "Base", value: "Cement-board base" },
      { label: "Colours", value: "Wide range of custom colours: white, navy, grey, charcoal, green and more" },
    ],
    features: [
      "Remote-controlled motorised lift-up roof: open for the braai, closed against the weather",
      "Quartz stone countertop with water-barrier edge and a sink cover for extra workspace",
      "Stainless-steel sink with pull-out faucet, with plumbing and electrical embedded",
      "Corrosion-resistant galvanised steel frame with aluminium-alloy shell, waterproof throughout",
      "Recessed warm/white lighting and an adjustable LED ambient strip for evening entertaining",
      "Add-ons from gas grills and an induction stove to a bar fridge, extractor fan and starry-sky ceiling",
    ],
    useCases: [
      {
        title: "Braai area",
        body: "A built-in braai area without the bricklaying: the unit arrives complete with a quartz stone countertop, a stainless-steel sink with a pull-out faucet and embedded plumbing and electrics. Add a gas grill, kettle grill or induction stove in the configurator depending on how you cook.",
      },
      {
        title: "Patio entertainment area",
        body: "Press the remote and the motorised roof lifts to open a full entertainment kitchen; close it and the weather stays out. Recessed warm or white lighting and an adjustable LED ambient strip carry the evening on, and the sink cover doubles as extra workspace.",
      },
      {
        title: "Pool deck and bar",
        body: "A galvanised steel frame, aluminium-alloy shell and comprehensive waterproofing are built to stand beside a pool year-round, with rust-resistant aluminium switches and sockets. A bar fridge and outdoor speaker are available as add-ons.",
      },
      {
        title: "Lodge and guest farm",
        body: "A self-contained outdoor kitchen for a guest boma or communal braai area, delivered ready to use rather than built on site. Four lengths from 2.5 m to 3.9 m, and a colour range from white and navy to grey, charcoal and green to match existing buildings.",
      },
      {
        title: "Developer amenity",
        body: "A repeatable, fixed-price communal braai facility for an estate or apartment scheme, at 500 to 750 kg depending on length, delivered complete on a cement-board base with an outdoor distribution box and leakage protection.",
      },
      {
        title: "Garden bar",
        body: "The compact 2.5 m unit fits a courtyard or small garden and closes down to a clean weatherproof box when it is not in use. Aluminium honeycomb interior panels shrug off heat and wipe clean after the braai.",
      },
    ],
    variants: [
      { id: "ok-2-5", name: "2.5 m Outdoor Kitchen", size: "2.5 m", price: 154400, description: "2.5 × 0.8 × 2.4 m, approx 500 kg, the compact entertainer." },
      { id: "ok-2-9", name: "2.9 m Outdoor Kitchen", size: "2.9 m", price: 164500, description: "2.9 × 0.8 × 2.4 m, approx 600 kg." },
      { id: "ok-3-5", name: "3.5 m Outdoor Kitchen", size: "3.5 m", price: 183700, description: "3.5 × 0.8 × 2.4 m, approx 700 kg." },
      { id: "ok-3-9", name: "3.9 m Outdoor Kitchen", size: "3.9 m", price: 196800, description: "3.9 × 0.8 × 2.4 m, the largest, for serious entertaining." },
    ],
    // Extras from the supplier options list, marked up 30% and rounded up to the
    // nearest R100. No cutaway scene, the configurator shows the Photos panel.
    // Gas Grill Double and Kettle Grill are offered on the 3.5 m and 3.9 m units only.
    options: [
      { id: "gas-grill-single", label: "Single gas grill", description: "Built-in single-burner gas grill for everyday braais. Choose one cooking method.", price: 9300, category: "modules", visual: "none", exclusiveGroup: "cooking", provisional: false },
      { id: "gas-grill-double", label: "Double gas grill", description: "Built-in double-burner gas grill for serious entertaining. Choose one cooking method.", price: 14100, category: "modules", visual: "none", availableVariantIds: ["ok-3-5", "ok-3-9"], exclusiveGroup: "cooking", provisional: false },
      { id: "induction-stove", label: "Induction flat-top stove", description: "Built-in induction flat-top stove for precise, flameless cooking. Choose one cooking method.", price: 4500, category: "modules", visual: "none", exclusiveGroup: "cooking", provisional: false },
      { id: "kettle-grill", label: "Kettle grill", description: "Built-in kettle grill for charcoal cooking and smoking. Choose one cooking method.", price: 8200, category: "modules", visual: "none", availableVariantIds: ["ok-3-5", "ok-3-9"], exclusiveGroup: "cooking", provisional: false },
      { id: "extractor-fan", label: "Extractor fan", description: "Overhead extractor fan to clear smoke and steam.", price: 3400, category: "modules", visual: "none", provisional: false },
      { id: "bar-fridge", label: "Bar fridge", description: "Small under-counter refrigerator for drinks and ingredients.", price: 3300, category: "modules", visual: "none", provisional: false },
      { id: "stainless-countertop", label: "Stainless-steel countertop", description: "Upgrades the quartz stone counter to a stainless-steel worktop.", price: 7800, category: "interior", visual: "none", provisional: false },
      { id: "extra-cabinets", label: "Extra cabinet module (1 m)", description: "A 1-metre run of extra cabinetry at R3 100/m. Need more? We'll quote the length you want.", price: 3100, category: "interior", visual: "none", provisional: false },
      { id: "aluminium-shelf", label: "Aluminium shelf", description: "Wall-mounted aluminium shelf for extra storage.", price: 500, category: "interior", visual: "none", provisional: false },
      { id: "outdoor-speaker", label: "Outdoor speaker", description: "Weatherproof outdoor speaker to set the mood.", price: 1900, category: "comfort", visual: "none", provisional: false },
      { id: "starry-sky-ceiling", label: "Starry-sky ceiling", description: "LED starry-sky ceiling panel for the underside of the roof.", price: 4700, category: "comfort", visual: "none", provisional: false },
    ],
    faqs: [
      {
        q: "What's included in an outdoor kitchen?",
        a: "Every unit comes standard with the remote-controlled motorised lift-up roof, quartz stone countertop with water-barrier edge and sink cover, stainless-steel sink with pull-out faucet, aluminium honeycomb interior panels, recessed warm/white lighting with an adjustable LED ambient strip, rust-resistant aluminium switches and sockets, embedded plumbing and electrical, an outdoor distribution box with leakage protection and a cement-board base, all in a corrosion-resistant galvanised steel frame with an aluminium-alloy shell.",
      },
      {
        q: "What sizes are available?",
        a: "Four lengths: 2.5 m, 2.9 m, 3.5 m and 3.9 m, all 0.8 m deep and 2.4 m high, weighing between 500 and 750 kg. A wide range of custom colours is available, from white and navy to grey, charcoal and green.",
      },
      {
        q: "What add-ons can I get?",
        a: "A single gas grill, a double gas grill (on the 3.5 m and 3.9 m units), an induction flat-top stove, a kettle grill (on the 3.5 m and 3.9 m units), an extractor fan, a bar fridge, a stainless-steel countertop upgrade, extra cabinet modules by the metre, an aluminium shelf, an outdoor speaker and an illuminated 'starry-sky' ceiling, each quoted on your quotation.",
      },
      {
        q: "How much does delivery and installation cost?",
        a: "Delivery and installation are quoted separately based on your location and site accessibility. We deliver nationwide, and the unit arrives ready to use once connected.",
      },
      {
        q: "Can I finance an outdoor kitchen?",
        a: "Yes. Finance is available through a third-party provider, subject to credit approval. You'll need a valid SA ID or passport, your latest three months' bank statements or proof of income and a good credit record; a deposit may be required depending on the unit.",
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
    h1: "Luxury safari tents",
    seoTitle: "Safari Tents South Africa for Lodges",
    tagline: "Luxury under canvas, engineered for Africa.",
    summary:
      "Luxury canvas tented suites offered to businesses and hospitality operators only: game lodges, glamping resorts, boutique hotels and event venues. Safari tents cannot be ordered through this site, and viewings are by appointment rather than at the showroom.",
    description:
      "Safari tents are how Africa's best lodges put guests inside the landscape without giving up an inch of comfort. We supply and install luxury canvas tented suites built by one of Africa's leading safari-tent manufacturers. Choose between classic Meru-style canvas and curved stretch-tension roofs over timber structures, add raised decks and en-suite layouts, and the result is a suite engineered for African conditions: sun, wind, rain and everything in between. Because no two sites or briefs are the same, there's no price list: we start with a consultation, configure every tent to your site, layout and guest experience, and give you an itemised quotation. From game lodge suites and glamping resorts to private reserves, bush camps, boutique hotels and event venues, all backed by our after-sales support. One thing to know before you enquire: safari tents are a trade offering. We supply them to businesses and hospitality operators only, not to private buyers, and they cannot be ordered or quoted through this site the way our homes can. They are also not kept at our Centurion showroom, so seeing one is arranged individually: email johan@tinyhomesa.com and we will set up a time to view the tents.",
    startingPrice: 0, // sentinel: priceOnRequest, must never render
    priceOnRequest: true,
    // Trade only, owner-instructed 2026-08-19: offered to businesses and
    // hospitality operators, never orderable, and viewed by appointment
    // because no tent stands at the showroom. See Product.tradeOnly.
    tradeOnly: true,
    sizeLabel: "Custom sizes",
    setupTime: "Quoted per project",
    dims: { length: 0, width: 0, height: 0 }, // no doc-sourced dimensions, never rendered (no configurator/floor plan)
    specs: [
      { label: "Roof styles", value: "Meru-style canvas or curved stretch-tension canvas" },
      { label: "Structure", value: "Canvas over timber structures, with raised decks available" },
      { label: "Layouts", value: "En-suite layouts available, configured to your brief" },
      { label: "Built for", value: "Engineered for African conditions" },
      { label: "Supply", value: "Supplied and installed by our manufacturing partner. Tiny Homes SA is not involved in the installation" },
      { label: "Available to", value: "Businesses and hospitality operators only: lodges, resorts, hotels, reserves and event venues. Not sold to private buyers" },
      { label: "Ordering", value: "Cannot be ordered online. Quoted per project after a consultation" },
      { label: "Viewings", value: "By appointment only, and not at the Centurion showroom. Email johan@tinyhomesa.com to arrange a time" },
      { label: "Pricing", value: "On request: itemised quotation after a consultation" },
      { label: "Lead time", value: "Quoted per project" },
    ],
    features: [
      "Meru-style and curved stretch-tension canvas roof designs",
      "Timber structures with raised decks for views and airflow",
      "En-suite layouts available for full lodge-suite comfort",
      "Engineered for African conditions: sun, wind and rain",
      "Configured to your site, brief and guest experience",
      "Offered to businesses and hospitality operators only, not to private buyers",
      "Viewed by appointment rather than ordered: email johan@tinyhomesa.com",
      "Backed by our full after-sales support",
    ],
    useCases: [
      {
        title: "Game lodge suites",
        body: "Canvas tented suites that put guests inside the landscape without giving up comfort: Meru-style or curved stretch-tension roofs over timber structures, with raised decks and en-suite layouts available. Supplied and installed by Tiny Homes SA, built by one of Africa's leading safari-tent manufacturers.",
      },
      {
        title: "Glamping resort",
        body: "A full tented resort configured as one brief rather than bought unit by unit: layouts, decks and guest flow are set with you at consultation, then quoted itemised. Engineered for African sun, wind and rain.",
      },
      {
        title: "Private reserve",
        body: "Low-impact guest accommodation for a reserve where a permanent build is unwanted or not permitted. Canvas over timber sits lightly on the ground and can be specified around the trees and views already there.",
      },
      {
        title: "Bush camp",
        body: "Tented camps built for real conditions rather than a season, with raised decks where the ground demands it and en-suite layouts where guests expect them. Configured per site, because no two camps share a footprint.",
      },
      {
        title: "Boutique hotel",
        body: "Tented suites as a distinct offering alongside existing rooms, specified to match the standard of the house. Every tent is configured to your brief and backed by our after-sales support.",
      },
      {
        title: "Event venue",
        body: "Permanent or semi-permanent canvas structures for weddings, functions and hospitality, engineered to stand up to weather rather than hired in for a weekend. Sizes and layouts are quoted per project after a consultation.",
      },
    ],
    options: [],
    faqs: [
      {
        q: "Who can buy a safari tent?",
        a: "Businesses and hospitality operators: game lodges, glamping resorts, private reserves, bush camps, boutique hotels and event venues. Safari tents are a trade offering and we do not sell them to private buyers for a home or a garden.",
      },
      {
        q: "Can I order a safari tent online?",
        a: "No. Unlike our homes, safari tents cannot be ordered or quoted through the site. Every tent is configured to your site and brief, so it starts with a consultation and ends with an itemised quotation.",
      },
      {
        q: "Can I see a safari tent at the showroom?",
        a: "No. There is no safari tent at our Centurion showroom, so a showroom viewing will not show you one. Viewings are arranged individually: email johan@tinyhomesa.com and we will book a time to go and view the tents.",
      },
      {
        q: "How does safari tent pricing work?",
        a: "Every tent is configured to your site and brief, so there's no one-size price list. We start with a consultation about your site, layout and guest experience, then send you an itemised quotation covering the tent, deck, installation and delivery.",
      },
      {
        q: "What configurations are available?",
        a: "Meru-style canvas and curved stretch-tension roofs over timber structures, with raised decks and en-suite layouts available. Each suite is configured to your brief, from a single honeymoon suite to a full camp.",
      },
      {
        q: "Where do safari tents work best?",
        a: "Game lodges, glamping resorts, private reserves, bush camps, boutique hotels and event venues: anywhere you want guests immersed in the landscape with lodge-level comfort.",
      },
      {
        q: "What is the lead time?",
        a: "Lead time is quoted per project, because it depends on the configuration, the number of units and your site. We confirm the programme with your quotation.",
      },
      {
        q: "What support do I get after installation?",
        a: "Full after-sales support from our team. We stay involved long after handover.",
      },
    ],
    seoKeywords: [
      "safari tents South Africa",
      "luxury glamping tents",
      "canvas safari tent suites",
      "lodge tents South Africa",
      "luxury safari tents South Africa",
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const productSlugs = products.map((p) => p.slug);

/**
 * The products a visitor can actually order: everything except the trade-only
 * lines. Every ordering surface (the quote builder's picker, its deep links)
 * and the showroom viewing booker must read this list rather than `products`,
 * otherwise a trade-only product is offered as though it were for sale or as
 * though it were standing at the showroom. See Product.tradeOnly.
 */
export const orderableProducts = products.filter((p) => !p.tradeOnly);

/** Whether an option is offered for a given variant (options with no availableVariantIds are offered on all). */
export function isOptionAvailable(opt: CustomOption, variantId?: string): boolean {
  if (!opt.availableVariantIds) return true;
  return variantId != null && opt.availableVariantIds.includes(variantId);
}

/**
 * The options that actually count, for one selection and size.
 *
 * Everything that prices, lists or draws a configuration resolves through here,
 * so a selection can never mean one thing to the price and another to the list
 * printed beside it. Three rules, in order:
 *
 *   1. the option has to be offered on the chosen size;
 *   2. an option that depends on another only counts once that one is on;
 *   3. options sharing an exclusiveGroup are mutually exclusive, so at most the
 *      first selected one counts.
 *
 * Rule 3 is the reason this function exists. It used to be enforced only by the
 * product-page configurator refusing to switch two on at once, which left every
 * other route in — a /quote?options=a,b deep link, the quote form's own extras
 * list, a crafted POST — free to select all four outdoor-kitchen cooking
 * methods and be quoted for the lot. On a 3.9 m kitchen that overstated the
 * price by R22 000, on the customer's own quotation document.
 */
export function activeOptions(
  product: Product,
  selected: Partial<Record<string, boolean>>,
  variantId?: string,
): CustomOption[] {
  const claimed = new Set<string>();
  return product.options.filter((opt) => {
    if (!isOptionAvailable(opt, variantId)) return false;
    if (!selected[opt.id]) return false;
    if (opt.requires && !selected[opt.requires]) return false;
    if (opt.exclusiveGroup) {
      if (claimed.has(opt.exclusiveGroup)) return false;
      claimed.add(opt.exclusiveGroup);
    }
    return true;
  });
}

/** Visual layers implied by the active options. */
export function activeVisuals(
  product: Product,
  selected: Partial<Record<string, boolean>>,
  variantId?: string,
): Partial<Record<VisualKey, boolean>> {
  const visuals: Partial<Record<VisualKey, boolean>> = {};
  for (const opt of activeOptions(product, selected, variantId)) {
    if (opt.visual !== "none") visuals[opt.visual] = true;
  }
  return visuals;
}

/** Effective price of an option, per-m² options scale with the selected variant's floor area. */
export function optionPrice(opt: CustomOption, areaM2?: number): number {
  if (opt.pricePerM2 != null && areaM2 != null) return Math.round(opt.pricePerM2 * areaM2);
  return opt.price;
}

/** Sum of base price + the options that count, for a product. */
export function configuredPrice(product: Product, selected: Partial<Record<string, boolean>>, variantId?: string): number {
  const variant = product.variants?.find((v) => v.id === variantId);
  const base = variant ? variant.price : product.startingPrice;
  const areaM2 = variant?.areaM2;
  return activeOptions(product, selected, variantId).reduce(
    (total, opt) => total + optionPrice(opt, areaM2),
    base,
  );
}
