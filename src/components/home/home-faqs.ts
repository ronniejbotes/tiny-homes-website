import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * Homepage FAQ content. Rendered by the accordion AND serialised into
 * FAQPage JSON-LD in page.tsx — keep the two in sync by editing only here.
 */
export interface HomeFaq {
  q: string;
  a: string;
}

/* Prices derived from products.ts so the FAQ (and its JSON-LD) never drifts.
   Price-on-request products carry a 0 sentinel and are excluded from the range.
   Garages are a DIY steel-kit line, not a home — excluded so the "starts at …
   for an X-Fold" answer keeps naming the genuine cheapest home. */
const pricedProducts = products.filter((p) => !p.priceOnRequest && p.slug !== "garages");
const lowestStartingPrice = Math.min(...pricedProducts.map((p) => p.startingPrice));
/* Highest price across every variant (not just startingPrice) — the top of
   the range is the 11.5 m glamping capsule variant, not its base price. */
const highestPrice = Math.max(
  ...pricedProducts.flatMap((p) => (p.variants?.length ? p.variants.map((v) => v.price) : [p.startingPrice])),
);

export const homeFaqs: HomeFaq[] = [
  {
    q: "How much does delivery cost?",
    a: `${site.deliveryNote} Ask about our turnkey service and we can arrange the groundwork, connections and installation for you too.`,
  },
  {
    q: "How long until I can move in?",
    a: "Around 90 days from deposit to move-in for most homes. On-site setup is quick: an X-Fold unfolds in minutes, an expandable home deploys within hours, and cabins, domes and capsules are professionally assembled on a prepared site.",
  },
  {
    q: "Do prices include VAT?",
    a: `No — all prices on this site exclude VAT. The homes range starts at ${formatZAR(lowestStartingPrice)} ex VAT for an X-Fold and extends to ${formatZAR(highestPrice)} ex VAT for the 11.5 m glamping capsule. Safari tents are the exception: they're configured to your site and brief, so they're priced on request after a consultation.`,
  },
  {
    q: "What foundations do I need?",
    a: "Most homes sit on a level concrete slab or properly levelled precast plinths. Larger units — cabins, domes and capsules — are professionally assembled on a prepared foundation. We confirm the exact requirement for your model and site when you order, or our turnkey team can prepare the groundwork for you.",
  },
  {
    q: "Can the homes run off-grid?",
    a: "Yes. The range is designed to pair with solar power, gas geysers and rainwater tanks — we size and quote the right off-grid setup for your model and site.",
  },
  {
    q: "Can I finance a tiny home?",
    a: `${site.finance}. You'll need a valid SA ID or passport, your latest three months' bank statements, payslips or proof of income, and a good credit record — a deposit may be required depending on the unit. Ask us when you request a quote.`,
  },
  {
    q: "Is there a guarantee on Tiny Homes SA products?",
    a: `Yes — we offer a ${site.guarantee}, and we provide full after-sales support.`,
  },
];
