/**
 * The Tiny Homes SA journal.
 *
 * Content as data, the way products.ts holds the catalogue: posts are typed
 * blocks rendered by src/components/blog/, never hand-written JSX. That keeps
 * every post structurally identical, lets one renderer decide the typography
 * for the whole blog, and means a post can never quietly ship a heading level
 * that breaks the document outline.
 *
 * WHY A BLOG AT ALL. The product pages answer "which model", and they answer
 * it well. They cannot answer "how much does a pod cost", "is a pod better
 * than a container home" or "do I need plans" — those are questions asked
 * before a buyer knows our names for anything, and they are where most of the
 * search volume in this market sits. Each post below targets one of those
 * questions and links into the range from inside the answer.
 *
 * PRICES ARE NEVER TYPED. Every figure in the body copy is interpolated from
 * products.ts. A blog is exactly the kind of content that rots: it is written
 * once, never revisited, and quietly advertises last year's price until a
 * customer arrives holding it. Deriving the numbers means the posts reprice
 * themselves on the next deploy.
 */

import { getProduct } from "@/data/products";
import { podPriceFrom, podPriceTo } from "@/data/housing-pods";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";

/* ------------------------------------------------------------ block types */

/**
 * Inline markup understood inside every `text` field: `[label](/path)` for a
 * link and `**bold**` for emphasis. Deliberately tiny — the renderer builds
 * React elements from it, so there is no HTML string anywhere and nothing to
 * sanitise. See src/components/blog/rich-text.tsx.
 */
export type RichText = string;

export type BlogBlock =
  | { type: "p"; text: RichText }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: RichText[] }
  | { type: "ol"; items: RichText[] }
  | { type: "callout"; title: string; text: RichText }
  | {
      type: "table";
      caption: string;
      head: string[];
      rows: string[][];
    }
  | { type: "cta"; text: RichText; href: string; label: string };

/**
 * An outside source a post leans on.
 *
 * Blog copy that asserts market figures without saying where they came from is
 * the weakest kind of content there is — a reader cannot check it and a search
 * engine has no reason to trust it. Every reference here was opened and read
 * before it was cited; if a claim cannot be traced to one of these or to
 * products.ts, it does not belong in the copy as a number.
 *
 * `note` says which claim the source actually supports, so a future editor can
 * re-check a specific figure rather than re-reading the whole page.
 */
export interface BlogReference {
  /** Title as it reads on the source page. */
  title: string;
  /** Who published it — this is the part carrying the authority. */
  publisher: string;
  url: string;
  /** What we used it for. */
  note?: string;
}

export interface BlogPost {
  slug: string;
  /** <title>. The root layout appends " | Tiny Homes SA", so keep it short. */
  seoTitle: string;
  /** The H1 and the card heading. May differ from seoTitle. */
  title: string;
  /** Meta description and the card's summary. Aim for 120–158 characters. */
  description: string;
  /** ISO date. Hand-set, never build-stamped: see blogPostingSchema. */
  datePublished: string;
  /** ISO date. Bump only on a real content change. */
  dateModified?: string;
  keywords: string[];
  /** Product slug whose hero image illustrates the post. */
  imageProduct: string;
  /** Rough read time, shown on the card. */
  readingMinutes: number;
  body: BlogBlock[];
  /** Optional Q&A appended to the post and emitted as FAQPage JSON-LD. */
  faqs?: { q: string; a: string }[];
  /** Outside sources, listed at the foot of the post and emitted as `citation`. */
  references?: BlogReference[];
}

/* --------------------------------------------- prices, read not typed */

function priceOf(slug: string): number {
  const product = getProduct(slug);
  if (!product) throw new Error(`blog.ts: unknown product slug "${slug}"`);
  return product.startingPrice;
}

function variantPrice(slug: string, variantId: string): number {
  const product = getProduct(slug);
  const variant = product?.variants?.find((v) => v.id === variantId);
  if (!variant) {
    throw new Error(`blog.ts: no variant "${variantId}" on product "${slug}"`);
  }
  return variant.price;
}

const folding = priceOf("folding-homes");
const expandable = priceOf("expandable-homes");
const apple = priceOf("apple-cabins");
const capsule = priceOf("glamping-capsules");
const nature = priceOf("nature-cabins");
const expandable6m = variantPrice("expandable-homes", "b20");
const expandable12m = variantPrice("expandable-homes", "b40");

const R = formatZAR;

/**
 * Floor area in m² for a product or one of its variants.
 *
 * Reads `areaM2` where the catalogue carries it (the expandable range does),
 * and otherwise parses the leading number off the `size` / `sizeLabel` string
 * ("26.5 m²" → 26.5). Throws rather than guessing: a rand-per-m² table is only
 * worth publishing if every figure in it is real, and a silent 0 would render
 * an infinity into the page.
 */
function areaOf(slug: string, variantId?: string): number {
  const product = getProduct(slug);
  if (!product) throw new Error(`blog.ts: unknown product slug "${slug}"`);
  const variant = variantId ? product.variants?.find((v) => v.id === variantId) : undefined;
  if (variantId && !variant) {
    throw new Error(`blog.ts: no variant "${variantId}" on product "${slug}"`);
  }
  if (variant?.areaM2) return variant.areaM2;
  const label = variant?.size ?? product.sizeLabel;
  const parsed = Number.parseFloat(label.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`blog.ts: cannot read a floor area from "${label}" (${slug})`);
  }
  return parsed;
}

/** Price of a named option on a product, read from the catalogue. */
function optionOf(slug: string, optionId: string): number {
  const product = getProduct(slug);
  const opt = product?.options.find((o) => o.id === optionId);
  if (!opt) throw new Error(`blog.ts: no option "${optionId}" on product "${slug}"`);
  return opt.price;
}

/** Rand per m² for a unit, rounded to the nearest 10 — the comparison a
 *  conventional build is quoted on. Derived, never typed. */
function perM2(slug: string, variantId?: string): string {
  const product = getProduct(slug);
  if (!product) throw new Error(`blog.ts: unknown product slug "${slug}"`);
  const price = variantId
    ? (product.variants?.find((v) => v.id === variantId)?.price ?? 0)
    : product.startingPrice;
  return R(Math.round(price / areaOf(slug, variantId) / 10) * 10);
}

/* ------------------------------------------------------------- the posts */

