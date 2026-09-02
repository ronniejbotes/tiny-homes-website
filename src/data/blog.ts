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

/** Up to `limit` other posts, for the "read next" row at the foot of a post. */
export function relatedPosts(slug: string, limit = 2): BlogPost[] {
  return blogPostsByDate.filter((post) => post.slug !== slug).slice(0, limit);
}
