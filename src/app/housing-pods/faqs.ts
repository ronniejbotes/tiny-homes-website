import { getProduct } from "@/data/products";
import { podPriceFrom, podPriceTo } from "@/data/housing-pods";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import type { ProductFaq } from "@/data/products";

/**
 * FAQs for /housing-pods.
 *
 * Rendered by the accordion AND serialised into FAQPage JSON-LD on the same
 * page, so both come from this one list and cannot disagree — the pattern
 * home-faqs.ts already established.
 *
 * These deliberately do NOT repeat the homepage FAQ. Duplicated Q&A across
 * two pages competes with itself in search and gives a reader who followed a
 * link nothing new. Every question here is one a pod searcher asks and the
 * homepage does not answer: the vocabulary, the price floor, whether a pod is
 * a permanent home, and how ours compare to the other pods on the market.
 *
 * Prices are read from the catalogue, never typed, so a price change in
 * products.ts moves the copy and its structured data together.
 */

/** Throws at build time rather than rendering "undefined" into a price. */
function priceOf(slug: string): number {
  const product = getProduct(slug);
  if (!product) throw new Error(`housing-pods/faqs.ts: unknown product slug "${slug}"`);
  return product.startingPrice;
}

const foldingFrom = priceOf("folding-homes");
const expandableFrom = priceOf("expandable-homes");
const appleFrom = priceOf("apple-cabins");
const capsuleFrom = priceOf("glamping-capsules");

export const podFaqs: ProductFaq[] = [
  {
    q: "How much does a housing pod cost in South Africa?",
    a: `Ours run from ${formatZAR(podPriceFrom)} to ${formatZAR(podPriceTo)} ex VAT, and where you land in that range depends almost entirely on how finished the unit is when it arrives. ${formatZAR(foldingFrom)} buys an insulated, wired 15 m² room with no plumbing. ${formatZAR(expandableFrom)} buys a self-contained dwelling with its own bathroom and a small basic kitchen. ${formatZAR(appleFrom)} and up buys a finished guest unit with luxurious bathroom fittings and panoramic glass, ready to let. All prices exclude VAT and exclude transport to your site, which is quoted separately on distance and access.`,
  },
  {
    q: "What is the cheapest housing pod you sell?",
    a: `The X-Fold, at ${formatZAR(foldingFrom)} ex VAT for 15 m². It arrives flat, unfolds in minutes with two people, and comes with upgraded floor beams, EPS insulation and a basic electrical setup: two plug points, a light fitting and a small DB board. Be clear about what it is not — it has no plumbing, so a shower and toilet mean a local installer, and it is a square folding room rather than a curved capsule. For that money it is the most building you can put on a property in a day.`,
  },
  {
    q: "Is a housing pod the same as a tiny home, a granny pod or a capsule?",
    a: "In everyday South African usage, near enough. A tiny home and a pod both mean a compact, factory-built home delivered largely finished. A granny pod (or granny flat) specifically means a self-contained second dwelling on the same property as the main house, which is what our expandable homes are bought for. A capsule usually means the rounded, heavily glazed units at the luxury end — our glamping capsules. The words are marketing; what matters is the floor area, what is fitted inside, and whether it arrives with plumbing.",
  },
  {
    q: "Can you live in a housing pod permanently?",
    a: "Yes, provided the unit you buy is specified for it and the site is properly serviced. The ranges that make sense as a permanent home are the ones that arrive self-contained: an expandable home, a nature cabin or a glamping capsule, all of which include a bathroom and factory-installed plumbing and electrics. They are insulated, double-glazed on most models, and built on a steel frame. The practical limits are the ones any small home has — floor area, storage and whether your municipality approves a second dwelling on that stand.",
  },
  {
    q: "Do housing pods need building plans in South Africa?",
    a: "Often, and the answer is set by your local municipality rather than by us or by any national rule of thumb you will read online. Building control departments differ on what counts as a temporary or relocatable structure, on second dwellings, and on how close to a boundary anything may stand. Phone your municipality's building control department before you commit — it costs nothing and it is the answer everything else on the project depends on. We supply the unit's dimensions and specifications for your submission.",
  },
  {
    q: "What foundation does a housing pod need?",
    a: "Most units sit on a level concrete slab or on properly levelled precast plinths, and the larger cabins and capsules are professionally assembled on a prepared foundation. Level is the word that matters: a pod is a rigid finished box, and standing it on a base that is out by more than a little shows up in the doors and windows. We confirm the exact requirement for your model and site when you order, and our turnkey team can prepare the groundwork if you would rather it was our problem.",
  },
  {
    q: "How long does delivery take, and can a truck reach my site?",
    a: `Around 90 days from deposit to move-in for most units. Every pod here except the X-Fold arrives as a finished unit that must be lifted or rolled into its final position, so site access decides more than people expect: gate width, overhead cables, slope and ground firmness all matter. Send us photographs of the approach and we will confirm it before you order. ${site.deliveryNote}`,
  },
  {
    q: "Can a housing pod run off-grid?",
    a: "Yes. The range is designed to pair with solar power, gas geysers and rainwater tanks, sized and quoted for your model and your site. It is worth deciding this early rather than retro-fitting: on the fully-fitted units the electrical layout and the geyser are installed at the factory, and the specification is easier to change before it is built than after it arrives.",
  },
  {
    q: "Can I finance a housing pod?",
    a: `${site.finance}. You will need a valid SA ID or passport, your latest three months' bank statements, payslips or proof of income, and a good credit record; a deposit may be required depending on the unit. Ask us when you request a quote and we will point you at the provider.`,
  },
  {
    q: "Can I see a housing pod before I buy one?",
    a: `Yes, and it is the single best use of an hour you will spend on this decision. Photographs flatten the size of a small building, and fifteen minutes standing inside a ${formatZAR(capsuleFrom)} capsule or a ${formatZAR(appleFrom)} cabin settles the question no spec sheet can. The units are on site at our showroom in ${site.showroom.city}, ${site.showroom.region}, viewing is free, there is no deposit to view and no obligation to buy.`,
  },
];