export const blogPosts: BlogPost[] = [
  /* ================================================================ 1 ==== */
  {
    slug: "housing-pod-cost-south-africa",
    seoTitle: "How Much Does a Housing Pod Cost in SA?",
    title: "How much does a housing pod cost in South Africa?",
    description: `A straight price guide to housing pods in South Africa, from ${R(podPriceFrom)} to ${R(podPriceTo)} ex VAT — what each tier includes, and what it quietly leaves out.`,
    datePublished: "2026-09-02",
    keywords: [
      "how much does a housing pod cost",
      "housing pod price South Africa",
      "pod house price South Africa",
      "pod home cost",
      "how much does a pod house cost",
      "prefab pod home price",
    ],
    imageProduct: "apple-cabins",
    readingMinutes: 8,
    body: [
      {
        type: "p",
        text: `Ask what a housing pod costs in South Africa and the honest answer is anything from about R50 000 to well over a million rand — frequently for units that look near-identical in the photographs. That spread is not a market failing to settle on a price. It is the market selling three genuinely different things under one word.`,
      },
      {
        type: "p",
        text: `This is a guide to telling them apart. Our own range runs from ${R(podPriceFrom)} to ${R(podPriceTo)} ex VAT, so we have skin in the game, and we have used our prices throughout rather than vague ranges — you can check every one of them against the product pages. The structure of the market, though, is the same whoever you buy from.`,
      },

      { type: "h2", text: "The three tiers, and why the price gap is so wide" },
      {
        type: "p",
        text: `Almost every pod on sale in South Africa sits in one of three tiers. The differences between them are not really about quality. They are about **how much of the work is already done** when the truck leaves.`,
      },

      { type: "h3", text: "Tier 1: the insulated shell — roughly R50 000 to R150 000" },
      {
        type: "p",
        text: `A weatherproof, insulated room with electrics and nothing else. No bathroom, no kitchen, usually no plumbing at all. You are buying enclosed, comfortable floor area and doing the rest yourself.`,
      },
      {
        type: "p",
        text: `Our entry here is the [X-Fold](/folding-homes) at ${R(folding)} ex VAT for 15 m². It ships flat, and two people unfold it into a finished room in minutes — four steps, no specialist crew. It comes with upgraded floor beams, EPS insulation and a basic electrical setup: two plug points, a light fitting and a small DB board. It stacks two units high, and it folds back down if you move.`,
      },
      {
        type: "p",
        text: `What it does not have is plumbing. If you want a shower and a toilet, a local installer fits them on site, and that cost is yours. This tier is honest value for a home office, a site office, staff accommodation or a storeroom. It is a poor choice for a granny flat, because the plumbing you add afterwards is the expensive half.`,
      },

      { type: "h3", text: "Tier 2: the self-contained dwelling — roughly R200 000 to R600 000" },
      {
        type: "p",
        text: `A pod somebody can actually live in without using the main house: its own bathroom, its own kitchen, plumbing and electrics installed at the factory. This is what most people picture when they search for a granny pod or a second dwelling for the garden.`,
      },
      {
        type: "p",
        text: `Our [expandable homes](/expandable-homes) cover this tier, from ${R(expandable)} ex VAT for the compact 18 m² — which is not a bare shell; it includes a bathroom and a small basic kitchen — up to ${R(expandable12m)} for 74 m² with up to four bedrooms. The 37 m² at ${R(expandable6m)} adds two bedrooms and a full stainless-steel kitchen. Every size includes 75 mm EPS insulated walls, vinyl flooring, double-glazed windows and a door.`,
      },
      {
        type: "p",
        text: `The party trick is the deployment: the unit arrives as one module on a truck and expands on site within hours, not weeks. For a family adding accommodation to an existing property, this tier is usually the right answer.`,
      },

      { type: "h3", text: "Tier 3: the finished guest unit — R450 000 and up" },
      {
        type: "p",
        text: `Built to be looked at, and built to be let. Panoramic glazing, premium bathroom fittings, smart-lock entry, finishes chosen so the unit itself is the reason somebody books it. At this tier the pod is a revenue asset rather than a shelter, and it is priced accordingly.`,
      },
      {
        type: "p",
        text: `[Apple Cabins](/apple-cabins) start at ${R(apple)} ex VAT for 13 m², wrapped in floor-to-ceiling panoramic glass with luxurious bathroom fittings included in all three sizes and a kitchenette in the two larger ones. They arrive fully assembled and are ready for occupation within hours. [Glamping capsules](/glamping-capsules) start at ${R(capsule)} and run to ${R(podPriceTo)}, with 270° oversized double glazing and the bathroom, its premium fittings, a geyser, multi-layer insulation and intelligent front-door access standard on every model.`,
      },
      {
        type: "p",
        text: `[Nature cabins](/nature-cabins) sit slightly apart at ${R(nature)} ex VAT — not a pod shape at all, but the most completely finished unit we sell: 26 m² plus a viewing terrace, with the bathroom, the kitchen with its stone countertop and induction cooker, air conditioning and a storage water heater all fitted as standard rather than sold as extras.`,
      },

      { type: "h2", text: "The prices, side by side" },
      {
        type: "table",
        caption: "Tiny Homes SA housing pod ranges by price, size and what is fitted",
        head: ["Range", "Size", "From (ex VAT)", "Bathroom", "Kitchen"],
        rows: [
          ["X-Fold", "15 m²", R(folding), "No — add locally", "No"],
          ["Expandable home", "18 – 74 m²", R(expandable), "Yes, from the 18 m²", "Yes, basic from the 18 m²"],
          ["Apple Cabin", "13 – 26.5 m²", R(apple), "Yes, all three sizes", "Kitchenette on 9 m and 11.8 m"],
          ["Glamping capsule", "18.6 – 38 m²", R(capsule), "Yes, every model", "Optional extra"],
          ["Nature cabin", "26 m²", R(nature), "Yes, fully fitted", "Yes, fitted as standard"],
        ],
      },
      {
        type: "p",
        text: `All prices exclude VAT. They are for the product only: earthworks, the provision of services and transport to your site are quoted separately.`,
      },

      { type: "h2", text: "The costs that are not on the price tag" },
      {
        type: "p",
        text: `A pod price is a factory-gate price almost everywhere in this market. Four things sit outside it, and they are the ones that surprise people:`,
      },
      {
        type: "ul",
        items: [
          `**Transport.** Quoted on distance and site access, not included in any advertised figure. It is not a small line on a long run — ask for it in writing before you commit.`,
          `**Groundwork.** A level concrete slab or properly levelled precast plinths. Level is the operative word: a pod is a rigid finished box, and a base that is out shows up in the doors and windows.`,
          `**Connections.** Water, sewerage and the tie-in to your DB board. The unit may arrive with plumbing installed, but something still has to connect it to the property.`,
          `**Approval.** Where your municipality requires plans for a second structure, that is a cost and a timeline of its own.`,
        ],
      },
      {
        type: "callout",
        title: "Ask every supplier this one question",
        text: `"What is the total, delivered and standing on my site, ready to connect?" A supplier who will not put that in writing is quoting you a number you cannot compare to anybody else's. We will quote it — ask on the [quote form](/quote) and we will price the groundwork and delivery alongside the unit.`,
      },

      { type: "h2", text: "How to pick the tier without overbuying" },
      {
        type: "p",
        text: `The mistake that costs the most is buying tier 1 for a tier 2 job. A ${R(folding)} shell looks like an outstanding deal next to a ${R(expandable)} self-contained home, right up until you price a bathroom, a kitchen and the plumbing run to reach them. Retro-fitting those into a finished shell reliably costs more than buying them factory-installed, and the result is never as neat.`,
      },
      {
        type: "p",
        text: `So work backwards from the job, not the budget. **Nobody sleeping in it long-term?** Tier 1 is genuinely enough — a home office, a studio, a site office, a store. **Somebody living in it?** Tier 2, and do not compromise on the bathroom. **Letting it to guests at a nightly rate?** Tier 3, where the finish is the product and the unit pays for itself.`,
      },
      {
        type: "p",
        text: `Whatever tier you land on, go and stand inside one before you pay a deposit. Small buildings photograph much larger than they measure, and fifteen minutes inside a 15 m² unit tells you something no floor plan will. Ours are on site in ${site.showroom.city} and viewing is free.`,
      },
      {
        type: "cta",
        text: `See every range, its price and what is fitted, on one page.`,
        href: "/housing-pods",
        label: "Compare all five pod ranges",
      },
    ],
    faqs: [
      {
        q: "What is the cheapest housing pod in South Africa?",
        a: `Entry-level pods and insulated shells start in the R50 000–R100 000 region across the market. Ours is the X-Fold at ${R(folding)} ex VAT for a 15 m² insulated, wired room with no plumbing. Below roughly R50 000 you are generally looking at an uninsulated timber or nutec structure rather than a pod.`,
      },
      {
        q: "Do housing pod prices include VAT and delivery?",
        a: "Rarely, and ours do not. Every price on this site excludes VAT, and transport to your site is quoted separately based on distance and access. Always ask a supplier for the delivered, standing-on-site total rather than comparing factory-gate figures.",
      },
      {
        q: "Is a housing pod cheaper than building a room?",
        a: "Usually on time, and often on total cost — but the honest comparison includes the groundwork, connections and transport that conventional building also carries. What a pod reliably beats is the timeline and the disruption: the building work happens in a factory, and the unit is on your property and enclosed in days rather than months.",
      },
    ],
    references: [
      {
        title: "What it costs to build a house in South Africa",
        publisher: "ooba Home Loans",
        url: "https://www.ooba.co.za/resources/cost-to-build-a-house/",
        note: "Used for the conventional rand-per-square-metre band a pod price is compared against.",
      },
      {
        title: "Building statistics (Statistical release P5041.1)",
        publisher: "Statistics South Africa",
        url: "https://www.statssa.gov.za/publications/P50411/",
        note: "The official monthly series on building plans passed and completed, if you want the underlying national picture rather than a contractor's estimate.",
      },
    ],
  },

  /* ================================================================ 2 ==== */
  {
    slug: "housing-pod-vs-container-home-vs-wendy-house",
    seoTitle: "Housing Pod vs Container Home vs Wendy House",
    title: "Housing pod vs container home vs wendy house: what is actually different",
    description:
      "Three ways to add a room in South Africa, compared honestly on insulation, size, lifespan, resale and cost — including where a pod is the wrong answer.",
    datePublished: "2026-09-02",
    keywords: [
      "housing pod vs container home",
      "container home vs wendy house",
      "pod house vs container",
      "prefab room South Africa",
      "wendy house alternative",
      "backyard room South Africa",
    ],
    imageProduct: "folding-homes",
    readingMinutes: 9,
    body: [
      {
        type: "p",
        text: `If you want another room on your property in South Africa and you do not want to build it brick by brick, you have three realistic options: a factory-built pod, a converted shipping container, or a wendy house. They get compared constantly and usually badly, because the comparison is almost always made on sticker price alone.`,
      },
      {
        type: "p",
        text: `We sell pods, so read this knowing that. We have tried to be useful rather than flattering, and there is a section below on where a pod is the wrong choice.`,
      },

      { type: "h2", text: "The short version" },
      {
        type: "table",
        caption: "Housing pods, container conversions and wendy houses compared",
        head: ["", "Housing pod", "Container conversion", "Wendy house"],
        rows: [
          ["Typical entry cost", `From ${R(folding)} ex VAT`, "Varies widely with the conversion", "The cheapest of the three"],
          ["Built where", "In a factory, delivered finished", "Converted in a yard, or on site", "Assembled on your site"],
          ["Insulation", "Built in", "Added during conversion", "Often none as standard"],
          ["Shape of the space", "Designed as a room", "Fixed by the container", "Designed as a room"],
          ["Time on your property", "Hours to a few days", "Days", "Days"],
          ["Can it be moved later", "Yes", "Yes", "Sometimes, with damage"],
        ],
      },

      { type: "h2", text: "Insulation is the whole argument" },
      {
        type: "p",
        text: `Almost every real difference between these three traces back to one thing: whether the walls stop heat, and whether that was designed in or added afterwards.`,
      },
      {
        type: "p",
        text: `A shipping container is a steel box. Steel conducts heat superbly, which is exactly what you do not want in a Gauteng summer or a Free State winter, and an unlined container swings between uninhabitable extremes. Container conversions therefore have to add insulation internally, and doing it properly — with a vapour barrier and a ventilation strategy — is the difference between a comfortable room and a condensation problem. It can absolutely be done well. It also eats the internal dimensions, which were tight to begin with.`,
      },
      {
        type: "p",
        text: `A wendy house, in its common form, has no insulation at all. Timber or nutec panels, a roof, and that is the specification. That is fine for storage and it is why the price is what it is. As a room someone sits in through a February afternoon, it is a compromise most people notice quickly.`,
      },
      {
        type: "p",
        text: `A pod has insulation as part of the panel. Our [X-Fold](/folding-homes) uses EPS-insulated panels; the [expandable homes](/expandable-homes) use 75 mm EPS walls with a polyurethane upgrade available; the [nature cabins](/nature-cabins) and [glamping capsules](/glamping-capsules) use polyurethane and multi-layer insulation respectively. Nothing is added on site, so nothing depends on how carefully somebody lined it afterwards.`,
      },

      { type: "h2", text: "The shape of the space" },
      {
        type: "p",
        text: `A shipping container is 2.44 m wide externally, and the internal width after lining is meaningfully less. That constraint is fixed, and it is unforgiving in a bathroom or a bedroom where a door has to swing. It also means the layout of a container home is largely decided by the container rather than by you.`,
      },
      {
        type: "p",
        text: `Pods and wendy houses are drawn as rooms first. Our expandable homes reach 74 m² and up to four bedrooms precisely because nothing about the format forces a 2.44 m width; the [glamping capsules](/glamping-capsules) put rooms either side of a central bathroom in a way a container cannot.`,
      },
      {
        type: "callout",
        title: "Where a container genuinely wins",
        text: `Containers are engineered to be stacked, craned and shipped, over and over. If the unit will be moved repeatedly, dropped onto rough industrial sites, or must survive handling that would damage anything else, that is what a container is built for and a pod is not.`,
      },

      { type: "h2", text: "How long each one lasts, and what it is worth afterwards" },
      {
        type: "p",
        text: `Be sceptical of lifespan numbers in this market, including anyone's. Too much depends on the site, the coastal exposure, the maintenance and the quality of the original build for a single figure to mean much, which is why we do not publish one. What is worth comparing instead is **what fails first**.`,
      },
      {
        type: "ul",
        items: [
          `**Wendy house:** the timber and the fixings, particularly where water gets in at the base. Maintenance is ongoing and non-optional.`,
          `**Container conversion:** rust at the cut edges — every opening cut for a window or door breaks the factory coating — and condensation behind poorly executed lining.`,
          `**Pod:** the finishes and the seals, as with any building. The steel frame is the part least likely to be the problem.`,
        ],
      },
      {
        type: "p",
        text: `On resale, all three do better than a built room in one specific way: they can leave with you. A pod folds down or lifts out, a container lifts out, and a wendy house can sometimes be dismantled. A brick room cannot. If there is any chance you will move, that optionality is worth real money.`,
      },

      { type: "h2", text: "Where a pod is the wrong answer" },
      {
        type: "p",
        text: `Three situations where we would tell you to buy something else:`,
      },
      {
        type: "ol",
        items: [
          `**You need storage, not a room.** If nobody will sit in it, insulation and finishes are money spent on nothing. Buy a wendy house.`,
          `**Nothing can reach the site.** Pods arrive whole and have to be lifted or rolled into place. A steep, narrow or overgrown approach can make delivery impossible, and something assembled on site is then the only option. Our X-Fold is the exception — it ships flat and is carried in — but the rest need access.`,
          `**Your budget is genuinely fixed below the entry price.** Do not stretch to the cheapest pod by cutting the groundwork or the connections. A well-built wendy house on a proper base beats a pod standing on an inadequate one.`,
        ],
      },

      { type: "h2", text: "The comparison that actually decides it" },
      {
        type: "p",
        text: `Set the sticker prices aside and compare **delivered, standing, connected and usable**. Add transport, groundwork, connections and — for a container — the conversion and lining. That is the number that differs from the advertised one by the largest margin, and it is the only one that lets you compare a R60 000 quote to a R250 000 quote honestly.`,
      },
      {
        type: "p",
        text: `Then go and stand inside all three. Fifteen minutes does more than a week of reading, and it is the step people skip.`,
      },
      {
        type: "cta",
        text: `Our units are on site in ${site.showroom.city} and viewing is free, with no obligation to buy.`,
        href: "/book-a-viewing",
        label: "Book a free viewing",
      },
    ],
    faqs: [
      {
        q: "Is a container home cheaper than a housing pod?",
        a: "An unconverted container is cheaper than any pod. A properly converted, insulated and lined container home frequently is not, because the conversion is where the cost sits. Compare finished, insulated, connected units rather than a bare container against a finished pod.",
      },
      {
        q: "Is a housing pod better than a wendy house?",
        a: `For a room someone occupies, yes — insulation, factory finishing and weatherproofing are built in rather than added. For storage, a wendy house is the sensible buy and a pod is money spent on comfort nobody is there to use. Our X-Fold at ${R(folding)} ex VAT overlaps the premium nutec end of the wendy house market, which is where the two genuinely compete.`,
      },
      {
        q: "Can you insulate a shipping container properly?",
        a: "Yes, and good converters do. It requires insulation, a vapour barrier and a ventilation strategy, executed carefully — the failure mode is condensation trapped behind the lining. It also costs internal space in a format that has little to spare.",
      },
    ],
    references: [
      {
        title: "SANS 10400 — the application of the National Building Regulations",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/",
        note: "Plain-language reference on the deemed-to-satisfy standards any of these three structures is measured against once it is a habitable room.",
      },
      {
        title: "What it costs to build a house in South Africa",
        publisher: "ooba Home Loans",
        url: "https://www.ooba.co.za/resources/cost-to-build-a-house/",
        note: "Context for the conventional-build end of the comparison.",
      },
    ],
  },

  /* ================================================================ 3 ==== */
  {
    slug: "where-can-you-put-a-housing-pod",
    seoTitle: "Where Can You Put a Housing Pod in SA?",
    title: "Where can you put a housing pod? Plans, foundations and services in South Africa",
    description:
      "Before you buy a pod: what to ask your municipality, what base it needs, how services reach it, and the site-access problems that stop a delivery at the gate.",
    datePublished: "2026-09-02",
    keywords: [
      "do you need plans for a housing pod",
      "building plans prefab home South Africa",
      "housing pod foundation",
      "tiny home foundations South Africa",
      "second dwelling municipality approval",
      "prefab home site preparation",
    ],
    imageProduct: "expandable-homes",
    readingMinutes: 9,
    body: [
      {
        type: "p",
        text: `The pod is the easy part. Choosing it takes an afternoon. What decides whether the project goes smoothly is the property it lands on — and almost every expensive surprise in this market comes from leaving those questions until after the deposit.`,
      },
      {
        type: "p",
        text: `Four things to settle first, in the order that matters.`,
      },
      {
        type: "callout",
        title: "This is not legal advice",
        text: `Building approval in South Africa is administered locally, and requirements genuinely differ between municipalities. Nothing below replaces a call to your own building control department, and where this article and your municipality disagree, your municipality is right.`,
      },

      { type: "h2", text: "1. Does your municipality want plans?" },
      {
        type: "p",
        text: `The honest answer is: ask them, and ask before you commit to anything.`,
      },
      {
        type: "p",
        text: `Building work in South Africa sits under the National Building Regulations and Building Standards Act, with SANS 10400 setting the deemed-to-satisfy standards, and approval is granted by your local authority. There is a category of minor building work that is treated more lightly, and municipalities also take different views on structures that are relocatable rather than permanent — but how those apply to a second dwelling on your specific stand is a local determination, not something to infer from a forum post.`,
      },
      {
        type: "p",
        text: `Things that commonly matter to a building control department, and are worth having ready when you phone:`,
      },
      {
        type: "ul",
        items: [
          `The **footprint and height** of the unit, and its total floor area.`,
          `**How close to the boundary** you intend to stand it.`,
          `Whether it is a **second dwelling** on a stand that already has a house, and what your zoning permits.`,
          `Whether it will be **connected to municipal services** or run independently.`,
          `Whether it is **fixed or relocatable**, and how it is founded.`,
        ],
      },
      {
        type: "p",
        text: `Two more parties may have a say and are easy to forget: your **body corporate or homeowners' association**, whose rules can be stricter than the municipality's, and your **insurer**, who will want the structure declared. Both are far cheaper to consult before the unit arrives.`,
      },
      {
        type: "p",
        text: `We supply the dimensions and specifications for your submission. What we cannot do is tell you what your municipality will decide — anybody who promises you that outcome is guessing with your money.`,
      },

      { type: "h2", text: "2. What is it standing on?" },
      {
        type: "p",
        text: `Most units sit on a **level concrete slab** or on **properly levelled precast plinths**. The larger cabins and capsules are professionally assembled on a prepared foundation. We confirm the exact requirement for your model and site when you order.`,
      },
      {
        type: "p",
        text: `The word doing the work in both of those is *level*. A pod is a rigid, finished box that arrives square. Stand it on a base that is out and the box does not adjust — the doors bind, the windows stop closing cleanly, and in a unit with panoramic glazing the consequences get expensive. This is the one site error that is genuinely difficult and costly to correct afterwards, because fixing it means lifting the unit off again.`,
      },
      {
        type: "p",
        text: `Two other base questions worth asking early: **what the ground is** — soft, filled or waterlogged ground needs designing for, not hoping about — and **where the water goes**, because a pod placed at the bottom of a slope with nowhere for runoff to drain will find that out in the first serious storm.`,
      },
      {
        type: "p",
        text: `You can prepare the base yourself, use your own contractors with a Tiny Homes site manager guiding the process, or ask us to quote the turnkey installation: groundwork, plinths, connections, erection and handover.`,
      },

      { type: "h2", text: "3. How do water, sewerage and power reach it?" },
      {
        type: "p",
        text: `A pod is only self-contained once services get to it. What arrives already installed varies by range, and it is worth being precise about, because it changes what your plumber and electrician have to do:`,
      },
      {
        type: "ul",
        items: [
          `[X-Fold](/folding-homes): **electrics only** — two plug points, a light fitting and a small DB board. No plumbing. A bathroom or wet room is fitted by a local installer.`,
          `[Expandable homes](/expandable-homes): **bathroom and factory-installed plumbing and electrical** from the 18 m² up.`,
          `[Nature cabins](/nature-cabins): fully fitted — bathroom, kitchen, air conditioning and a storage water heater as standard.`,
          `[Apple Cabins](/apple-cabins): **integrated lighting and plumbing**, with bathroom fittings included in all three sizes.`,
          `[Glamping capsules](/glamping-capsules): **complete plumbing and electrical** with the bathroom, its fittings and a geyser standard on every model.`,
        ],
      },
      {
        type: "p",
        text: `In every case, something still has to connect the unit to the property: a water feed, a sewer or conservancy connection, and a tie-in to your DB board. That work is quoted separately and it is not trivial if the pod is a long way from the house.`,
      },
      {
        type: "p",
        text: `**Off-grid is a real option** across the range — solar, gas geysers and rainwater tanks, sized and quoted for your site. Decide it early rather than retro-fitting: on the fully-fitted units the electrical layout and the water heating are installed at the factory, and specification is much easier to change before the unit is built.`,
      },

      { type: "h2", text: "4. Can the delivery actually reach the spot?" },
      {
        type: "p",
        text: `This is the one that stops projects at the gate, and it is checked last far more often than it should be.`,
      },
      {
        type: "p",
        text: `Every range here except the X-Fold arrives as a finished unit that has to be lifted or rolled into its final position. The truck has to get close enough, and the unit has to travel the last stretch. Things that end deliveries:`,
      },
      {
        type: "ul",
        items: [
          `A **gate or driveway** narrower than the unit — a glamping capsule is up to 3.3 m wide, an expandable home wider still once open.`,
          `**Overhead power or telephone cables** on the approach, or low branches.`,
          `A **slope** the truck cannot hold, or a turning circle it cannot make.`,
          `**Soft ground** after rain, which is how a delivery vehicle ends up needing recovery.`,
          `A **wall, pool or established tree** between the drop point and the final position, with no crane access over it.`,
        ],
      },
      {
        type: "p",
        text: `The fix is free and takes ten minutes: photograph the route in — the street approach, the gate with something in frame for scale, the driveway, and the final position — and send them to us before you order. We would far rather tell you a unit will not fit than deliver one that does not.`,
      },
      {
        type: "p",
        text: `The X-Fold is the exception worth knowing about. It ships flat and unfolds in place, so it can go where nothing else can. On genuinely awkward sites, that alone sometimes decides the range.`,
      },

      { type: "h2", text: "A sensible order of operations" },
      {
        type: "ol",
        items: [
          `Phone your municipality's building control department. Free, and everything else depends on it.`,
          `Check your HOA or body corporate rules, if you have either.`,
          `Photograph the access route and the intended position, and send them to us.`,
          `Settle the base specification for the model you want.`,
          `Confirm where water, sewerage and power will come from — or specify off-grid.`,
          `Get the delivered, standing, connected total in writing.`,
          `Then pay a deposit.`,
        ],
      },
      {
        type: "p",
        text: `Move-in is typically around 90 days from deposit for most units, and on-site setup itself is quick: an X-Fold unfolds in minutes, an expandable home deploys within hours, and cabins and capsules are professionally assembled on a prepared site. Nearly all of that 90 days is manufacturing — which is exactly why the site questions should be answered while it is happening, not afterwards.`,
      },
      {
        type: "cta",
        text: `Send us your site photographs and we will tell you what will fit before you order anything.`,
        href: "/contact",
        label: "Ask about your site",
      },
    ],
    faqs: [
      {
        q: "Do you need council approval for a prefab home in South Africa?",
        a: "Frequently, and it is decided by your local municipality rather than by a single national rule. Building work falls under the National Building Regulations and Building Standards Act with SANS 10400 setting the standards, but how those apply to a relocatable second dwelling on your particular stand is a local determination. Phone your building control department before you commit — it costs nothing.",
      },
      {
        q: "What foundation does a prefab pod need?",
        a: "Most units sit on a level concrete slab or properly levelled precast plinths, with larger cabins and capsules professionally assembled on a prepared foundation. Level matters more than mass: the unit arrives square and rigid, and a base that is out shows up immediately in the doors and windows.",
      },
      {
        q: "How long does it take from deposit to move-in?",
        a: "Around 90 days for most units. On-site setup is the quick part — minutes for an X-Fold, hours for an expandable home, a few days for a cabin or capsule assembled on a prepared site. The bulk of the time is manufacturing, which is the window in which to sort out plans, groundwork and connections.",
      },
    ],
    references: [
      {
        title: "Plans and minor building work",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/minor-building-work/",
        note: "What the regulations treat as minor building work, and where that stops. Your municipality still makes the call on your stand.",
      },
      {
        title: "National Home Builders Registration Council",
        publisher: "NHBRC",
        url: "https://nhbrc.org.za/",
        note: "The home-warranty regulator. Relevant if a unit is being built for sale as a dwelling, and the place to check owner-builder exemption rules.",
      },
      {
        title: "Building statistics (Statistical release P5041.1)",
        publisher: "Statistics South Africa",
        url: "https://www.statssa.gov.za/publications/P50411/",
        note: "National data on plans passed, for a sense of how municipal approval volumes actually move.",
      },
    ],
  },
  /* ================================================================ 4 ==== */
  {
    slug: "is-a-prefab-home-cheaper-than-building",
    seoTitle: "Is a Prefab Home Cheaper Than Building?",
    title: "Is a prefab home cheaper than building in South Africa?",
    description:
      "Our own rand-per-square-metre figures set against what a conventional build costs — including the cases where prefab is the more expensive option.",
    datePublished: "2026-09-02",
    keywords: [
      "is prefab cheaper than building",
      "prefab vs brick house cost South Africa",
      "modular home cost comparison",
      "cost per square metre South Africa",
      "cheaper way to build a house South Africa",
      "prefab home price per square metre",
    ],
    imageProduct: "expandable-homes",
    readingMinutes: 9,
    body: [
      {
        type: "p",
        text: `Almost every prefab supplier in South Africa will tell you their product is cheaper than building. We sell prefab homes, and we think that answer is too simple to be useful — it depends entirely on what you put on the other side of the comparison, and there are cases where conventional building genuinely wins.`,
      },
      {
        type: "p",
        text: `So here are our own numbers, per square metre, against what a conventional build costs. Every figure in the first column comes off the same price list the product pages use.`,
      },

      { type: "h2", text: "What a conventional build costs per square metre" },
      {
        type: "p",
        text: `There is no single national number, and anyone who gives you one is rounding hard. Industry cost guides for 2026 put a mid-range conventional home somewhere in the region of **R10 000 to R15 000 per square metre**, with budget builds below that and luxury finishes well above. It varies by province, by finish level, and by how much of the site work is already done.`,
      },
      {
        type: "p",
        text: `Two things to hold on to about that number. It is a **construction** rate — it does not include the land, and it frequently excludes professional fees, municipal connections and site works. And it is an average of an enormous range: the same 40 m² in the same suburb can differ by a factor of two depending on the specification.`,
      },

      { type: "h2", text: "What our units cost per square metre" },
      {
        type: "table",
        caption: "Tiny Homes SA units by rand per square metre, ex VAT",
        head: ["Unit", "Floor area", "Price ex VAT", "Per m²", "What that buys"],
        rows: [
          ["X-Fold", "15 m²", R(folding), perM2("folding-homes"), "Insulated shell, electrics only, no plumbing"],
          ["Expandable 18 m²", "18 m²", R(expandable), perM2("expandable-homes", "b20-slim"), "Self-contained: bathroom, basic kitchen, services in"],
          ["Expandable 37 m²", "37 m²", R(expandable6m), perM2("expandable-homes", "b20"), "2 bedrooms, fitted bathroom, full kitchen"],
          ["Expandable 74 m²", "74 m²", R(expandable12m), perM2("expandable-homes", "b40"), "Up to 4 bedrooms, fitted throughout"],
          ["Apple Cabin", "13 m²", R(apple), perM2("apple-cabins", "apple-5-8"), "Panoramic glass, luxury bathroom fittings"],
          ["Nature Cabin", "26 m²", R(nature), perM2("nature-cabins"), "Fully fitted incl. kitchen, aircon, water heater"],
          ["Glamping Capsule", "18.6 m²", R(capsule), perM2("glamping-capsules", "capsule-5-85"), "270° glazing, premium bathroom, geyser"],
        ],
      },
      {
        type: "p",
        text: `Read that table honestly and it does not say "prefab is cheaper". It says three different things.`,
      },

      { type: "h3", text: "The shell is dramatically cheaper — because it is a shell" },
      {
        type: "p",
        text: `At ${perM2("folding-homes")} per square metre the [X-Fold](/folding-homes) is a fraction of any conventional rate. It is also a room with two plug points, a light and no plumbing. Compare it to building a bare insulated room, not to building a house, and the comparison is fair. Compare it to a granny flat and it is not.`,
      },

      { type: "h3", text: "The mid-range lands inside the conventional band" },
      {
        type: "p",
        text: `The [expandable homes](/expandable-homes) run from ${perM2("expandable-homes", "b20-slim")} down to ${perM2("expandable-homes", "b40")} per square metre as the size goes up — squarely inside the R10 000–R15 000 band a conventional mid-range build is quoted at. On a per-square-metre basis this is roughly a wash.`,
      },
      {
        type: "p",
        text: `Where it stops being a wash is what is inside the number. That rate already includes 75 mm EPS insulated walls, vinyl flooring, double glazing, a fitted bathroom and factory-installed plumbing and electrics. A conventional R/m² construction rate is frequently quoted before some of those. Compare like with like and the expandable is usually ahead — but not by the multiple the marketing in this industry implies.`,
      },

      { type: "h3", text: "The premium units cost more per square metre, and should" },
      {
        type: "p",
        text: `An [Apple Cabin](/apple-cabins) at ${perM2("apple-cabins", "apple-5-8")} per square metre or a [glamping capsule](/glamping-capsules) at ${perM2("glamping-capsules", "capsule-5-85")} is well above any conventional residential rate. That is not a prefab premium; it is a finish premium. You are buying floor-to-ceiling panoramic glazing, premium bathroom fittings and a unit built to be photographed and let out at a nightly rate. Building that conventionally would not be cheaper — it would be considerably more, and it would take a year.`,
      },
      {
        type: "callout",
        title: "The small-building penalty nobody mentions",
        text: `Rand per square metre rises sharply as buildings get smaller, whichever way you build. A bathroom costs roughly the same whether it sits in 18 m² or 180 m² — but in the small unit it is a much larger share of the total. This is why a 74 m² expandable is cheaper per square metre than an 18 m² one, and why comparing a tiny home's rate to a full house's rate flatters the house.`,
      },

      { type: "h2", text: "Where prefab wins, and it is not mainly price" },
      {
        type: "ul",
        items: [
          `**Time.** Around 90 days from deposit to move-in, with on-site setup running from minutes for an X-Fold to a few days for a cabin. A conventional build of the same size is a multi-month programme on your property.`,
          `**Price certainty.** You are quoted a figure for a finished unit. Conventional building is quoted on a rate and a scope, and the final number is the one nobody can tell you at the start.`,
          `**Disruption.** The building work happens somewhere else. There is no site, no rubble, no trades in your garden for months.`,
          `**Relocatability.** An X-Fold folds down; a pod lifts out. A brick room stays with the property whatever happens next.`,
        ],
      },

      { type: "h2", text: "Where conventional building wins" },
      {
        type: "ol",
        items: [
          `**You want a specific layout.** Prefab is catalogue-shaped. If the space has to fit an awkward site or an exact brief, conventional building does that and a factory unit does not.`,
          `**You are already building.** If contractors are on site for a larger project, adding a room to that scope is often cheaper than a separate delivered unit with its own transport and groundwork.`,
          `**You need bond finance.** More banks will lend against conventional construction than against a prefab structure — this is the single most underrated cost difference, and we have written it up separately in [can you get a home loan for a prefab home](/blog/prefab-home-finance-south-africa).`,
          `**Access is impossible.** If a truck and crane cannot reach the spot, the delivered-unit model does not work at any price.`,
        ],
      },

      { type: "h2", text: "The comparison that actually decides it" },
      {
        type: "p",
        text: `Compare **delivered, standing, connected and usable** — not sticker against rate. For a prefab that means the unit plus transport, groundwork and service connections. For a conventional build it means construction plus fees, connections and the contingency you will use. Both numbers are larger than the one first quoted, and they are the only two that can honestly sit next to each other.`,
      },
      {
        type: "p",
        text: `Then weigh the things that are not money: how long you are prepared to live with a building site, and how much you value knowing the final figure up front.`,
      },
      {
        type: "cta",
        text: `The quote builder prices a specific unit with your extras in a couple of minutes, so you have a real number to compare a builder's quote against.`,
        href: "/quote",
        label: "Price a unit",
      },
    ],
    faqs: [
      {
        q: "Is prefab always cheaper than brick in South Africa?",
        a: `No. Per square metre our expandable homes land inside the same band as a mid-range conventional build, our premium cabins and capsules sit well above it, and only the bare X-Fold shell is dramatically below. What prefab reliably beats is the timeline and the price certainty, not always the total.`,
      },
      {
        q: "What is the cheapest prefab option per square metre?",
        a: `The X-Fold, at ${perM2("folding-homes")} per square metre ex VAT. That figure is low because it is an insulated, wired shell with no plumbing — the fair comparison is a bare room, not a finished home.`,
      },
      {
        q: "Does a prefab home add value to a property?",
        a: "It depends whether it is fixed and approved. A permanently founded, municipally approved second dwelling is treated very differently from a relocatable unit standing on plinths — by valuers, by insurers and by banks. Decide which you are buying before you order, because it affects approval, finance and resale.",
      },
    ],
    references: [
      {
        title: "What it costs to build a house in South Africa",
        publisher: "ooba Home Loans",
        url: "https://www.ooba.co.za/resources/cost-to-build-a-house/",
        note: "Source for the conventional rand-per-square-metre band used throughout this article.",
      },
      {
        title: "Building statistics (Statistical release P5041.1)",
        publisher: "Statistics South Africa",
        url: "https://www.statssa.gov.za/publications/P50411/",
        note: "Official monthly building statistics — plans passed and buildings completed, by province and building type.",
      },
      {
        title: "SANS 10400 — the application of the National Building Regulations",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/",
        note: "The standards a habitable structure is measured against, whichever way it is built.",
      },
    ],
  },
  /* ================================================================ 5 ==== */
  {
    slug: "granny-flat-cost-south-africa",
    seoTitle: "Granny Flat Cost in South Africa",
    title: "How much does a granny flat cost in South Africa?",
    description:
      "What a second dwelling costs built conventionally versus delivered as a unit, what your municipality needs, and the rental maths that decides if it pays.",
    datePublished: "2026-09-02",
    keywords: [
      "granny flat cost South Africa",
      "how much does a granny flat cost",
      "second dwelling cost South Africa",
      "backyard cottage cost",
      "granny flat plans South Africa",
      "prefab granny flat price",
    ],
    imageProduct: "expandable-homes",
    readingMinutes: 9,
    body: [
      {
        type: "p",
        text: `A granny flat is the most-asked-about building in South Africa that nobody can price for you over the phone. The range is genuinely enormous — industry cost guides put a conventional Gauteng build anywhere from about R250 000 to over R1 000 000 — because "granny flat" covers everything from a converted garage to a two-bedroom cottage with its own kitchen.`,
      },
      {
        type: "p",
        text: `Here is how to narrow that down to a number you can actually plan around.`,
      },

      { type: "h2", text: "What you are actually buying" },
      {
        type: "p",
        text: `A granny flat — a **second dwelling** or **secondary dwelling** in municipal by-law language — is a self-contained home on a stand that already has one. Self-contained is the operative word: its own bathroom, its own kitchen, its own entrance. Strip any of those out and it is a room, not a dwelling, and both the municipality and your future tenant will treat it differently.`,
      },
      {
        type: "p",
        text: `That definition is what drives the cost. The bathroom and kitchen are the expensive parts, and they cost roughly the same whether the unit is 18 m² or 60 m².`,
      },

      { type: "h2", text: "Conventional build versus a delivered unit" },
      {
        type: "table",
        caption: "Granny flat routes compared on cost, timeline and certainty",
        head: ["", "Conventional build", "Delivered unit"],
        rows: [
          ["Typical outlay", "R250 000 – R1 000 000+ (Gauteng guides)", `From ${R(expandable)} ex VAT`],
          ["Quoted as", "A rate plus a scope", "A price for a finished unit"],
          ["Time on your property", "Months", "Hours to a few days"],
          ["Layout freedom", "Whatever you can draw", "Catalogue sizes"],
          ["Final cost known", "At the end", "Before you order"],
          ["Can it leave with you", "No", "Yes"],
        ],
      },
      {
        type: "p",
        text: `Our [expandable homes](/expandable-homes) are the range bought for this job. The compact 18 m² at ${R(expandable)} ex VAT is not a bare shell — it includes a bathroom and a small basic kitchen, with 75 mm EPS insulated walls, vinyl flooring, double-glazed windows and factory-installed plumbing and electrics. The 37 m² at ${R(expandable6m)} adds two bedrooms and a full stainless-steel kitchen; the 74 m² at ${R(expandable12m)} goes up to four bedrooms.`,
      },
      {
        type: "p",
        text: `All of those arrive as one module and expand on site within hours. Where a conventional granny flat means months of trades in the garden, this is a delivery.`,
      },
      {
        type: "callout",
        title: "The number to compare",
        text: `A delivered-unit price is a factory-gate price. Add transport, a level slab or plinths, and the water, sewerage and electrical connections back to the house. A conventional quote usually excludes fees and connections too. Get both to "standing, connected and usable" before you compare them, or you are comparing two different things.`,
      },

      { type: "h2", text: "What the municipality needs from you" },
      {
        type: "p",
        text: `This is the step people skip, and it is the one that can stop the project. A second dwelling touches two separate questions:`,
      },
      {
        type: "ul",
        items: [
          `**Zoning** — does your stand's zoning permit a second dwelling at all? Some do, some allow it only with consent, some do not.`,
          `**Building plans** — municipalities generally require approved plans for a second dwelling, and views differ on relocatable structures. Coverage limits, height and how close to a boundary you may build all come into it.`,
        ],
      },
      {
        type: "p",
        text: `Both are decided by your local authority, not by a national rule and not by us. Phone your building control department before you commit — it is a free call and everything else depends on it. If you are in a complex or estate, your body corporate or HOA rules can be stricter than the municipality's. We supply the unit's dimensions and specifications for your submission. There is more detail in [where can you put a housing pod](/blog/where-can-you-put-a-housing-pod), which covers plans, foundations and site access in full.`,
      },

      { type: "h2", text: "Does it pay for itself?" },
      {
        type: "p",
        text: `Often, and this is the real reason the search volume is what it is. Run the arithmetic yourself rather than trusting anyone's headline yield:`,
      },
      {
        type: "ol",
        items: [
          `Find what a comparable self-contained unit actually lets for **in your suburb** — not the city average. Search current listings, not agent estimates.`,
          `Subtract what it costs you to run: rates impact, insurance, maintenance, and the months it stands empty between tenants.`,
          `Divide the total delivered-and-connected cost by the annual net figure. That is your payback in years.`,
          `Ask what the same money does elsewhere over the same period before you commit it to a building.`,
        ],
      },
      {
        type: "p",
        text: `Two honest caveats. Rental income is not guaranteed, and a unit that is not approved is harder to let, harder to insure and harder to sell. And a granny flat put up for family rather than income does not need to pay back at all — the value is that someone has their own front door.`,
      },

      { type: "h2", text: "Which size to choose" },
      {
        type: "ul",
        items: [
          `**One person, or a parent nearby** — the 18 m² compact at ${R(expandable)} ex VAT. Self-contained, and the smallest footprint that still counts as a dwelling.`,
          `**A couple, or a lettable unit** — the 37 m² at ${R(expandable6m)}: two bedrooms, a fitted bathroom and a full kitchen. This is the size most rental demand sits at.`,
          `**A family, or a permanent second home** — the 74 m² at ${R(expandable12m)}, with layouts up to four bedrooms.`,
          `**A guest suite rather than a let** — an [Apple Cabin](/apple-cabins) from ${R(apple)} ex VAT, if the unit is going to be looked at as much as lived in.`,
        ],
      },
      {
        type: "cta",
        text: `See the sizes, what is fitted in each, and what the extras cost.`,
        href: "/expandable-homes",
        label: "Expandable homes",
      },
    ],
    faqs: [
      {
        q: "How much does a granny flat cost in South Africa?",
        a: `Conventionally built, industry cost guides put a Gauteng granny flat somewhere between about R250 000 and R1 000 000 depending on size and finish. As a delivered unit, our expandable homes start at ${R(expandable)} ex VAT for a self-contained 18 m² with its own bathroom and a small basic kitchen. Add transport, groundwork and service connections to either figure.`,
      },
      {
        q: "Do I need council approval for a granny flat?",
        a: "Generally yes, and there are two questions rather than one: whether your zoning permits a second dwelling at all, and whether the structure needs approved building plans. Both are decided by your local municipality. Phone their building control department before ordering anything — and check your HOA or body corporate rules, which can be stricter.",
      },
      {
        q: "Is a prefab granny flat cheaper than building one?",
        a: "Usually on time and on certainty, and often on total cost — but not by the multiple this industry likes to imply. Per square metre our expandable homes land inside the same band as a mid-range conventional build; the difference is that the rate already includes insulation, glazing, a fitted bathroom and installed services.",
      },
      {
        q: "Can I get a bond for a granny flat?",
        a: "Financing a prefab second dwelling is harder than financing conventional construction, and banks differ sharply on it. We cover which South African banks will and will not lend against a prefab structure in our guide to prefab home finance.",
      },
    ],
    references: [
      {
        title: "Cost of building a 1-bedroom house (granny flat) in South Africa",
        publisher: "Kandua",
        url: "https://kandua.com/cost-guides/cost-of-building-a-1-bedroom-house-granny-flat-in-south-africa",
        note: "Industry cost guide used for the conventional-build range quoted here. Contractor-sourced estimates, not official statistics.",
      },
      {
        title: "What it costs to build a house in South Africa",
        publisher: "ooba Home Loans",
        url: "https://www.ooba.co.za/resources/cost-to-build-a-house/",
        note: "Cross-check on conventional rand-per-square-metre rates.",
      },
      {
        title: "Plans and minor building work",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/minor-building-work/",
        note: "Background on when building plan approval is required. Your municipality makes the final call.",
      },
    ],
  },

  /* ================================================================ 6 ==== */
  {
    slug: "prefab-home-finance-south-africa",
    seoTitle: "Can You Get a Home Loan for a Prefab Home?",
    title: "Can you get a home loan for a prefab home in South Africa?",
    description:
      "Which South African banks will bond a prefab home and which will not, the conditions FNB and Nedbank attach, and what works when a bond does not.",
    datePublished: "2026-09-02",
    keywords: [
      "home loan prefab house South Africa",
      "bond for prefab home",
      "finance a modular home South Africa",
      "can you get a mortgage on a prefab house",
      "prefab home finance",
      "tiny home finance South Africa",
    ],
    imageProduct: "nature-cabins",
    readingMinutes: 8,
    body: [
      {
        type: "p",
        text: `This is the question that quietly ends more prefab purchases than price does, and most suppliers are vague about it. So, plainly: **a conventional bond on a prefabricated home is harder to get in South Africa than a bond on a brick house, and some major banks will not do it at all.**`,
      },
      {
        type: "p",
        text: `That is not a reason to walk away. It is a reason to sort the money out before you fall in love with a unit.`,
      },

      { type: "h2", text: "Where the banks stand" },
      {
        type: "p",
        text: `According to bond originator ooba, which places home loans across all the major South African lenders, the positions differ sharply:`,
      },
      {
        type: "table",
        caption: "South African bank positions on bonding a prefabricated home",
        head: ["Bank", "Position", "What that means in practice"],
        rows: [
          ["Standard Bank", "Not currently bonding prefab", "Reported as falling outside their acceptable security requirements"],
          ["Absa", "Not currently bonding prefab", "Same position — outside acceptable security"],
          ["FNB", "Open, with conditions", "The home must be fixed to a foundation and comply with the National Building Regulations"],
          ["Nedbank", "Open, structured differently", "Land and unit assessed separately; land financing reported to require a 50% deposit"],
        ],
      },
      {
        type: "p",
        text: `Bank policy changes, and these are reported positions rather than a quote — confirm directly with the bank or a bond originator before you plan around any of it. But the shape of the answer has been stable for a while, and it tells you what matters.`,
      },

      { type: "h2", text: "What the lenders are actually worried about" },
      {
        type: "p",
        text: `A bond is secured against something the bank could sell if you stopped paying. That security logic explains every condition above:`,
      },
      {
        type: "ul",
        items: [
          `**Is it fixed, or can it be driven away?** A structure that can be lifted onto a truck is weak security. This is why FNB's condition is a fixed foundation — it is the difference between a building and a large movable asset.`,
          `**Is it approved?** Compliance with the National Building Regulations is what makes it a lawful permanent structure. An unapproved building is a liability on a valuation, not an asset.`,
          `**Will it hold value?** Bonds run for twenty years. The lender is asking what the structure is worth in year fifteen, and there is thinner resale data for prefab than for brick.`,
        ],
      },
      {
        type: "callout",
        title: "The decision this forces you to make early",
        text: `Fixed and approved, or relocatable? Fixed-and-approved opens the widest finance options and behaves like property for valuation and resale. Relocatable keeps the flexibility to take the unit with you, but narrows finance sharply. Both are legitimate — just decide before you order, because the foundation specification follows from it.`,
      },

      { type: "h2", text: "The routes that work when a bond does not" },
      {
        type: "ol",
        items: [
          `**Third-party finance.** ${site.finance}. This is the route most of our customers use. You will need a valid SA ID or passport, your latest three months' bank statements, payslips or proof of income and a good credit record; a deposit may be required depending on the unit.`,
          `**Access bond or further advance.** If you already own property with equity, drawing against an existing bond is often the cheapest money available — and the bank is lending against the house it already holds, not against the new unit.`,
          `**Personal or unsecured lending.** Faster and less fussy about what you buy, but the interest rate reflects that. Realistic for the lower end of the range rather than a capsule.`,
          `**Cash, in stages.** Uncommon with conventional building, but a genuine option here: the units are discrete products with published prices, so buying a smaller one now and a second later is a real plan rather than a fantasy. An [X-Fold](/folding-homes) at ${R(folding)} ex VAT is a very different funding problem from a [glamping capsule](/glamping-capsules) at ${R(capsule)}.`,
        ],
      },

      { type: "h2", text: "How to prepare, in order" },
      {
        type: "ol",
        items: [
          `Decide fixed-and-approved versus relocatable. Everything else follows.`,
          `Talk to your municipality about approval for the structure you have in mind.`,
          `Speak to a bond originator or your own bank **before** paying a deposit, and ask specifically about a prefabricated structure — not about "a home".`,
          `Get the total delivered, standing and connected cost in writing, since that is what has to be funded, not the unit price.`,
          `Then ask us about the third-party finance option if a bond is not going to work.`,
        ],
      },
      {
        type: "p",
        text: `One thing to be clear about on our side: finance is provided by an outside provider and approval is their decision, never ours. A home is either paid for in full or financed by that provider, subject to credit approval.`,
      },
      {
        type: "p",
        text: `If the finance answer pushes you toward a smaller unit than you hoped for, that is worth knowing before you shop rather than after. The [expandable homes](/expandable-homes) from ${R(expandable)} ex VAT are the cheapest genuinely self-contained option, and the full range with prices sits on the [housing pods page](/housing-pods).`,
      },
      {
        type: "cta",
        text: `Price the unit you want first — the finance conversation is much shorter when you know the number.`,
        href: "/quote",
        label: "Get an instant quote",
      },
    ],
    faqs: [
      {
        q: "Will a South African bank give me a bond on a prefab home?",
        a: "Some will and some will not. Standard Bank and Absa have been reported as not currently bonding prefabricated structures, as they fall outside their acceptable security requirements. FNB is open to it where the home is fixed to a foundation and complies with the National Building Regulations, and Nedbank assesses the land and the unit separately, with a reported 50% deposit requirement on the land. Confirm current policy with the bank or a bond originator.",
      },
      {
        q: "Why is it harder to finance a prefab home?",
        a: "Because a bond is secured against something the bank could sell. A structure that can be lifted onto a truck is weaker security than a brick house, and there is less resale data to value it against over a twenty-year term. Fixing the unit to a permanent foundation and getting it approved addresses most of that concern.",
      },
      {
        q: "How can I finance a tiny home if I cannot get a bond?",
        a: `${site.finance}. Beyond that, an access bond or further advance against property you already own is usually the cheapest option, and unsecured lending works at the lower end of the range. Ask us when you request a quote and we will point you at the provider.`,
      },
      {
        q: "Does the unit need approved plans to be financed?",
        a: "For FNB it is explicit — the home must comply with the National Building Regulations and be fixed to a foundation. More broadly, an approved permanent structure is treated as property while an unapproved one is a problem on a valuation, so approval helps with finance, insurance and resale alike.",
      },
    ],
    references: [
      {
        title: "Prefab homes: will the bank grant you a bond?",
        publisher: "ooba Home Loans",
        url: "https://www.ooba.co.za/resources/prefab-homes/",
        note: "Source for every bank position quoted in this article, including the FNB foundation and National Building Regulations conditions and the Nedbank land-deposit structure.",
      },
      {
        title: "SANS 10400 — the application of the National Building Regulations",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/",
        note: "The standards FNB's compliance condition refers to.",
      },
      {
        title: "National Home Builders Registration Council",
        publisher: "NHBRC",
        url: "https://nhbrc.org.za/",
        note: "Home-warranty registration, which lenders may ask about on a new dwelling.",
      },
    ],
  },
  /* ================================================================ 7 ==== */
  {
    slug: "start-a-glamping-business-south-africa",
    seoTitle: "Starting a Glamping Business in South Africa",
    title: "Starting a glamping business in South Africa: what the units cost",
    description:
      "Unit costs, what is standard versus an extra, and the occupancy arithmetic that decides whether a glamping site actually pays.",
    datePublished: "2026-09-02",
    keywords: [
      "start a glamping business South Africa",
      "glamping business setup cost",
      "glamping pods for sale South Africa",
      "eco lodge accommodation units",
      "Airbnb cabin investment South Africa",
      "glamping site startup",
    ],
    imageProduct: "glamping-capsules",
    readingMinutes: 10,
    body: [
      {
        type: "p",
        text: `Glamping is one of the few genuinely growing accommodation categories in South Africa. Market research puts the local glamping market at around **USD 28 million in 2025, forecast to reach roughly USD 76 million by 2034** — a compound growth rate above 11% — with cabins and pods the largest revenue-generating accommodation type.`,
      },
      {
        type: "p",
        text: `That is the encouraging half. Here is the other half, and the reason to read the arithmetic before the brochure: national accommodation occupancy was reported at **around 40% in January 2026**. Your units stand empty more nights than they are let. Any plan that assumes otherwise is not a plan.`,
      },

      { type: "h2", text: "What the units cost" },
      {
        type: "table",
        caption: "Tiny Homes SA accommodation units for a glamping or lodge operation",
        head: ["Unit", "From (ex VAT)", "Size", "Standard inclusions", "Suits"],
        rows: [
          ["Apple Cabin", R(apple), "13 – 26.5 m²", "Luxury bathroom fittings all sizes; kitchenette on 9 m and 11.8 m", "Entry to the premium end; strong photography"],
          ["Glamping Capsule", R(capsule), "18.6 – 38 m²", "Bathroom + premium fittings, geyser, insulation, smart entry", "Flagship units where the room is the reason for the booking"],
          ["Nature Cabin", R(nature), "26 m²", "Bathroom, kitchen, air conditioning, water heater — all fitted", "Longer stays; nothing left to add"],
          ["Safari Tent", "On request", "Per project", "Trade only — supplied and installed with Bushtec", "Lodges and resorts wanting canvas"],
        ],
      },
      {
        type: "p",
        text: `A note on the [glamping capsules](/glamping-capsules): the bathroom, its premium fittings, a geyser, multi-layer insulation, plumbing and electrics, lighting and intelligent front-door access are standard on every model. The **kitchen and air conditioning are extras**. For a glamping operation that is usually the right way round — most sites feed guests centrally and do not want a kitchen in every unit — but price it deliberately rather than assuming.`,
      },
      {
        type: "p",
        text: `[Apple Cabins](/apple-cabins) from ${R(apple)} ex VAT are the lower-capital entry, with panoramic glazing and luxury bathroom fittings in all three sizes. [Nature cabins](/nature-cabins) at ${R(nature)} are the most completely fitted thing we sell — kitchen, air conditioning and water heater standard — which suits longer stays. [Safari tents](/safari-tents) are a trade offering supplied to businesses and hospitality operators only, quoted per project.`,
      },

      { type: "h2", text: "The costs that are not the unit" },
      {
        type: "p",
        text: `Unit price is the part everyone budgets. These are the parts that surprise operators:`,
      },
      {
        type: "ul",
        items: [
          `**Transport to site**, quoted on distance and access — and glamping sites are, by definition, usually not next to a main road.`,
          `**Groundwork**: a level slab or properly levelled plinths, per unit, plus decking and paths.`,
          `**Services**: water, sewerage or a treatment solution, and power to each unit. On remote sites this is frequently the largest line after the units themselves.`,
          `**Approval and land use**: tourist accommodation is a land-use question as much as a building one, and a rural stand may need consent for the use, not just plans for the structure.`,
          `**Everything a guest touches**: linen, furniture, fittings, a booking system, signage, insurance, staff.`,
        ],
      },
      {
        type: "callout",
        title: "Build the model on the units you can fund now",
        text: `Occupancy at 40% nationally means the difference between three units and six is not a doubling of profit — it is a doubling of fixed cost against a market that may not fill either. Most successful small sites start with a couple of units, learn their real occupancy and rate, then add. That is also the cheaper mistake if the location turns out not to work.`,
      },

      { type: "h2", text: "The arithmetic that decides it" },
      {
        type: "ol",
        items: [
          `**Find the real nightly rate** for comparable units within an hour of your site. Current live listings, not aspiration.`,
          `**Choose an occupancy you can defend.** Start below the national figure for a new, unknown site with no reviews. Model 30%, 40% and 50% and see which of them still works.`,
          `**Subtract the running cost**: cleaning and linen per stay, platform commission, power and water, maintenance, insurance, staff.`,
          `**Divide total setup — units, transport, groundwork, services, fit-out — by annual net.** That is payback in years.`,
          `**Then ask what happens in a bad year.** A site that only works at 55% occupancy is a site that fails in its first winter.`,
        ],
      },
      {
        type: "p",
        text: `We can tell you exactly what a unit costs, delivered. We cannot tell you what it will earn, and any supplier who offers you a yield figure for your site is guessing with your money.`,
      },

      { type: "h2", text: "What makes a unit book" },
      {
        type: "p",
        text: `The reason this category grew is that the accommodation itself became the product. A guest chooses a pod over a perfectly good hotel room because it photographs unlike anything else and because it puts them somewhere a hotel cannot. Practically, that means:`,
      },
      {
        type: "ul",
        items: [
          `**The view through the glass is the product.** 270° glazing pointed at a parking area is money wasted. Site the units for the outlook before anything else.`,
          `**Separation matters more than size.** Guests pay for privacy. Units in a row facing each other undo the thing they came for.`,
          `**Year-round comfort protects the rate.** Insulation, glazing and heating are what let you charge in July as well as December. Air conditioning is an extra on the capsules — for a commercial site it is rarely optional.`,
          `**Delivery speed is revenue.** Capsules and Apple Cabins arrive fully built and are ready within hours to days on a prepared site, so the site is not closed for a construction season.`,
        ],
      },
      {
        type: "cta",
        text: `Units are on site at our showroom in ${site.showroom.city} — worth walking through before committing capital to a fleet of them.`,
        href: "/book-a-viewing",
        label: "Book a viewing",
      },
    ],
    faqs: [
      {
        q: "How much does it cost to start a glamping business in South Africa?",
        a: `The units are the biggest single line: Apple Cabins from ${R(apple)} ex VAT, glamping capsules from ${R(capsule)}, nature cabins at ${R(nature)}. On top of that budget transport, a level base per unit, water, sewerage and power to each site, decking and paths, and full guest fit-out. Land use and building approval are separate again.`,
      },
      {
        q: "Which unit is best for a glamping site?",
        a: "Glamping capsules where the unit itself is the reason for the booking and you want the highest nightly rate; Apple Cabins where you want the premium look at lower capital per key; nature cabins for longer stays, since kitchen, air conditioning and water heater are fitted as standard. Safari tents are trade only, quoted per project.",
      },
      {
        q: "What occupancy should I plan for?",
        a: "National accommodation occupancy was reported at around 40% in January 2026. A new site with no reviews should model below that and check the plan still works at 30%. Any model that only breaks even above 50% is fragile.",
      },
      {
        q: "Do glamping units need building plans?",
        a: "Usually, and tourist accommodation raises a land-use question as well — a rural stand may need consent for the use itself, not just plans for the structures. Both are decided by your local municipality, so speak to them before committing to a layout.",
      },
    ],
    references: [
      {
        title: "South Africa glamping market size, share and forecast",
        publisher: "IMARC Group",
        url: "https://www.imarcgroup.com/south-africa-glamping-market",
        note: "Source for the market size (USD 28.1m in 2025, forecast USD 76.5m by 2034, 11.42% CAGR) and for cabins and pods being the largest accommodation segment by revenue.",
      },
      {
        title: "South Africa accommodation occupancy rate",
        publisher: "CEIC Data",
        url: "https://www.ceicdata.com/en/south-africa/accommodation-statistics/accommodation-occupancy-rate",
        note: "Source for the ~40.4% national occupancy figure reported for January 2026.",
      },
      {
        title: "Tourism statistics",
        publisher: "Statistics South Africa",
        url: "https://www.statssa.gov.za/?cat=36",
        note: "Official tourist accommodation and tourism releases — the primary data behind occupancy and income figures.",
      },
    ],
  },

  /* ================================================================ 8 ==== */
  {
    slug: "off-grid-tiny-home-south-africa",
    seoTitle: "Off-Grid Tiny Homes in South Africa",
    title: "Taking a tiny home off-grid in South Africa: power, water and sewerage",
    description:
      "What running a prefab home off-grid involves — solar sizing, water supply, waste treatment — and the decisions to make before the unit is built.",
    datePublished: "2026-09-02",
    keywords: [
      "off grid tiny home South Africa",
      "off grid cabin South Africa",
      "solar power tiny house",
      "off grid water sewerage South Africa",
      "self sufficient prefab home",
      "off grid living South Africa",
    ],
    imageProduct: "nature-cabins",
    readingMinutes: 9,
    body: [
      {
        type: "p",
        text: `Off-grid is not one decision. It is three — power, water and waste — and they are independent. Plenty of South African sites are off-grid for electricity and on municipal water, or on borehole water with a grid connection. Working out which of the three you actually need is the first job, and it changes what the unit has to be.`,
      },
      {
        type: "p",
        text: `The whole range can be paired with solar power, gas geysers and rainwater tanks, sized and quoted for your model and site. What follows is what to think about before you ask for that quote.`,
      },

      { type: "h2", text: "Power" },
      {
        type: "p",
        text: `Solar sizing is driven by what you run, not by the size of the building. The pattern that catches people out is that the small, boring loads — a fridge running all day, a geyser element, a kettle — dominate, while lights barely register.`,
      },
      {
        type: "ul",
        items: [
          `**Water heating is the biggest single load.** An electric geyser element will size your entire system on its own. Moving hot water to gas, or to a heat pump, changes the economics of everything downstream.`,
          `**The fridge sets the overnight battery.** It is the load that never stops, so it determines how much storage you need to get to morning.`,
          `**Heating and cooling are seasonal spikes.** Air conditioning in a Limpopo February is a different system from the one that covers a mild spring.`,
          `**Winter is the design case.** Size on the worst month, not the average, or the system that works in November fails in June.`,
        ],
      },
      {
        type: "p",
        text: `Insulation is the cheapest energy decision you will make, because a unit that holds its temperature needs less of everything else. The [expandable homes](/expandable-homes) come with 75 mm EPS insulated walls and offer a polyurethane upgrade; the [nature cabins](/nature-cabins) use polyurethane-insulated walls; the [glamping capsules](/glamping-capsules) use multi-layer thermal insulation, with a 100 mm polyurethane upgrade on the Space range. Double glazing is standard across the fitted ranges.`,
      },

      { type: "h2", text: "Water" },
      {
        type: "p",
        text: `Three sources, usually in combination: **municipal**, **borehole** and **rainwater**. Rainwater is the one people over-estimate — a roof the size of a tiny home's collects far less than intuition suggests, and South African rainfall is seasonal almost everywhere, so tank capacity has to carry the dry months, not the average.`,
      },
      {
        type: "ul",
        items: [
          `Work out the **dry-season gap**, not the annual total. That gap sizes the tank.`,
          `Borehole water needs **testing and usually treatment** before anyone drinks it, and the pump is an electrical load your solar system has to carry.`,
          `**Pressure** matters for how the unit feels to live in. A gravity-fed tank behaves very differently from a pumped supply at a shower head.`,
        ],
      },

      { type: "h2", text: "Sewerage" },
      {
        type: "p",
        text: `The least glamorous decision and the one most likely to be regulated. Where there is no municipal connection the options run from conservancy tanks (sealed, pumped out periodically) through septic-and-soakaway to package treatment plants — and which are permitted depends on your soil, your water table, the site's proximity to watercourses and your local authority's rules.`,
      },
      {
        type: "p",
        text: `Get this specified early. It is a civil works job on your site rather than something the unit arrives with, and it has a way of costing more than people budget.`,
      },
      {
        type: "callout",
        title: "Decide before the unit is built, not after",
        text: `On the fitted ranges the electrical layout and the water heating are installed at the factory. Changing the specification before it is built is a conversation; changing it after delivery is a retrofit into a finished, insulated unit. Off-grid intentions belong on the order, not on the snag list.`,
      },

      { type: "h2", text: "What arrives ready, and what does not" },
      {
        type: "ul",
        items: [
          `[X-Fold](/folding-homes): electrics only — two plug points, a light fitting and a small DB board. **No plumbing.** The blankest canvas here, and the cheapest to adapt.`,
          `[Expandable homes](/expandable-homes): bathroom with factory-installed plumbing and electrical from the 18 m² up.`,
          `[Apple Cabins](/apple-cabins): integrated lighting and plumbing, bathroom fittings in all three sizes.`,
          `[Glamping capsules](/glamping-capsules): complete plumbing and electrics, bathroom and geyser standard on every model.`,
          `[Nature cabins](/nature-cabins): the most complete — bathroom, kitchen, air conditioning and a storage water heater fitted as standard.`,
        ],
      },
      {
        type: "p",
        text: `In every case the unit arrives ready to be connected to something. Solar, gas geysers and rainwater tanks are sized and quoted for your site rather than sold as a standard package, because a Karoo farm and a coastal plot are not the same problem.`,
      },

      { type: "h2", text: "A sensible order" },
      {
        type: "ol",
        items: [
          `Decide which of power, water and waste are genuinely off-grid on your site.`,
          `List your real electrical loads, honestly, including the fridge and any water heating.`,
          `Settle water heating first — it moves the solar sizing more than anything else.`,
          `Ask the municipality what sewerage solutions are permitted where you are.`,
          `Then choose the unit, and put the off-grid specification on the order.`,
        ],
      },
      {
        type: "cta",
        text: `Tell us the site and the loads and we will size and quote the off-grid setup with the unit.`,
        href: "/contact",
        label: "Ask about your site",
      },
    ],
    faqs: [
      {
        q: "Can a prefab tiny home run completely off-grid?",
        a: "Yes. The range is designed to pair with solar power, gas geysers and rainwater tanks, sized and quoted for your model and site. Power, water and sewerage are three separate decisions, and many sites are off-grid for only one or two of them.",
      },
      {
        q: "What is the biggest electrical load in an off-grid tiny home?",
        a: "Water heating, by a wide margin — an electric geyser element will size the whole system on its own. Moving hot water to gas changes the economics of everything downstream. The fridge is second, because it runs continuously and therefore sets your overnight battery capacity.",
      },
      {
        q: "Is rainwater enough for a tiny home in South Africa?",
        a: "Rarely on its own. A small roof collects less than people expect, and rainfall here is seasonal almost everywhere, so tanks have to carry the dry months rather than the annual average. Most off-grid sites combine rainwater with a borehole or a municipal connection.",
      },
      {
        q: "Which unit is easiest to set up off-grid?",
        a: "The X-Fold is the blankest canvas because it arrives with electrics only and no plumbing, so nothing has to be undone. The nature cabin is the opposite — the most fitted unit, which means the off-grid specification needs to be agreed before it is built rather than retrofitted after.",
      },
    ],
    references: [
      {
        title: "SANS 10400 — the application of the National Building Regulations",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/",
        note: "Includes the parts covering drainage, non-water-borne sanitation and energy usage in buildings, which govern what off-grid solutions are permitted.",
      },
      {
        title: "Plans and minor building work",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/minor-building-work/",
        note: "Background on approval requirements — sewerage and water solutions are frequently the part a municipality scrutinises most.",
      },
    ],
  },

  /* ================================================================ 9 ==== */
  {
    slug: "staff-accommodation-units-south-africa",
    seoTitle: "Staff Accommodation Units in South Africa",
    title: "Staff accommodation and site offices: what a unit costs",
    description:
      "Costing accommodation for farm, mine and construction staff: unit prices, what arrives wired or plumbed, and the ablution question that sets the budget.",
    datePublished: "2026-09-02",
    keywords: [
      "staff accommodation units South Africa",
      "farm worker housing South Africa",
      "site office for sale South Africa",
      "construction site accommodation",
      "mine accommodation units",
      "prefab staff housing cost",
    ],
    imageProduct: "folding-homes",
    readingMinutes: 8,
    body: [
      {
        type: "p",
        text: `Housing staff on a farm, a mine or a construction site is a different purchase from buying a home. The unit matters less than the cost per bed, how fast it can be standing, and whether it can move to the next site when this one finishes.`,
      },
      {
        type: "p",
        text: `Here is how the range prices out for that job.`,
      },

      { type: "h2", text: "The two units that suit it" },
      {
        type: "table",
        caption: "Units for staff accommodation and site offices",
        head: ["", "X-Fold", "Expandable home"],
        rows: [
          ["From (ex VAT)", R(folding), R(expandable)],
          ["Floor area", "15 m²", "18 – 74 m²"],
          ["Plumbing", "None — shared ablutions or local fit-out", "Bathroom and services installed"],
          ["Electrics", "2 plugs, light, small DB board", "Full installation"],
          ["Setup", "Unfolds in minutes, 2 people", "Expands on site within hours"],
          ["Stackable", "Two units high", "No"],
          ["Relocatable", "Folds down and moves", "Moves, but not folded"],
        ],
      },
      {
        type: "p",
        text: `For volume deployment the [X-Fold](/folding-homes) at ${R(folding)} ex VAT is the workhorse. It ships flat — which matters when you are moving twenty of them — and two people unfold it in minutes with no specialist crew. It carries upgraded floor beams, EPS insulation and a basic electrical setup, and it stacks two high where ground space is tight.`,
      },
      {
        type: "p",
        text: `The [expandable homes](/expandable-homes) from ${R(expandable)} are the answer where staff need self-contained accommodation rather than a room: bathroom, small basic kitchen and installed services from the 18 m² up. Larger sizes suit family accommodation or a supervisor's unit.`,
      },

      { type: "h2", text: "The ablution question decides your budget" },
      {
        type: "p",
        text: `This is the decision that moves the number more than anything else, and it is worth making before you count units.`,
      },
      {
        type: "p",
        text: `The X-Fold arrives **wired but not plumbed**. That is deliberate and it is what keeps the price where it is. It gives you two routes: a **shared ablution block** serving several units, or a local installer fitting a wet room into each. Shared blocks are almost always cheaper per bed at any scale, and they concentrate the plumbing into one civil job rather than twenty. Per-unit fit-out buys privacy and suits family or supervisor accommodation.`,
      },
      {
        type: "callout",
        title: "Cost per bed, not cost per unit",
        text: `Divide the total — units, transport, groundwork, ablutions and connections — by the number of people actually housed. A cheaper unit that needs its own plumbing can lose to a more expensive one that does not, and neither price tag tells you that on its own.`,
      },

      { type: "h2", text: "Site offices" },
      {
        type: "p",
        text: `The same unit does this job. An X-Fold unfolds into a weather-tight 15 m² site office in minutes, so the project office is open the day the unit lands rather than a fortnight later, with plug points, a light and a small DB board already wired. When the job finishes it folds back down and goes to the next site.`,
      },
      {
        type: "p",
        text: `Worth comparing against hire rates over the real project duration: on a long programme, buying and relocating a unit you keep is often the cheaper answer, and you own an asset at the end. It also doubles as a lockable, insulated storeroom for tools and stock — the steel frame and steel door take daily use.`,
      },

      { type: "h2", text: "What to check before you order" },
      {
        type: "ol",
        items: [
          `**Access for the delivery.** X-Folds ship flat and can be carried in, which is why they work on sites nothing else reaches. Expandables arrive as a module and need a truck close by.`,
          `**Ground and base.** Level slab or properly levelled plinths, per unit. On a temporary site this is still not optional — a unit standing out of level does not close properly.`,
          `**Ablutions and services**, per the section above. Settle this first.`,
          `**Approval.** Even temporary staff accommodation can be a land-use and building question. Ask the local authority.`,
          `**The legal context.** Housing people on land you own — particularly farm workers — carries obligations beyond the building itself. That is a question for your own legal advisor, not for a supplier.`,
        ],
      },
      {
        type: "p",
        text: `For volume orders, tell us the number of units and the site and we will quote the delivery as one run rather than unit by unit.`,
      },
      {
        type: "cta",
        text: `Tell us how many people you need to house and where, and we will price the units and the delivery together.`,
        href: "/contact",
        label: "Ask about a volume order",
      },
    ],
    faqs: [
      {
        q: "What does staff accommodation cost per unit in South Africa?",
        a: `Our X-Fold is ${R(folding)} ex VAT for an insulated, wired 15 m² room — the volume-deployment option, stackable two high and relocatable. Self-contained accommodation with its own bathroom and kitchen starts at ${R(expandable)} ex VAT for an 18 m² expandable home. Add transport, groundwork and ablutions or connections to both.`,
      },
      {
        q: "Does the X-Fold have a bathroom?",
        a: "No. It arrives wired for electricity — two plug points, a light fitting and a small DB board — but with no plumbing. For staff accommodation that usually means a shared ablution block, which is cheaper per bed at scale, or a local installer fitting a wet room into individual units.",
      },
      {
        q: "Can the units be moved to the next site?",
        a: "Yes. The X-Fold folds back down and travels flat, which is what makes it work for construction and mining where the site changes. Expandable homes relocate too, though not folded down to the same footprint.",
      },
      {
        q: "Is it cheaper to buy or hire a site office?",
        a: "Over a short project, hire. Over a long programme or across several successive sites, buying usually wins and leaves you owning a relocatable asset. Compare hire rate times realistic project duration against purchase plus transport, and remember the unit can serve as a secure storeroom between deployments.",
      },
    ],
    references: [
      {
        title: "SANS 10400 — the application of the National Building Regulations",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/",
        note: "The standards habitable accommodation is measured against, including the parts covering lighting, ventilation and sanitary fittings.",
      },
      {
        title: "Building statistics (Statistical release P5041.1)",
        publisher: "Statistics South Africa",
        url: "https://www.statssa.gov.za/publications/P50411/",
        note: "Official building data, useful for context on residential and non-residential construction volumes.",
      },
    ],
  },
  /* =============================================================== 10 ==== */
  {
    slug: "outdoor-kitchen-cost-south-africa",
    seoTitle: "What Does an Outdoor Kitchen Cost in SA?",
    title: "What does an outdoor kitchen cost in South Africa?",
    description:
      "Building a braai area versus buying a delivered outdoor kitchen: what each length costs, which extras are worth it, and the ones only the larger units can take.",
    datePublished: "2026-09-02",
    keywords: [
      "outdoor kitchen South Africa",
      "outdoor kitchen cost",
      "built in braai cost South Africa",
      "outdoor entertainment area cost",
      "braai area ideas South Africa",
      "modular outdoor kitchen price",
    ],
    imageProduct: "outdoor-kitchens",
    readingMinutes: 7,
    body: [
      {
        type: "p",
        text: `South Africans entertain outside, so the built-in braai area is one of the most common home projects in the country — and one of the most reliably over-budget. Bricklaying, a countertop, plumbing to a sink, an electrician for lights and plugs, and a roof over the whole thing: it is four trades and a project manager for what people imagine is a weekend job.`,
      },
      {
        type: "p",
        text: `The delivered alternative is a single unit that arrives complete. Here is what it costs and where the money goes.`,
      },

      { type: "h2", text: "What a delivered outdoor kitchen costs" },
      {
        type: "table",
        caption: "Tiny Homes SA outdoor kitchen lengths and prices, ex VAT",
        head: ["Length", "Price ex VAT", "Approx. weight", "Notes"],
        rows: [
          ["2.5 m", R(variantPrice("outdoor-kitchens", "ok-2-5")), "±500 kg", "The compact entertainer"],
          ["2.9 m", R(variantPrice("outdoor-kitchens", "ok-2-9")), "±600 kg", "Extra prep space"],
          ["3.5 m", R(variantPrice("outdoor-kitchens", "ok-3-5")), "±700 kg", "Takes the double grill and kettle grill"],
          ["3.9 m", R(variantPrice("outdoor-kitchens", "ok-3-9")), "±750 kg", "The largest, for serious entertaining"],
        ],
      },
      {
        type: "p",
        text: `All four are 0.8 m deep and 2.4 m high, in a wide range of custom colours. Every one arrives with the same core specification: a **remote-controlled motorised lift-up roof**, a quartz stone countertop with a water-barrier edge, a stainless-steel sink with a pull-out faucet, embedded plumbing and electrical with an outdoor distribution box, recessed lighting and an adjustable LED ambient strip.`,
      },
      {
        type: "p",
        text: `The frame is corrosion-resistant galvanised steel with an aluminium-alloy shell, and the interior panels are aluminium honeycomb — high-temperature resistant and wipe-clean after the braai. It is built to live outdoors permanently rather than to be covered up in winter.`,
      },

      { type: "h2", text: "Building versus buying" },
      {
        type: "p",
        text: `A masonry braai area is genuinely the better answer in some cases — if it has to match existing brickwork, tuck into an awkward corner, or form part of a larger renovation already underway. What it is not is quicker or more predictable.`,
      },
      {
        type: "ul",
        items: [
          `**Trades.** A built braai area needs a bricklayer, a plumber, an electrician and someone for the countertop and roof. The delivered unit needs a level base and two connections.`,
          `**Price certainty.** You are quoted a figure for a finished unit rather than a rate against a scope that grows.`,
          `**Time.** Weeks of site work versus a delivery, positioned and connected.`,
          `**It can move.** A built braai stays with the house. The unit does not have to.`,
          `**Layout.** This is where building wins — a delivered unit comes in four lengths and one depth, and that is that.`,
        ],
      },
      {
        type: "callout",
        title: "Two things to sort before delivery",
        text: `A level base — these are 500 to 750 kg units — and where water and power come from. The plumbing and electrical are embedded in the unit, but something still has to feed them. Sort both while the order is in production and delivery day is a delivery rather than the start of another project.`,
      },

      { type: "h2", text: "Which extras are worth it" },
      {
        type: "p",
        text: `The unit arrives with the countertop, sink, plumbing, electrics and lighting already in. What it does **not** arrive with is anything to cook on — that is a deliberate choice, because how South Africans cook outside varies enormously.`,
      },
      {
        type: "table",
        caption: "Outdoor kitchen extras, ex VAT",
        head: ["Extra", "Price ex VAT", "Worth knowing"],
        rows: [
          ["Single gas grill", R(optionOf("outdoor-kitchens", "gas-grill-single")), "The default choice on any length"],
          ["Double gas grill", R(optionOf("outdoor-kitchens", "gas-grill-double")), "3.5 m and 3.9 m only"],
          ["Kettle grill", R(optionOf("outdoor-kitchens", "kettle-grill")), "3.5 m and 3.9 m only — for charcoal"],
          ["Induction flat-top stove", R(optionOf("outdoor-kitchens", "induction-stove")), "Pans and sides, not braai duty"],
          ["Extractor fan", R(optionOf("outdoor-kitchens", "extractor-fan")), "Matters most under a closed roof"],
          ["Bar fridge", R(optionOf("outdoor-kitchens", "bar-fridge")), "Saves the trip inside"],
          ["Stainless-steel countertop", R(optionOf("outdoor-kitchens", "stainless-countertop")), "Over the quartz, for heavy use"],
          ["Extra cabinet module", `${R(optionOf("outdoor-kitchens", "extra-cabinets"))}/m`, "Storage is the thing people underestimate"],
          ["Outdoor speaker", R(optionOf("outdoor-kitchens", "outdoor-speaker")), "Low cost, high use"],
          ["Starry-sky ceiling", R(optionOf("outdoor-kitchens", "starry-sky-ceiling")), "Pure theatre, and it works"],
        ],
      },
      {
        type: "p",
        text: `The constraint worth planning around: **the double gas grill and the kettle grill are only available on the 3.5 m and 3.9 m units.** If you braai over charcoal as well as gas, that decides your length before anything else does. Choosing the 2.9 m to save money and then wanting a kettle grill is the one regret this product reliably produces.`,
      },

      { type: "h2", text: "How to choose a length" },
      {
        type: "ol",
        items: [
          `**Start with how you cook.** Charcoal as well as gas means 3.5 m or larger, because of the kettle grill restriction above.`,
          `**Then count the people.** Prep space is what runs out when you are feeding twelve, not cooking surface.`,
          `**Then check the wall.** 0.8 m deep and 2.4 m high, so you need the run of space and the height clearance for the roof to lift.`,
          `**Then add storage.** Extra cabinet modules at ${R(optionOf("outdoor-kitchens", "extra-cabinets"))} per metre are cheap next to the unit and get used every single time.`,
        ],
      },
      {
        type: "p",
        text: `If the outdoor kitchen is going in alongside a guest unit or a rental cabin, it is worth pricing them together — an [Apple Cabin](/apple-cabins) or [nature cabin](/nature-cabins) with a proper entertainment area beside it is a materially better letting proposition than either on its own.`,
      },
      {
        type: "cta",
        text: `Configure a length with the extras you want and see the price update as you go.`,
        href: "/outdoor-kitchens",
        label: "See the outdoor kitchens",
      },
    ],
    faqs: [
      {
        q: "How much does an outdoor kitchen cost in South Africa?",
        a: `Ours run from ${R(variantPrice("outdoor-kitchens", "ok-2-5"))} ex VAT for the 2.5 m up to ${R(variantPrice("outdoor-kitchens", "ok-3-9"))} for the 3.9 m, delivered ready to use with the motorised roof, quartz countertop, stainless-steel sink and embedded plumbing and electrics included. Cooking appliances are extras, from ${R(optionOf("outdoor-kitchens", "gas-grill-single"))} for a single gas grill.`,
      },
      {
        q: "Is it cheaper to build a braai area or buy one?",
        a: "Building can be cheaper on materials alone, but it needs a bricklayer, a plumber, an electrician and a countertop installer, and the final figure is not known at the start. A delivered unit is one quoted price, needs a level base and two connections, and can move with you. Building wins when the area must match existing brickwork or fit an awkward space.",
      },
      {
        q: "Which outdoor kitchen size do I need for a kettle grill?",
        a: `The kettle grill (${R(optionOf("outdoor-kitchens", "kettle-grill"))} ex VAT) and the double gas grill are available on the 3.5 m and 3.9 m units only. If charcoal braaiing matters to you, that sets your minimum length.`,
      },
      {
        q: "Does the outdoor kitchen need plumbing and electrical work?",
        a: "The plumbing and electrics are embedded in the unit, including an outdoor distribution box with leakage protection, but water and power still have to be brought to where it stands. Arrange both, plus a level base for a unit weighing 500 to 750 kg, before delivery.",
      },
    ],
    references: [
      {
        title: "SANS 10400 — the application of the National Building Regulations",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/",
        note: "Relevant to any permanent outdoor structure, and to the electrical and drainage work feeding it.",
      },
      {
        title: "What it costs to build a house in South Africa",
        publisher: "ooba Home Loans",
        url: "https://www.ooba.co.za/resources/cost-to-build-a-house/",
        note: "Context for the conventional building rates a masonry braai area is quoted against.",
      },
    ],
  },
  /* =============================================================== 11 ==== */
  {
    slug: "prefab-vs-building-a-house-south-africa",
    seoTitle: "Prefab vs Building a House in South Africa",
    title: "Prefab vs building a house in South Africa: the pros and cons",
    description:
      "An honest list of what each route gives you and what it costs you — money, time, paperwork, finance and resale — and which situations each one genuinely suits.",
    datePublished: "2026-09-02",
    keywords: [
      "prefab vs building a house",
      "prefab home pros and cons",
      "modular home advantages disadvantages South Africa",
      "should I build or buy a prefab",
      "prefab house disadvantages",
      "brick vs prefab South Africa",
    ],
    imageProduct: "expandable-homes",
    readingMinutes: 9,
    body: [
      {
        type: "p",
        text: `We sell prefab homes, so treat the framing here with appropriate suspicion — and then check the cons list, which is longer and more specific than the one you will find on most suppliers' websites. There are situations where conventional building is straightforwardly the better decision, and pretending otherwise wastes your time and ours.`,
      },

      { type: "h2", text: "What you are actually choosing between" },
      {
        type: "p",
        text: `Not "cheap versus expensive". You are choosing between **a construction project** and **a purchase**.`,
      },
      {
        type: "p",
        text: `A conventional build is a project you run: you appoint people, approve drawings, carry the risk of variation, and end up with something drawn for your site. A prefab is a product you buy: fixed specification, fixed price, delivered. Almost every advantage and disadvantage below flows from that one distinction.`,
      },

      { type: "h2", text: "Building conventionally: the case for" },
      {
        type: "ul",
        items: [
          `**It fits the site and the brief exactly.** Awkward plot, specific view, a layout your family actually needs — you can draw it. Prefab comes in catalogue sizes.`,
          `**Finance is easier.** Far more lenders will bond conventional construction than a prefabricated structure. This is the single most underrated practical difference, and we go through the bank-by-bank position in [can you get a home loan for a prefab home](/blog/prefab-home-finance-south-africa).`,
          `**It matches what is already there.** If the new building has to read as part of an existing house, masonry does that and a delivered unit does not.`,
          `**Valuation and resale are well understood.** Valuers, insurers and buyers have decades of comparable data on brick. Prefab has thinner data, which shows up as caution.`,
          `**Marginal cost falls if you are already building.** Contractors on site for a bigger job can add a room more cheaply than a separate delivered unit with its own transport and groundwork.`,
        ],
      },

      { type: "h2", text: "Building conventionally: the case against" },
      {
        type: "ul",
        items: [
          `**You do not know the final number.** You are quoted a rate against a scope, and scope moves. Contingency is not pessimism, it is arithmetic.`,
          `**The paperwork is heavy.** Plans by a SACAP-registered professional, municipal approval, NHBRC enrolment for a new home, an electrical certificate, an occupancy certificate before anyone may move in. Set out in full in [what you actually need to put a building on your land](/blog/building-approval-south-africa-what-you-need).`,
          `**It takes months, on your property.** Trades, deliveries, noise, dust and a garden you cannot use.`,
          `**You carry the coordination risk.** When the plumber and the electrician disagree about a wall, that is your problem and your delay.`,
          `**It cannot leave.** Whatever you spend stays with the property.`,
        ],
      },

      { type: "h2", text: "Prefab: the case for" },
      {
        type: "ul",
        items: [
          `**One price, known up front.** You are buying a finished unit, not a rate against a scope.`,
          `**Speed.** Around 90 days from deposit, and on-site setup runs from minutes for an [X-Fold](/folding-homes) to a few days for a cabin or capsule on a prepared base.`,
          `**Almost no disruption.** The building work happens somewhere else. Your property sees a delivery, not a site.`,
          `**Factory conditions.** Panels built indoors, to a repeated specification, out of the weather — which is a genuinely different quality-control problem from wet trades on site in February.`,
          `**Fewer people to coordinate.** A base, a delivery and two connections, rather than five trades in sequence.`,
          `**It can move.** An X-Fold folds down; a pod lifts out. If you sell, or the use changes, the asset is not stuck.`,
          `**A lighter regulatory route may exist.** A structure genuinely declared temporary follows a different and much shorter path than a permanent building — with real limits, covered in the guide linked above.`,
        ],
      },

      { type: "h2", text: "Prefab: the case against" },
      {
        type: "p",
        text: `The part most supplier websites skip. All of these are real:`,
      },
      {
        type: "ul",
        items: [
          `**Finance is harder.** Some major South African banks do not currently bond prefabricated structures at all. If you need a bond rather than cash or third-party finance, check this before anything else.`,
          `**It is not automatically cheaper.** Per square metre our [expandable homes](/expandable-homes) land inside the same band as a mid-range conventional build. We ran our own numbers against conventional rates in [is a prefab home cheaper than building](/blog/is-a-prefab-home-cheaper-than-building), and the answer is "sometimes".`,
          `**Catalogue sizes.** You choose from what exists. If the space has to be a specific shape, this is the wrong product.`,
          `**Delivery access can kill it.** Every range except the X-Fold arrives whole and must be lifted or rolled into place. Gate width, cables, slope and soft ground decide feasibility, and no amount of budget fixes a site a truck cannot reach.`,
          `**Resale data is thinner.** Valuers and insurers have less to go on. A relocatable unit on plinths is treated differently from a fixed, approved dwelling — by everyone.`,
          `**Approval is not automatically avoided.** A permanently founded prefab dwelling generally faces the same municipal approval as any other dwelling. The lighter route exists only for genuinely temporary structures, and it is time-limited.`,
          `**Extras add up.** The advertised price is factory-gate. Transport, groundwork and service connections are yours, and on a distant or awkward site they are not small.`,
        ],
      },

      { type: "h2", text: "Side by side" },
      {
        type: "table",
        caption: "Conventional building versus a delivered prefab unit",
        head: ["", "Build conventionally", "Prefab unit"],
        rows: [
          ["Final cost known", "At the end", "Before you order"],
          ["Time on your property", "Months", "Hours to a few days"],
          ["Layout", "Anything you can draw", "Catalogue sizes"],
          ["Paperwork", "Full approval path", "Full path if permanent; lighter if genuinely temporary"],
          ["Bond finance", "Widely available", "Restricted — some banks decline outright"],
          ["Coordination", "Yours", "Largely the supplier's"],
          ["Weather risk during build", "Yours", "The factory's"],
          ["Can it be moved later", "No", "Yes"],
          ["Resale comparables", "Deep", "Thin"],
        ],
      },

      { type: "h2", text: "Which one fits your situation" },
      {
        type: "h3", text: "Choose conventional building if…",
      },
      {
        type: "ul",
        items: [
          `You need a bond and cannot use cash or third-party finance.`,
          `The layout genuinely has to be bespoke.`,
          `It must match existing brickwork or form part of a larger renovation already underway.`,
          `Delivery vehicles cannot reach the position.`,
        ],
      },
      { type: "h3", text: "Choose prefab if…" },
      {
        type: "ul",
        items: [
          `Knowing the final figure up front matters more to you than a bespoke plan.`,
          `You want the building usable in months rather than a year.`,
          `You cannot live through a construction site — a working farm, a lodge taking bookings, a home with small children.`,
          `The use might change, or you might move, and a relocatable asset is worth something to you.`,
          `The job is a standard one: a granny flat, a guest unit, staff accommodation, a site office, a rental cabin.`,
        ],
      },
      {
        type: "callout",
        title: "The question that settles it fastest",
        text: `"Do I need a bond?" If yes, find out whether your bank will lend against a prefabricated structure before you look at a single unit. It is a five-minute call, and it removes an entire option — in one direction or the other — before you spend any time on the rest.`,
      },
      {
        type: "p",
        text: `And whichever way you lean, go and stand inside a unit before deciding. Small buildings photograph much larger than they measure, and fifteen minutes settles a question that no amount of comparison reading will.`,
      },
      {
        type: "cta",
        text: `Units are on site at our showroom in ${site.showroom.city} — free to view, no obligation.`,
        href: "/book-a-viewing",
        label: "Book a viewing",
      },
    ],
    faqs: [
      {
        q: "What are the main disadvantages of a prefab home?",
        a: "Bond finance is restricted — some major South African banks do not currently bond prefabricated structures at all. Beyond that: catalogue sizes rather than bespoke layouts, delivery access can make a site unworkable at any budget, resale and valuation data is thinner than for brick, and the advertised price excludes transport, groundwork and service connections.",
      },
      {
        q: "Is prefab better quality than brick?",
        a: "Different, rather than better. Factory assembly means repeatable conditions, indoors, out of the weather — a genuinely different quality-control problem from wet trades working on site in bad weather. But a well-built masonry house by a good contractor is an excellent building, and a poorly specified prefab is still a poorly specified building.",
      },
      {
        q: "Do prefab homes need building plans in South Africa?",
        a: "A permanently founded prefab dwelling generally faces the same municipal approval path as any other dwelling. A structure genuinely declared temporary follows a lighter route under regulation A23 — provisional authorisation on layout drawings rather than a full plan set — but it is time-limited, and if it is not extended or converted to a full approval before the period ends, the Act requires the owner to remove or demolish it.",
      },
      {
        q: "Does a prefab home lose value?",
        a: "It depends heavily on whether it is fixed and approved. A permanently founded, municipally approved dwelling with an occupancy certificate is treated as property. A relocatable unit standing on plinths behaves more like a movable asset — which is an advantage if you want to take it with you and a disadvantage at valuation.",
      },
    ],
    references: [
      {
        title: "Prefab homes: will the bank grant you a bond?",
        publisher: "ooba Home Loans",
        url: "https://www.ooba.co.za/resources/prefab-homes/",
        note: "Source for the finance restriction cited in the cons list.",
      },
      {
        title: "National Building Regulations and Building Standards Act 103 of 1977",
        publisher: "SAFLII (consolidated legislation)",
        url: "https://www.saflii.org/za/legis/consol_act/nbrabsa1977476/",
        note: "The Act governing plan approval, temporary buildings and occupancy certificates for both routes.",
      },
      {
        title: "What it costs to build a house in South Africa",
        publisher: "ooba Home Loans",
        url: "https://www.ooba.co.za/resources/cost-to-build-a-house/",
        note: "Conventional building cost context.",
      },
    ],
  },

  /* =============================================================== 12 ==== */
  {
    slug: "building-approval-south-africa-what-you-need",
    seoTitle: "What You Need to Build on Your Land in SA",
    title: "What you actually need to put a building on your land in South Africa",
    description:
      "The approval path for a permanent building — zoning, SACAP plans, NHBRC, certificates — against the lighter temporary-structure route, and where each ends.",
    datePublished: "2026-09-02",
    keywords: [
      "building plans approval South Africa",
      "what permits do I need to build South Africa",
      "occupancy certificate South Africa",
      "NHBRC enrolment requirement",
      "temporary building regulation A23",
      "do I need plans for a prefab structure",
    ],
    imageProduct: "expandable-homes",
    readingMinutes: 12,
    body: [
      {
        type: "callout",
        title: "This is not legal advice",
        text: `What follows is national framework, researched and sourced at the foot of this article. Building approval in South Africa is administered by your local municipality, and by-laws and practice differ. Where this article and your building control department disagree, they are right.`,
      },
      {
        type: "p",
        text: `Most of this industry answers "do I need plans?" with "ask your municipality" and stops there. That is true but useless. Here is the actual framework, so you know what you are asking about and can tell whether the answer you get sounds right.`,
      },
      {
        type: "p",
        text: `There are **two different legal routes**, and which one you are on changes everything. But first, the question underneath all of this.`,
      },

      { type: "h2", text: "Does a movable structure need plans?" },
      {
        type: "p",
        text: `This is where most of the bad advice in this market lives, so here is the Act itself. Section 1 of the National Building Regulations and Building Standards Act 103 of 1977 defines a building as including:`,
      },
      {
        type: "callout",
        title: "Section 1, definition of “building”",
        text: `“…**any other structure, whether of a temporary or permanent nature and irrespective of the materials used in the erection thereof**, erected or used for or in connection with — (i) **the accommodation or convenience of human beings** or animals…”`,
      },
      {
        type: "p",
        text: `Read that carefully, because it settles the question. A structure does not escape the Act by being **temporary**, by being **movable**, or by being made of **steel rather than brick** — all three are expressly covered. If people will live in it, it is a building.`,
      },
      {
        type: "p",
        text: `And section 4(1) is equally blunt: *"No person shall without the prior approval in writing of the local authority in question, erect any building in respect of which plans and specifications are to be drawn and submitted in terms of this Act."*`,
      },
      {
        type: "p",
        text: `So the honest answer to "does a movable tiny home need plans?" is: **it needs the local authority's permission either way — but not necessarily a full architectural plan set.** The lighter option is real, and it is route 2 below.`,
      },
      {
        type: "callout",
        title: "Do not confuse a tiny home with a caravan",
        text: `Caravans and trailers are road vehicles, registered under road traffic law, and are treated differently. A tiny home delivered on a truck and set down on plinths is not a caravan — it has no wheels, no registration and it stays put. A great deal of "tiny homes need no permits" content online is American or Australian and describes homes on registered road trailers. It does not transfer to a unit standing on your plot in South Africa.`,
      },

      { type: "h2", text: "Route 1: a permanent building" },
      {
        type: "p",
        text: `This is the path for anything intended to stay — a house, a granny flat, a permanently founded cabin. It runs under the **National Building Regulations and Building Standards Act 103 of 1977**, with SANS 10400 supplying the deemed-to-satisfy standards.`,
      },

      { type: "h3", text: "Step 1 — Land use, before anything else" },
      {
        type: "p",
        text: `Zoning is a separate question from building plans, and it is the one that can stop the project outright. Land use sits under the **Spatial Planning and Land Use Management Act 16 of 2013 (SPLUMA)** and your municipality's land use scheme.`,
      },
      {
        type: "p",
        text: `For a second dwelling on a Residential 1 stand, the usual mechanism is **consent use** rather than rezoning — permission to use the property for something beyond its zoning, granted to you rather than to the land. Two consequences worth knowing: it is decided by the municipal planning authority, and **consent use generally lapses when the property is sold**, so a buyer has to reapply. Rezoning permanently changes the zoning and is the heavier application.`,
      },

      { type: "h3", text: "Step 2 — Plans, drawn by someone specific" },
      {
        type: "p",
        text: `You cannot draw them yourself. Building plans must be prepared and submitted by a **competent person registered with the South African Council for the Architectural Profession (SACAP)** — a professional architect, senior architectural technologist, architectural technologist or architectural draughtsperson, depending on the building's complexity. Their registration number appears on the title block of each drawing sheet, and providing architectural services without SACAP registration is an offence.`,
      },
      {
        type: "p",
        text: `Depending on the structure, an engineer may also have to take responsibility for the foundation or structural design — a rational design signed by a registered professional rather than a deemed-to-satisfy detail.`,
      },

      { type: "h3", text: "Step 3 — Municipal approval, with a clock on it" },
      {
        type: "p",
        text: `Once submitted, the Act gives the local authority a deadline to grant or refuse:`,
      },
      {
        type: "ul",
        items: [
          `**Under 500 m² architectural area — 30 days** from receipt of the application.`,
          `**500 m² or larger — 60 days.**`,
        ],
      },
      {
        type: "p",
        text: `Those are the statutory periods; real-world turnaround depends on the municipality and on how many times the plans come back for correction. One more clause catches people out: **an approval lapses after 12 months** if the work has not commenced or proceeded, unless you apply in writing for an extension.`,
      },

      { type: "h3", text: "Step 4 — NHBRC, if it is a new home" },
      {
        type: "p",
        text: `Under the **Housing Consumers Protection Measures Act 95 of 1998**, a new home must be enrolled with the NHBRC **15 days before construction commences**, and the home must be available for inspection by the Council's inspectorate throughout construction.`,
      },
      {
        type: "p",
        text: `Section 10(1) goes further: no person may carry on business as a home builder, or receive payment under an agreement for the sale or construction of a home, unless registered as a home builder. Failing to register is an offence under section 21, carrying a fine of up to **R25 000 or a year's imprisonment on each charge**. Late enrolment is possible but attracts a fee and a special inspection.`,
      },
      {
        type: "p",
        text: `Owner-builder exemption exists, but it must be applied for **before construction starts**, and it comes with real trade-offs — no warranty cover, and restrictions on selling the property for a period afterwards.`,
      },

      { type: "h3", text: "Step 5 — Certificates, at the end" },
      {
        type: "ul",
        items: [
          `**Electrical certificate of compliance.** Required under the Occupational Health and Safety Act and the Electrical Installation Regulations, issued by a registered person holding a wireman's licence. Valid two years unless the installation is altered, and required before a property transfers.`,
          `**Occupancy certificate.** Section 14 of the Act. Once the building is complete you request it in writing, and the local authority must issue it within **14 days**. Nobody may lawfully occupy the building without it — and it is the document that surfaces years later when you sell.`,
        ],
      },
      {
        type: "callout",
        title: "The honest summary of route 1",
        text: `Land use decision, SACAP-registered plans, a 30- or 60-day municipal clock, NHBRC enrolment 15 days before you break ground, inspections through construction, an electrical certificate and an occupancy certificate at the end. None of it is optional, and the occupancy certificate is the one that bites at resale.`,
      },

      { type: "h2", text: "Route 2: a temporary building" },
      {
        type: "p",
        text: `This is the route most people asking about tiny homes have never heard of, and it is genuinely different.`,
      },
      {
        type: "p",
        text: `**Regulation A23** of the National Building Regulations deals with temporary buildings. A temporary building is defined as one *"so declared by the owner and that is being used or is to be used for a specified purpose for a specified limited period of time"* — explicitly excluding a builder's shed.`,
      },
      {
        type: "p",
        text: `Permission is still required before you erect it. But what you submit is much lighter than a full plan set:`,
      },
      {
        type: "ul",
        items: [
          `A statement specifying the **period** of authorisation you need.`,
          `A **site plan** showing existing structures and exactly where it will stand.`,
          `**Layout drawings** giving size, form and materials.`,
          `Any **structural safety details** the authority asks for.`,
        ],
      },
      {
        type: "p",
        text: `The local authority assesses the intended use and lifespan, the location, and the suitability of the materials. If the public will have access to the building, a safety certificate from an approved competent person is mandatory.`,
      },
      {
        type: "p",
        text: `What the authority grants is **provisional authorisation**, for a limited period set with regard to the period you asked for. Two separate things can then happen, and they are worth keeping apart because they are different sub-regulations:`,
      },
      {
        type: "ol",
        items: [
          `**Extension (A23(4)).** The authority may, at your request, grant one or more extensions of the period. Where the public has access to the building, each request must be accompanied by a certificate from an approved competent person confirming the structural system is satisfactory.`,
          `**Conversion to permanent (A23(5)–(6)).** Not later than the last day of the authorised period, you may submit the additional plans and details the authority requires so it can consider a full section 4 application. If that is approved, you then submit an affidavit confirming what was built matches those plans. This is the legitimate path from temporary to permanent.`,
        ],
      },
      {
        type: "p",
        text: `And the consequence of doing neither is explicit. Under A23(7), if those plans and details are not submitted, or the authority refuses them, **the owner shall forthwith remove or demolish the building**. That is the sentence to keep in mind before treating a temporary authorisation as a permanent solution.`,
      },
      {
        type: "p",
        text: `One more thing this route is not: a loophole. A temporary building is one *"so declared by the owner"* for a *"specified purpose for a specified limited period"*. Declaring a permanent home temporary to dodge the approval path is a misdeclaration with a demolition clause attached to it.`,
      },

      { type: "h2", text: "What minor building work does — and does not — cover" },
      {
        type: "p",
        text: `The third thing people hope applies. A building control officer may exempt an owner in writing from submitting plans for **minor building work**, and authorise it subject to conditions. The listed categories carry size thresholds:`,
      },
      {
        type: "table",
        caption: "Examples of minor building work and their thresholds",
        head: ["Structure", "Threshold"],
        rows: [
          ["Tool shed", "Under 10 m²"],
          ["Greenhouse", "Max 15 m²"],
          ["Open-sided carport or shelter", "Max 40 m²"],
          ["Children's playhouse", "Max 5 m²"],
          ["Aviary", "Max 20 m²"],
          ["Freestanding wall or fence", "Max 1.8 m, non-retaining"],
        ],
      },
      {
        type: "p",
        text: `Read that list carefully and the crucial point is what is **absent from it: a dwelling**. Minor building work covers sheds, carports, playhouses and walls — not habitable accommodation. A tiny home someone sleeps in does not become exempt because it is small. And even where the exemption applies, the work must still comply with the National Building Regulations; you are excused the plans, not the standards.`,
      },

      { type: "h2", text: "Which route applies to which unit" },
      {
        type: "table",
        caption: "How the two routes map onto real uses",
        head: ["What you are doing", "Likely route", "Why"],
        rows: [
          ["Granny flat, permanently founded", "Route 1, in full", "A dwelling intended to stay; plus consent use for a second dwelling"],
          ["Site office for a 14-month project", "Route 2 (A23)", "Genuinely temporary, specified period, removed at the end"],
          ["Rental cabin on a farm, staying", "Route 1", "Permanent accommodation, plus a land-use question for the use itself"],
          ["Staff accommodation, this site only", "Route 2 (A23)", "Time-bound, relocates with the operation"],
          ["Home office in the garden", "Ask the BCO", "Depends on foundation, permanence and whether anyone sleeps in it"],
          ["Tool store under 10 m²", "Minor building work", "Listed category, written exemption from the BCO"],
        ],
      },
      {
        type: "p",
        text: `Our range spans both. An [X-Fold](/folding-homes) that folds down and moves between sites is the natural temporary-building case. A [nature cabin](/nature-cabins) or a permanently founded [expandable home](/expandable-homes) used as a granny flat is a route 1 building, and should be treated as one from the start.`,
      },

      { type: "h2", text: "What to ask, and in what order" },
      {
        type: "ol",
        items: [
          `**Phone your municipality's building control department.** Free. Describe the actual structure, its size, its foundation and whether anyone will sleep in it — not "a tiny home", which means different things to different officials.`,
          `**Ask the land-use question separately**: does my zoning permit this use, and do I need consent use?`,
          `**Ask which route applies**: permanent building, temporary building under A23, or minor building work.`,
          `**If route 1**, appoint a SACAP-registered professional early — nothing proceeds until plans exist.`,
          `**If route 2**, confirm the period you can get and what happens at expiry, before you buy.`,
          `**Check your HOA or body corporate rules**, which can be stricter than the municipality's.`,
          `**Tell your insurer** what you are putting up, and confirm it is covered.`,
        ],
      },
      {
        type: "p",
        text: `We supply the dimensions and specifications of any unit for your submission. What we cannot do — and what nobody selling you a building can honestly do — is tell you what your municipality will decide.`,
      },
      {
        type: "cta",
        text: `Tell us the unit and the site and we will give you the dimensions and specifications your submission needs.`,
        href: "/contact",
        label: "Ask for the specifications",
      },
    ],
    faqs: [
      {
        q: "How long does building plan approval take in South Africa?",
        a: "The National Building Regulations and Building Standards Act gives the local authority 30 days to grant or refuse where the architectural area is under 500 m², and 60 days where it is 500 m² or more. Real turnaround depends on the municipality and on how many revisions the plans need. An approval lapses after 12 months if work has not started, unless extended in writing.",
      },
      {
        q: "Can I draw my own building plans in South Africa?",
        a: "No. Plans must be prepared and submitted by a competent person registered with SACAP — a professional architect, senior architectural technologist, architectural technologist or architectural draughtsperson — whose registration number appears on each drawing sheet. Providing architectural services without SACAP registration is an offence.",
      },
      {
        q: "Do I need an occupancy certificate?",
        a: "For a permanent building, yes. Section 14 of the Act requires the local authority to issue one within 14 days of the owner requesting it in writing after completion, and nobody may lawfully occupy the building without it. It is also the document that surfaces when you sell.",
      },
      {
        q: "Does a tiny home count as minor building work?",
        a: "Not if anyone lives in it. The minor building work categories are sheds, carports, playhouses, aviaries, greenhouses and freestanding walls, with size thresholds — habitable accommodation is not on the list. Being small does not exempt a dwelling. The lighter route for a genuinely temporary structure is regulation A23, not minor building work.",
      },
      {
        q: "Does a movable or relocatable structure need building plans in South Africa?",
        a: "It needs the local authority's permission either way. Section 1 of the National Building Regulations and Building Standards Act defines a building to include any structure \"whether of a temporary or permanent nature and irrespective of the materials used\" that is erected or used for the accommodation of human beings — so being movable, temporary or steel-framed does not take it outside the Act. What being genuinely temporary can change is the paperwork: regulation A23 allows provisional authorisation on layout drawings, a site plan and a statement of period rather than a full architectural plan set.",
      },
      {
        q: "Is a tiny home the same as a caravan for planning purposes?",
        a: "No. Caravans and trailers are road vehicles registered under road traffic law. A tiny home delivered by truck and set down on plinths has no wheels and no registration, and is a structure on your land. Much of the \"tiny homes need no permits\" material online is American or Australian and describes homes on registered road trailers; it does not apply to a unit standing on a plot in South Africa.",
      },
      {
        q: "What is a temporary building under regulation A23?",
        a: "One declared by the owner to be used for a specified purpose for a specified limited period. Instead of a full plan set you submit the period required, a site plan, layout drawings showing size, form and materials, and any structural safety details required. Authorisation is time-limited, extensions must be applied for before expiry, and if authorisation is refused or lapses the structure must be removed.",
      },
      {
        q: "Does a prefab home need NHBRC enrolment?",
        a: "If it is a new home, the Housing Consumers Protection Measures Act requires enrolment 15 days before construction commences, with inspection access throughout. Section 10(1) also requires anyone carrying on business as a home builder to be registered, with a fine of up to R25 000 or a year's imprisonment per charge for failing to do so. Owner-builder exemption must be applied for before construction starts.",
      },
    ],
    references: [
      {
        title: "National Building Regulations and Building Standards Act 103 of 1977",
        publisher: "SAFLII (consolidated legislation)",
        url: "https://www.saflii.org/za/legis/consol_act/nbrabsa1977476/",
        note: "Primary source for the 30/60-day approval periods, the 12-month lapse, temporary buildings and the section 14 occupancy certificate.",
      },
      {
        title: "Regulations under the National Building Regulations and Building Standards Act",
        publisher: "SAFLII (consolidated regulations)",
        url: "https://www.saflii.org/za/legis/consol_reg/rutnbrabsa1977693/",
        note: "The regulations themselves, including regulation A23 on temporary buildings and the minor building work definitions.",
      },
      {
        title: "Housing Consumers Protection Measures Act 95 of 1998",
        publisher: "SAFLII (consolidated legislation)",
        url: "https://www.saflii.org/za/legis/consol_act/hcpma1998443/",
        note: "Source for NHBRC enrolment, the section 10(1) registration requirement and the section 21 penalties.",
      },
      {
        title: "Temporary buildings",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/temporary-buildings/",
        note: "Plain-language explanation of regulation A23 — what must be submitted, the assessment criteria, extensions and removal.",
      },
      {
        title: "Plans and minor building work",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/minor-building-work/",
        note: "Source for the minor building work categories and size thresholds in the table above.",
      },
      {
        title: "A competent person",
        publisher: "sans10400.co.za",
        url: "https://www.sans10400.co.za/a-competent-person/",
        note: "Who may draw and submit building plans, and the SACAP registration categories.",
      },
      {
        title: "Electrical Installation Regulations",
        publisher: "SAFLII (consolidated regulations)",
        url: "https://www.saflii.org/za/legis/consol_reg/eir342/",
        note: "The regulations behind the electrical certificate of compliance requirement.",
      },
      {
        title: "Spatial Planning and Land Use Management Act 16 of 2013",
        publisher: "South African Government",
        url: "https://www.gov.za/documents/spatial-planning-and-land-use-management-act",
        note: "The land use framework behind zoning, consent use and rezoning applications.",
      },
    ],
  },
];

