import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, productSlugs, type Product } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  type SchemaObject,
} from "@/lib/schema";
import {
  getGalleryImages,
  getHeroImage,
  getProductImages,
} from "@/components/product/product-images";
import { ProductHero } from "@/components/product/product-hero";
import { ProductGallery } from "@/components/product/product-gallery";
import { OverviewSpecs } from "@/components/product/overview-specs";
import { VariantCards } from "@/components/product/variant-cards";
import { ConfiguratorSection } from "@/components/product/configurator-section";
import { FeatureGrid } from "@/components/product/feature-grid";
import { UseCaseChips } from "@/components/product/use-case-chips";
import { ProductFaq } from "@/components/product/product-faq";
import { RelatedProducts } from "@/components/product/related-products";
import { ProductCta } from "@/components/product/product-cta";

export const dynamicParams = false;

export function generateStaticParams() {
  return productSlugs.map((product) => ({ product }));
}

type Params = Promise<{ product: string }>;

/**
 * Meta description: a price-led opener followed by the product summary,
 * trimmed at a word boundary so the whole string fits MAX_DESCRIPTION chars.
 * The ellipsis is only appended when truncation actually happened, and a
 * trailing half-word or dangling punctuation is never left behind.
 */
const MAX_DESCRIPTION = 155;

function metaDescription(product: Product): string {
  const lead = `${product.shortName} from ${formatZAR(product.startingPrice)} ex VAT. `;
  const budget = MAX_DESCRIPTION - lead.length;
  const summary = product.summary;
  if (summary.length <= budget) return `${lead}${summary}`;
  const cut = summary.slice(0, budget - 1); // reserve one char for the ellipsis
  const trimmed = cut
    .slice(0, cut.lastIndexOf(" "))
    .replace(/[\s,;:–—-]+$/, "");
  return `${lead}${trimmed}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { product: slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  const hero = getHeroImage(slug);
  const title = `${product.name} from ${formatZAR(product.startingPrice)}`;
  const description = metaDescription(product);

  return {
    title,
    description,
    keywords: [...product.seoKeywords],
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title,
      description,
      url: `/${slug}`,
      type: "website",
      ...(hero
        ? {
            images: [
              {
                url: hero.src,
                width: hero.width,
                height: hero.height,
                alt: hero.alt,
              },
            ],
          }
        : {}),
    },
  };
}

/**
 * schema.org Product node. Uses an AggregateOffer spanning the variant range
 * when the product has size variants, otherwise a single ex-VAT Offer.
 */
function productJsonLd(product: Product): SchemaObject {
  const url = `${site.url}/${product.slug}`;
  const image = getProductImages(product.slug).map(
    (img) => `${site.url}${img.src}`,
  );

  const offers = product.variants?.length
    ? {
        "@type": "AggregateOffer",
        url,
        lowPrice: Math.min(...product.variants.map((v) => v.price)),
        highPrice: Math.max(...product.variants.map((v) => v.price)),
        offerCount: product.variants.length,
        priceCurrency: "ZAR",
        availability: "https://schema.org/InStock",
      }
    : {
        "@type": "Offer",
        url,
        price: product.startingPrice,
        priceCurrency: "ZAR",
        availability: "https://schema.org/InStock",
      };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    image,
    brand: { "@type": "Organization", name: site.name },
    url,
    offers,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { product: slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const hero = getHeroImage(slug);
  const gallery = getGalleryImages(slug);

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: product.name, path: `/${slug}` },
          ]),
          faqPageSchema(product.faqs),
        ]}
      />
      <ProductHero product={product} image={hero} />
      <ProductGallery productName={product.name} images={gallery} />
      <OverviewSpecs product={product} />
      <VariantCards product={product} />
      <ConfiguratorSection product={product} />
      <FeatureGrid product={product} />
      <UseCaseChips product={product} />
      <ProductFaq product={product} />
      <RelatedProducts current={product} />
      <ProductCta product={product} />
    </>
  );
}
