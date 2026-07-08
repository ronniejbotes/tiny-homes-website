import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";

/**
 * Homepage FAQ content. Rendered by the accordion AND serialised into
 * FAQPage JSON-LD in page.tsx — keep the two in sync by editing only here.
 */
export interface HomeFaq {
  q: string;
  a: string;
}

/* Prices derived from products.ts so the FAQ (and its JSON-LD) never drifts. */
const lowestStartingPrice = Math.min(...products.map((p) => p.startingPrice));
const highestStartingPrice = Math.max(...products.map((p) => p.startingPrice));

export const homeFaqs: HomeFaq[] = [
  {
    q: "How much does delivery cost?",
    a: "Delivery across South Africa averages R 6 000 – R 22 000 per unit, depending on distance from Centurion, current diesel rates and abnormal-load permits. We deliver nationwide.",
  },
  {
    q: "How long until I can move in?",
    a: "Around 90 days from deposit to move-in for most homes. On-site setup is quick: a folding home unfolds in 10–30 minutes, an expandable home deploys in under 2 hours, and cabins, domes and capsules install in 1–3 days.",
  },
  {
    q: "Do prices include VAT?",
    a: `No — all prices on this site exclude VAT. The range starts at ${formatZAR(lowestStartingPrice)} ex VAT for a folding home and extends to ${formatZAR(highestStartingPrice)} ex VAT for the flagship glamping capsule.`,
  },
  {
    q: "What foundations do I need?",
    a: "Most homes sit on a level concrete slab or properly levelled precast plinths. Glamping capsules use six precast piers or ground screws. We confirm the exact requirement for your model and site when you order.",
  },
  {
    q: "Can the homes run off-grid?",
    a: "Yes. The range is designed to pair with solar power, gas geysers and rainwater tanks. Apple cabins and glamping capsules support up to 4 kW of roof solar with a 7 kWh lithium battery for full off-grid operation.",
  },
  {
    q: "Can I finance a tiny home?",
    a: "Financing depends on your circumstances and how the home will be sited. Ask us when you request a quote — we'll talk you through the options available to you.",
  },
];
