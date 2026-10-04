import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBlogPost, type BlogPost } from "@/data/blog";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * The guides that answer the questions a buyer asks before choosing this
 * range. Plain links, titles only (no descriptions, which carry prices), so
 * crawlers and readers can go from the product page down to the guide.
 * Safari tents get none until the installation wording (T-11) is settled.
 */
const GUIDES: Record<string, string[]> = {
  "folding-homes": [
    "staff-accommodation-units-south-africa",
    "housing-pod-vs-container-home-vs-wendy-house",
    "where-can-you-put-a-housing-pod",
  ],
  "expandable-homes": [
    "granny-flat-cost-south-africa",
    "building-approval-south-africa-what-you-need",
    "prefab-home-finance-south-africa",
  ],
  "nature-cabins": [
    "start-a-glamping-business-south-africa",
    "off-grid-tiny-home-south-africa",
    "where-can-you-put-a-housing-pod",
  ],
  "apple-cabins": [
    "housing-pod-cost-south-africa",
    "start-a-glamping-business-south-africa",
    "off-grid-tiny-home-south-africa",
  ],
  "glamping-capsules": [
    "start-a-glamping-business-south-africa",
    "off-grid-tiny-home-south-africa",
    "housing-pod-cost-south-africa",
  ],
  "outdoor-kitchens": ["outdoor-kitchen-cost-south-africa"],
};

export function ProductGuides({ slug }: { slug: string }) {
  const guides = (GUIDES[slug] ?? [])
    .map((s) => getBlogPost(s))
    .filter((p): p is BlogPost => Boolean(p));
  if (guides.length === 0) return null;

  return (
    <section aria-label="Buying guides" className="py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow="Before you decide" title="Guides that answer the next question" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((post) => (
            <li key={post.slug} className="flex">
              <Link
                href={`/blog/${post.slug}`}
                className="group flex w-full flex-col rounded-3xl border border-border bg-parchment p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-soft)]"
              >
                <span className="font-display text-lg text-ink">{post.title}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-forest">
                  Read the guide
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
