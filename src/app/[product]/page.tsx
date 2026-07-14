import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, productSlugs, type Product } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { site } from "@/lib/site";
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  productSchema,
} from "@/lib/schema";
import { getGalleryImages, getHeroImage } from "@/components/product/product-images";
import { ProductHero } from "@/components/product/product-hero";
import { ProductGallery } from "@/components/product/product-gallery";
import { Product3D } from "@/components/product/product-3d";
import { OverviewSpecs } from "@/components/product/overview-specs";
import { VariantCards } from "@/components/product/variant-cards";
import { ConfiguratorSection } from "@/components/product/configurator-section";
import { FeatureGrid } from "@/components/product/feature-grid";
import { UseCaseChips } from "@/components/product/use-case-chips";
import { ProductFaq } from "@/components/product/product-faq";
import { RelatedProducts } from "@/components/product/related-products";
import { ProductCta } from "@/components/product/product-cta";
import models from "@/data/models.json";

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
  // Price-on-request products carry a 0 sentinel — never lead with "from R 0".
  const lead = product.priceOnRequest
    ? `${product.shortName} — price on request. `
    : `${product.shortName} from ${formatZAR(product.startingPrice)} ex VAT. `;
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
  const title = product.priceOnRequest
    ? `${product.name} — Price on Request`
    : `${product.name} from ${formatZAR(product.startingPrice)}`;
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
      locale: "en_ZA",
      siteName: site.name,
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
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(hero ? { images: [hero.src] } : {}),
    },
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
          productSchema(product),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: product.name, path: `/${slug}` },
          ]),
          faqPageSchema(product.faqs),
        ]}
      />
      <ProductHero product={product} image={hero} />
      <ProductGallery productName={product.name} images={gallery} />
      {/* Only products with a 3D model in models.json render the viewer. */}
      {product.slug in models && (
        <Product3D slug={product.slug} productName={product.name} />
      )}
      <OverviewSpecs product={product} />
      <VariantCards product={product} />
      {/* No options, no configurator — kitchens and safari tents are quoted, not configured. */}
      {product.options.length > 0 && <ConfiguratorSection product={product} />}
      <FeatureGrid product={product} />
      <UseCaseChips product={product} />
      <ProductFaq product={product} />
      <RelatedProducts current={product} />
      <ProductCta product={product} />
    </>
  );
}
