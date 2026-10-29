import { pricedVariants, products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * Homepage FAQ content. Rendered by the accordion AND serialised into
 * FAQPage JSON-LD in page.tsx; keep the two in sync by editing only here.
 */
export interface HomeFaq {
  q: string;
  a: string;
}

/* Prices derived from products.ts so the FAQ (and its JSON-LD) never drifts.
   A price-on-request product would carry a 0 sentinel and is excluded from the range.
   Garages are a DIY steel-kit line, not a home, excluded so the "starts at …
   for an X-Fold" answer keeps naming the genuine cheapest home. */
const pricedProducts = products.filter((p) => !p.priceOnRequest && p.slug !== "garages");
const lowestStartingPrice = Math.min(...pricedProducts.map((p) => p.startingPrice));
/* Highest price across every variant (not just startingPrice), the top of
   the range is the 11.5 m glamping capsule variant, not its base price.
   Price-on-request sizes carry a 0 sentinel and are left out too. */
const highestPrice = Math.max(
  ...pricedProducts.flatMap((p) => {
    const priced = pricedVariants(p);
    return priced.length ? priced.map((v) => v.price) : [p.startingPrice];
  }),
);
/* The expandable range is the answer to the granny flat / granny pod question,
   so its entry price is read from products.ts rather than typed here. */
const expandableFrom = Math.min(
  ...products.filter((p) => p.slug === "expandable-homes").map((p) => p.startingPrice),
);
/* The 2-bedroom searches ("2 bedroom tiny house south africa prices") land on
   the home page, which never said "bedroom". The 37 m² (b20) is the smallest
   size with two bedrooms as standard; its price is read, never typed. */
const twoBedroomFrom =
  products.find((p) => p.slug === "expandable-homes")?.variants?.find((v) => v.id === "b20")?.price ?? expandableFrom;
/* Sizes for the prefab price question, read like the prices. Throws at build
   time rather than rendering "undefined" into the answer. */
function sizeOf(slug: string, variantId?: string): string {
  const product = products.find((p) => p.slug === slug);
  const size = variantId ? product?.variants?.find((v) => v.id === variantId)?.size : product?.sizeLabel;
  if (!size) throw new Error(`home-faqs.ts: no size for "${slug}"${variantId ? ` variant "${variantId}"` : ""}`);
  return size;
}

export const homeFaqs: HomeFaq[] = [
  /* The vocabulary question. "Tiny house" and "granny pod" are what a large
     share of searchers type, but neither phrase appears anywhere else on the
     site: the copy says "tiny home" and "granny flat" throughout. Answering
     the difference once, in the words people use, is worth more than
     find-and-replacing terms that read worse in body copy. */
  {
    q: "What's the difference between a tiny house, a granny pod and a granny flat?",
    a: `Mostly the words, not the buildings. A tiny house and a tiny home are the same thing: a compact, fully finished home that stands on a slab or levelled plinths. A granny pod and a granny flat both mean a self-contained second dwelling on the same property as the main house, usually for a parent or an adult child. Our expandable homes are the range most people mean by either: self-contained, with a bathroom and a kitchen of their own, from ${formatZAR(expandableFrom)} ex VAT. The 37 m² and 74 m² sizes come with 2 bedrooms as standard, the 37 m² from ${formatZAR(twoBedroomFrom)} ex VAT.`,
  },
  /* The price question, in the words buyers search ("prefab houses south
     africa prices"). Every price and size comes from products.ts, the same
     source as the price list above the FAQ, and the last sentence keeps to
     the words of the line under that list. */
  {
    q: "How much does a prefab house cost in South Africa?",
    a: `Our prefab houses start at ${formatZAR(lowestStartingPrice)} ex VAT for the ${sizeOf("folding-homes")} X-Fold, an insulated room wired for electricity but without plumbing. A granny flat with its own bathroom and kitchen starts at ${formatZAR(expandableFrom)} ex VAT (the ${sizeOf("expandable-homes", "b20-slim")} expandable home), and a two-bedroom home starts at ${formatZAR(twoBedroomFrom)} ex VAT (the ${sizeOf("expandable-homes", "b20")} size). The price list on this page gives the from-price of every home we sell. Each price is for the unit alone, so the base it stands on, the connections to water, sewerage and power, council approval, transport to your site and VAT come on top until a quote says otherwise.`,
  },
  /* The problem question (owner, 28 Oct 2026: pages name the problem the
     buyer has, not only the product). Every use is one the site already
     sells: the granny flat FAQ above, the expandable and X-Fold use cases,
     and the setup wording of "How long until I can move in?" below. */
  {
    q: "What do people use a tiny home for?",
    a: "Buyers use them as a granny flat for a parent or an adult child, a unit to let or a guest suite, staff accommodation or a site office, or a home of their own. Setup is quick: an X-Fold unfolds in minutes, an expandable home is set up the day it arrives, and cabins and capsules arrive fully built. Allow around 90 days from deposit to move-in.",
  },
  /* The business question (owner, 29 Oct 2026: larger companies buying
     multiple units are the main target). Every use is one the site already
     sells: the X-Fold and expandable staff-accommodation use cases, the
     expandable home's "Developer and rental projects" and the lodge use cases
     of the cabins and capsules. The four things to send are the business
     enquiry's own (src/lib/enquiry.ts). */
  {
    q: "Do you supply businesses that need several units?",
    a: `Yes. Our ranges suit staff accommodation, lodge and glamping suites, and rental or resort schemes, where expandable homes can be ordered in volume, delivered in phases and finished identically. Email ${site.email} with your company name, what the units will be used for, where they will go and how many units you need, and we'll come back to you with a formal quotation.`,
  },
  {
    q: "How much does delivery cost?",
    a: `${site.deliveryNote} Ask about our turnkey service and we can arrange the groundwork, connections and installation for you too.`,
  },
  {
    q: "How long until I can move in?",
    a: "Around 90 days from deposit to move-in for most homes. On-site setup is quick: an X-Fold unfolds in minutes, an expandable home is set up the day it arrives, and cabins and capsules arrive fully built and are placed onto a prepared site.",
  },
  {
    q: "Do prices include VAT?",
    a: `No. All prices on this site exclude VAT. The homes range starts at ${formatZAR(lowestStartingPrice)} ex VAT for an X-Fold and extends to ${formatZAR(highestPrice)} ex VAT for the 11.5 m glamping capsule.`,
  },
  {
    q: "What foundations do I need?",
    a: "Most homes sit on a level concrete slab or properly levelled precast plinths. Larger units, cabins and capsules, arrive fully built and are placed onto a prepared foundation. We confirm the exact requirement for your model and site when you order, or our turnkey team can prepare the groundwork for you.",
  },
  {
    q: "Can the homes run off-grid?",
    a: "Yes. The range is designed to pair with solar power, gas geysers and rainwater tanks; we size and quote the right off-grid setup for your model and site.",
  },
  /* The pod question, in the vocabulary buyers type. Deliberately NOT near the
     top: delivery, timelines, VAT and foundations are what most visitors came
     to the FAQ for, and a terminology question above them would be answering
     our SEO before their question. It earns a place because "housing pod" is a
     real query, not because it outranks the practical ones. */
  {
    q: "Do you sell housing pods?",
    a: `Yes. Several of our ranges are what people mean by a housing pod, living pod or pod house, from an X-Fold at ${formatZAR(lowestStartingPrice)} ex VAT up to the glamping capsules. Which one suits you depends on how finished it needs to be, and our housing pods page compares them side by side.`,
  },
  {
    q: "Can I finance a tiny home?",
    a: `${site.finance}. The provider we refer buyers to finances the unit as a movable asset rather than as property, broadly the same lending category as a truck or earthmoving equipment, because banks don't generally treat these as permanent residential structures. The term is typically around five years, against the twenty years or more of a bond. You'll need a valid SA ID or passport, your latest three months' bank statements, payslips or proof of income, and a good credit record; a deposit may be required depending on the unit. Ask us when you request a quote.`,
  },
  /* The rent-to-own question, answered with a flat no.
     It earns a place on demand alone: it arrives in the same enquiry as "can
     I bond it", and no supplier in this market publishes an honest answer to
     it. The answer is also protective. Lay-bye was withdrawn in Aug 2026
     precisely because holding stock against instalments is a promise the
     business cannot keep (see the note on site.finance), and rent-to-own is
     that same promise under another name. Saying no in public, in the words
     people actually search, is what stops a salesperson being asked to say
     yes in private. */
  {
    q: "Do you offer rent-to-own on a tiny home?",
    a: "No. We're not a registered financial institution, so we don't offer in-house financing, rent-to-own terms or instalments of any kind. A home is either paid for in full or financed by an outside provider, and that provider's credit decision is theirs, not ours. We'll point you at the finance option when you request a quote.",
  },
  {
    q: "Which areas do you deliver to?",
    a: `We deliver to all nine South African provinces: ${site.deliveryRegions.provinces.join(", ")}. That includes Cape Town and the rest of the coast as well as Gauteng. Every home is trucked to your site, with delivery quoted separately on distance and site access, at cost and with no markup. We deliver across the border too, into ${site.deliveryRegions.countries.slice(0, -1).join(", ")} and ${site.deliveryRegions.countries.slice(-1)[0]}. Cross-border runs are priced per project, including the transport and the customs paperwork.`,
  },
  {
    q: "Is there a guarantee on Tiny Homes SA products?",
    a: `Yes. We offer a ${site.guarantee}, and we provide full after-sales support.`,
  },
  /* The "is this legitimate?" question, asked the way people actually ask it.
     It earns its place in the FAQ twice over: it is a real objection to a
     large purchase made online, and it is the phrasing that gets typed into
     a search box and quoted back by an AI assistant. */
  /* Viewings by email only since 29 Oct 2026 (owner). The answer is the
     owner's four questions, in the same words as /contact#viewing. */
  {
    q: "Can I see a tiny home in person before I buy?",
    a: `Yes. Our homes are on site at our showroom in ${site.showroom.city}, ${site.showroom.region}, and viewings are arranged by email only. To view a unit, email us at ${site.email} and tell us why you're interested, what the units will be used for, where they will go, and how many units you're looking at.`,
  },
];