/* ------------------------------------------------------------- accessors */

export const blogSlugs = blogPosts.map((post) => post.slug);

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/**
 * Newest first, then by slug so the order is total and stable — two posts
 * sharing a date would otherwise sort differently between builds and churn
 * the sitemap.
 */
export const blogPostsByDate: BlogPost[] = [...blogPosts].sort((a, b) =>
  b.datePublished === a.datePublished
    ? a.slug.localeCompare(b.slug)
    : b.datePublished.localeCompare(a.datePublished),
);

/**
 * The "read next" pair at the foot of a post.
 *
 * Rotates through the list from the current post rather than always returning
 * the two newest. With ten posts sharing one publish date, "newest first"
 * meant every post pointed at the same two — which concentrates internal link
 * equity on two URLs and leaves the other seven reachable only from the index.
 * Walking forward cyclically gives every post inbound links from its
 * neighbours, and the order is deterministic, so the static build is stable.
 */
export function relatedPosts(slug: string, limit = 2): BlogPost[] {
  const index = blogPostsByDate.findIndex((post) => post.slug === slug);
  if (index === -1) return blogPostsByDate.slice(0, limit);
  const total = blogPostsByDate.length;
  return Array.from({ length: Math.min(limit, total - 1) }, (_, i) =>
    blogPostsByDate[(index + 1 + i) % total],
  );
}
