import { products } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";

/* Price-on-request products carry a 0 sentinel — exclude them from the range.
   Garages are a DIY steel-kit line, not a home — their R50 000 entry price stays
   out of the homes starting-price stat. */
const lowestPrice = Math.min(
  ...products
    .filter((p) => !p.priceOnRequest && p.slug !== "garages")
    .map((p) => p.startingPrice),
);

const stats: { value: string; label: string }[] = [
  { value: `From ${formatZAR(lowestPrice)}`, label: "Starting price, ex VAT" },
  { value: `${products.length} styles`, label: "Folding homes to safari tents" },
  { value: `±${site.leadTimeDays} days`, label: "From deposit to move-in" },
  { value: "10-year guarantee", label: "On every home we build" },
];

export function StatsStrip() {
  return (
    <section aria-label="Key facts" className="border-y border-border bg-parchment">
      <Container>
        <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:py-14 lg:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <p className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm leading-snug text-stone">{stat.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
