import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import {
  JsonLd,
  blogPostingSchema,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/schema";
import { BlogBody } from "@/components/blog/blog-body";
import { toPlainText } from "@/components/blog/rich-text";
import { getHeroImage } from "@/components/product/product-images";
import { blogSlugs, getBlogPost, relatedPosts } from "@/data/blog";
import { site } from "@/lib/site";
import { BUSINESS_ENQUIRY_HREF } from "@/lib/enquiry";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogSlugs.map((slug) => ({ slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  const image = getHeroImage(post.imageProduct);
  const path = `/blog/${post.slug}`;

  return {
    title: post.seoTitle,
    description: post.description,
    keywords: [...post.keywords],
    alternates: { canonical: path },
    openGraph: {
      // "article", not "website": this is the one page type where the
      // distinction earns something, since it lets the published date travel
      // with the share card.
      type: "article",
      locale: "en_ZA",
      siteName: site.name,
      title: post.title,
      description: post.description,
      url: path,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified ?? post.datePublished,
      ...(image
        ? {
            images: [
              { url: image.src, width: image.width, height: image.height, alt: image.alt },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(image ? { images: [image.src] } : {}),
    },
  };
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const image = getHeroImage(post.imageProduct);
  const path = `/blog/${post.slug}`;
  const more = relatedPosts(post.slug);

  /* FAQ answers are authored in the same inline markup as the body, so they
     are flattened before they reach structured data: a rich result carrying
     literal "**bold**" is worse than no rich result. */
  const faqs = post.faqs?.map((faq) => ({ q: faq.q, a: toPlainText(faq.a) }));

  return (
    <>
      <JsonLd
        data={[
          blogPostingSchema({
            title: post.title,
            description: post.description,
            path,
            datePublished: post.datePublished,
            dateModified: post.dateModified,
            image: image?.src,
            keywords: post.keywords,
            references: post.references,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/blog" },
            { name: post.title, path },
          ]),
          ...(faqs?.length ? [faqPageSchema(faqs)] : []),
        ]}
      />

      {/* --------------------------------------------------------- header */}
      <header className="bg-parchment pt-32 pb-12 sm:pt-40 sm:pb-16">
        <Container>
          <Reveal className="max-w-[68ch]">
            <nav aria-label="Breadcrumb">
              {/* min-h-11 makes the tap target 44px tall (it was 20px);
                  -my-3 hands the extra 24px back so the header doesn't move. */}
              <Link
                href="/blog"
                className="-my-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-stone transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                All guides
              </Link>
            </nav>
            <h1 className="text-display mt-6 text-4xl leading-tight text-ink sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone">{post.description}</p>
            <p className="mt-6 text-sm text-stone">
              <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              {post.readingMinutes} min read
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              {site.name}
            </p>
            <div className="mt-6">
              <ButtonLink href={BUSINESS_ENQUIRY_HREF} variant="accent" size="lg">
                Business enquiry
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </header>

      {image && (
        <Container>
          <Reveal className="relative aspect-[21/9] overflow-hidden rounded-3xl">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1280px) 76rem, 100vw"
              className="object-cover"
            />
          </Reveal>
        </Container>
      )}

      {/* ----------------------------------------------------------- body */}
      <article className="py-16 sm:py-20">
        <Container>
          <BlogBody blocks={post.body} />

          {post.faqs?.length ? (
            <section aria-labelledby="post-faq" className="mt-16 max-w-[68ch]">
              <h2 id="post-faq" className="text-display text-3xl text-ink sm:text-4xl">
                Quick answers
              </h2>
              <div className="mt-8">
                <Accordion items={post.faqs} />
              </div>
            </section>
          ) : null}

          {post.references?.length ? (
            <section aria-labelledby="post-sources" className="mt-16 max-w-[68ch]">
              <h2 id="post-sources" className="font-display text-2xl text-ink">
                Sources
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                Figures we quote from outside our own price list, and where they came
                from. Prices for our own units come from the same catalogue the product
                pages use.
              </p>
              <ol className="mt-6 space-y-4">
                {post.references.map((ref, i) => (
                  <li key={ref.url} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="nums-tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand text-xs font-medium text-ink"
                    >
                      {i + 1}
                    </span>
                    <span className="text-stone">
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-clay underline decoration-clay/30 underline-offset-4 transition-colors hover:text-clay-dark hover:decoration-clay"
                      >
                        {ref.title}
                      </a>
                      {", "}
                      <span className="text-ink">{ref.publisher}</span>
                      {ref.note ? <span className="block text-stone">{ref.note}</span> : null}
                      {ref.checked ? (
                        <span className="mt-1 block text-sm text-stone">
                          Checked on{" "}
                          <time dateTime={ref.checked}>{formatDate(ref.checked)}</time>
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {/* One CTA at the foot of every post, not three through the body:
              the in-body `cta` blocks are placed where they are argued for. */}
          <Reveal className="mt-16 max-w-[68ch] rounded-3xl border border-border bg-parchment p-8 sm:p-10">
            {/* Business buyers first (owner, 29 Oct 2026); the viewing
                invitation that sat here went with the booker. */}
            <h2 className="text-display text-3xl text-ink">
              Buying for a business, or for yourself?
            </h2>
            <p className="mt-4 leading-relaxed text-stone">
              Buying several units for a business? Send us a business enquiry with your
              company name, what the units will be used for, where they will go and how many
              you need. Buying one for yourself? The quote builder prices a specific
              configuration in a couple of minutes.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={BUSINESS_ENQUIRY_HREF} variant="accent" size="lg">
                Business enquiry
              </ButtonLink>
              <ButtonLink href="/quote" variant="outline" size="lg">
                Get an instant quote
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </article>

      {/* --------------------------------------------------------- read on */}
      {more.length > 0 && (
        <section aria-labelledby="read-next" className="bg-parchment py-20 sm:py-24">
          <Container>
            <h2 id="read-next" className="text-display text-3xl text-ink sm:text-4xl">
              Read next
            </h2>
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {more.map((next) => (
                <li key={next.slug}>
                  <article className="h-full rounded-3xl border border-border bg-cream p-7">
                    <p className="text-sm text-stone">{next.readingMinutes} min read</p>
                    <h3 className="mt-2 font-display text-xl leading-snug text-ink">
                      <Link
                        href={`/blog/${next.slug}`}
                        className="transition-colors hover:text-clay"
                      >
                        {next.title}
                      </Link>
                    </h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                      {next.description}
                    </p>
                    <Link
                      href={`/blog/${next.slug}`}
                      className="mt-5 inline-flex items-center gap-2 font-medium text-clay transition-colors hover:text-clay-dark"
                    >
                      Read it
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
