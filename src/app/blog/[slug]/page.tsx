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
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-stone transition-colors hover:text-ink"
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

          {/* One CTA at the foot of every post, not three through the body:
              the in-body `cta` blocks are placed where they are argued for. */}
          <Reveal className="mt-16 max-w-[68ch] rounded-3xl border border-border bg-parchment p-8 sm:p-10">
            <h2 className="text-display text-3xl text-ink">
              Price one, or come and see one
            </h2>
            <p className="mt-4 leading-relaxed text-stone">
              The quote builder prices a specific configuration in a couple of minutes. Or
              book a free viewing and walk through the units at our showroom in{" "}
              {site.showroom.city} — no deposit, no obligation.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/quote" variant="accent" size="lg">
                Get an instant quote
              </ButtonLink>
              <ButtonLink href="/book-a-viewing" variant="outline" size="lg">
                Book a viewing
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
