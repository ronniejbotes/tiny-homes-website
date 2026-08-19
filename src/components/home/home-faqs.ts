import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { CLOSE_MINUTES, OPEN_MINUTES, formatSlot } from "@/lib/viewing";

/**
 * Homepage FAQ content. Rendered by the accordion AND serialised into
 * FAQPage JSON-LD in page.tsx; keep the two in sync by editing only here.
 */
export interface HomeFaq {
  q: string;
  a: string;
}

/* Prices derived from products.ts so the FAQ (and its JSON-LD) never drifts.
   Price-on-request products carry a 0 sentinel and are excluded from the range.
   Garages are a DIY steel-kit line, not a home, excluded so the "starts at …
   for an X-Fold" answer keeps naming the genuine cheapest home. */
const pricedProducts = products.filter((p) => !p.priceOnRequest && p.slug !== "garages");
const lowestStartingPrice = Math.min(...pricedProducts.map((p) => p.startingPrice));
/* Highest price across every variant (not just startingPrice), the top of
   the range is the 11.5 m glamping capsule variant, not its base price. */
const highestPrice = Math.max(
  ...pricedProducts.flatMap((p) => (p.variants?.length ? p.variants.map((v) => v.price) : [p.startingPrice])),
);
/* The expandable range is the answer to the granny flat / granny pod question,
   so its entry price is read from products.ts rather than typed here. */
const expandableFrom = Math.min(
  ...products.filter((p) => p.slug === "expandable-homes").map((p) => p.startingPrice),
);

export const homeFaqs: HomeFaq[] = [
  /* The vocabulary question. "Tiny house" and "granny pod" are what a large
     share of searchers type, but neither phrase appears anywhere else on the
     site: the copy says "tiny home" and "granny flat" throughout. Answering
     the difference once, in the words people use, is worth more than
     find-and-replacing terms that read worse in body copy. */
  {
    q: "What's the difference between a tiny house, a granny pod and a granny flat?",
    a: `Mostly the words, not the buildings. A tiny house and a tiny home are the same thing: a compact, fully finished home that stands on a slab or levelled plinths. A granny pod and a granny flat both mean a self-contained second dwelling on the same property as the main house, usually for a parent or an adult child. Our expandable homes are the range most people mean by either: self-contained, with a bathroom and a kitchen of their own, from ${formatZAR(expandableFrom)} ex VAT.`,
  },
  {
    q: "How much does delivery cost?",
    a: `${site.deliveryNote} Ask about our turnkey service and we can arrange the groundwork, connections and installation for you too.`,
  },
  {
    q: "How long until I can move in?",
    a: "Around 90 days from deposit to move-in for most homes. On-site setup is quick: an X-Fold unfolds in minutes, an expandable home deploys within hours, and cabins and capsules are professionally assembled on a prepared site.",
  },
  {
    q: "Do prices include VAT?",
    a: `No. All prices on this site exclude VAT. The homes range starts at ${formatZAR(lowestStartingPrice)} ex VAT for an X-Fold and extends to ${formatZAR(highestPrice)} ex VAT for the 11.5 m glamping capsule. Safari tents are the exception: they're a trade offering supplied to businesses and hospitality operators, they can't be ordered through the site, and they're quoted per project after a consultation.`,
  },
  {
    q: "What foundations do I need?",
    a: "Most homes sit on a level concrete slab or properly levelled precast plinths. Larger units, cabins and capsules, are professionally assembled on a prepared foundation. We confirm the exact requirement for your model and site when you order, or our turnkey team can prepare the groundwork for you.",
  },
  {
    q: "Can the homes run off-grid?",
    a: "Yes. The range is designed to pair with solar power, gas geysers and rainwater tanks; we size and quote the right off-grid setup for your model and site.",
  },
  {
    q: "Can I finance a tiny home?",
    a: `${site.finance}. You'll need a valid SA ID or passport, your latest three months' bank statements, payslips or proof of income, and a good credit record; a deposit may be required depending on the unit. Ask us when you request a quote.`,
  },
  {
    q: "Which areas do you deliver to?",
    a: `We deliver to all nine South African provinces: ${site.deliveryRegions.provinces.join(", ")}. Every home is built in Centurion, Gauteng and trucked to your site, with delivery quoted separately on distance and site access, at cost and with no markup. We deliver across the border too, into ${site.deliveryRegions.countries.slice(0, -1).join(", ")} and ${site.deliveryRegions.countries.slice(-1)[0]}. Cross-border runs are priced per project, including the transport and the customs paperwork.`,
  },
  {
    q: "Is there a guarantee on Tiny Homes SA products?",
    a: `Yes. We offer a ${site.guarantee}, and we provide full after-sales support.`,
  },
  /* The "is this legitimate?" question, asked the way people actually ask it.
     It earns its place in the FAQ twice over: it is a real objection to a
     large purchase made online, and it is the phrasing that gets typed into
     a search box and quoted back by an AI assistant. */
  {
    q: "Can I see a tiny home in person before I buy?",
    a: `Yes, and we would rather you did. Our homes are on site at our showroom in ${site.showroom.city}, ${site.showroom.region}, and you can book a free 30-minute viewing on the website for any weekday between ${formatSlot(OPEN_MINUTES)} and ${formatSlot(CLOSE_MINUTES)}. Pick the time that suits you and we will have someone ready to show you around. There is no deposit to view and no obligation to buy. Safari tents are the one thing you won't see there: none stands at the showroom, so a tent viewing is arranged separately by emailing ${site.safariTentsEmail}.`,
  },
];
