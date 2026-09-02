import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { JsonLd, blogSchema, breadcrumbSchema } from "@/lib/schema";
import { getHeroImage } from "@/components/product/product-images";
import { blogPostsByDate } from "@/data/blog";
import { site } from "@/lib/site";

/**
 * /blog — the journal index.
 *
 * Deliberately plain. The index exists so posts have a parent, so the sitemap
 * and the nav have somewhere to point, and so a reader who finishes one post
 * can find the next. It is not itself a page we expect to rank: the posts do
 * that, each on its own query.
 */

const title = "Guides & Advice";
const description =
  "Practical guides to buying a prefab tiny home, housing pod or cabin in South Africa: what they cost, how the options compare, and what your site needs.";

/* Share card: the newest post's own image, so the index never falls back to
   no image at all and never needs a separate asset kept in step with it. */
const shareImage = getHeroImage(blogPostsByDate[0]?.imageProduct ?? "apple-cabins");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.name,
    title: `${title} | ${site.name}`,
    description,
    url: "/blog",
    ...(shareImage
      ? {
          images: [
            {
              url: shareImage.src,
              width: shareImage.width,
              height: shareImage.height,
              alt: shareImage.alt,
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    ...(shareImage ? { images: [shareImage.src] } : {}),
  },
};

/** "2 September 2026" — en-ZA, spelled out, no ordinal. */
function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndexPage() {
  return (
    <>
      <JsonLd
        data={[
          blogSchema(
            blogPostsByDate.map((post) => ({
              title: post.title,
              description: post.description,
              path: `/blog/${post.slug}`,
              datePublished: post.datePublished,
            })),
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/blog" },
          ]),
        ]}
      />

      <section className="bg-forest bg-grain pt-36 pb-20 text-cream sm:pt-44 sm:pb-24">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-eyebrow text-sage">Guides &amp; advice</p>
            <h1 className="text-display mt-4 text-4xl sm:text-6xl">
              Everything worth knowing before you buy
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/80">
              Prices, comparisons and the site questions that decide whether a project runs
              smoothly. Written by the people who deliver these units, with the numbers
              taken straight off our own price list.
            </p>
          </Reveal>
        </Container>
      </section>

      <section aria-label="Articles" className="py-20 sm:py-28">
        <Container>
          <Stagger className="grid gap-8 lg:grid-cols-2" as="ul">
            {blogPostsByDate.map((post) => {
              const image = getHeroImage(post.imageProduct);
              return (
                <StaggerItem key={post.slug} as="li">
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-parchment">
                    {image && (
                      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9]">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="(min-width: 1024px) 40rem, 100vw"
                          className="object-cover"
                        />
                      </Link>
                    )}
                    <div className="flex flex-1 flex-col p-7 sm:p-8">
                      <p className="text-sm text-stone">
                        <time dateTime={post.datePublished}>
                          {formatDate(post.datePublished)}
                        </time>
                        <span className="mx-2" aria-hidden="true">
                          ·
                        </span>
                        {post.readingMinutes} min read
                      </p>
                      <h2 className="mt-3 font-display text-2xl leading-snug text-ink">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="transition-colors hover:text-clay"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <p className="mt-4 leading-relaxed text-stone">{post.description}</p>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-auto inline-flex items-center gap-2 pt-6 font-medium text-clay transition-colors hover:text-clay-dark"
                      >
                        Read the guide
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal delay={0.1} className="mt-16 rounded-3xl border border-border bg-parchment p-8 text-center sm:p-12">
            <h2 className="text-display text-3xl text-ink sm:text-4xl">
              Would you rather just ask someone?
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-stone">
              Every guide here started as a question a customer asked on the phone. If yours
              is not covered, call us — or come and stand inside one of the units in{" "}
              {site.showroom.city}.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/book-a-viewing" variant="primary" size="lg">
                Book a free viewing
              </ButtonLink>
              <ButtonLink href="/quote" variant="outline" size="lg">
                Price a unit
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
