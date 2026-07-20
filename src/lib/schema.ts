/**
 * JSON-LD schema helpers for Tiny Homes SA.
 *
 * Every helper returns a plain object ready for serialisation. Render with
 * the <JsonLd data={...} /> component exported below (server-safe, no JSX —
 * this file stays .ts so it uses createElement).
 */

import { createElement } from "react";
import { site } from "@/lib/site";
import { products, type Product, type ProductFaq } from "@/data/products";
import { formatZAR } from "@/lib/format";
import images from "@/data/images.json";

export type SchemaObject = Record<string, unknown>;

const ORG_ID = `${site.url}/#organization`;

/** Organization + LocalBusiness node for the whole site. */
export function organizationSchema(): SchemaObject {
  // Range across every variant, not just base prices — the 11.5 m capsule tops
  // out at R950 000. Price-on-request products carry a 0 sentinel and are excluded.
  // Garages are a DIY steel-kit line, not a home — excluded so the advertised
  // homes price range matches the site-wide "homes from R55 000" copy.
  const prices = products
    .filter((p) => !p.priceOnRequest && p.slug !== "garages")
    .flatMap((p) => (p.variants?.length ? p.variants.map((v) => v.price) : [p.startingPrice]));
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    slogan: "Innovative Instant Housing Solutions",
    description: site.description,
    url: site.url,
    logo: `${site.url}${images.brand.logo}`,
    image: `${site.url}${images.brand.logo}`,
    telephone: site.phone,
    email: site.email,
    priceRange: `${formatZAR(Math.min(...prices))} – ${formatZAR(Math.max(...prices))} ex VAT`,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.streetAddress}, ${site.address.locality}`,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    sameAs: [site.social.facebook, site.social.instagram],
    areaServed: { "@type": "Country", name: site.address.country },
  };
}

/** WebPage / AboutPage / ContactPage node linked back to the organization. */
export function webPageSchema(
  type: "WebPage" | "AboutPage" | "ContactPage",
  page: { name: string; description: string; path: string },
): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: page.name,
    description: page.description,
    url: `${site.url}${page.path}`,
    inLanguage: "en-ZA",
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    about: { "@id": ORG_ID },
  };
}

/** BreadcrumbList from an ordered list of { name, path } items. */
export function breadcrumbSchema(items: { name: string; path: string }[]): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

/** ISO date this catalogue's prices are valid until — bump when the price list is reissued. */
const PRICE_VALID_UNTIL = "2026-12-31";

/**
 * schema.org Product node — the single JSON-LD builder for every product page.
 * Uses an AggregateOffer spanning the variant range (with a nested per-variant
 * Offer carrying its own sku) when the product has size variants, otherwise a
 * single ex-VAT Offer. All prices are ZAR, VAT-exclusive per PriceSpecification.
 * Price-on-request products emit the Product node WITHOUT offers — their 0
 * sentinel price must never reach structured data.
 */
export function productSchema(product: Product): SchemaObject {
  const productImages =
    (images.products as Record<string, { src: string; kind?: string }[]>)[product.slug] ?? [];
  // Photos only — diagrams/spec sheets in Product structured data hurt image rich results.
  const image = productImages
    .filter((img) => img.kind !== "diagram")
    .map((img) => `${site.url}${img.src}`);
  const url = `${site.url}/${product.slug}`;
  const seller = { "@id": ORG_ID };
  const areaServed = { "@type": "Country", name: site.address.country };

  if (product.priceOnRequest) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${product.name} — ${site.name}`,
      description: product.summary,
      image,
      brand: { "@type": "Brand", name: site.name },
      url,
    };
  }

  const priceSpecification = (price: number) => ({
    "@type": "PriceSpecification",
    price,
    priceCurrency: "ZAR",
    valueAddedTaxIncluded: false,
  });

  const offers = product.variants?.length
    ? {
        "@type": "AggregateOffer",
        url,
        priceCurrency: "ZAR",
        lowPrice: Math.min(...product.variants.map((v) => v.price)),
        highPrice: Math.max(...product.variants.map((v) => v.price)),
        offerCount: product.variants.length,
        priceValidUntil: PRICE_VALID_UNTIL,
        itemCondition: "https://schema.org/NewCondition",
        availability: "https://schema.org/InStock",
        seller,
        areaServed,
        offers: product.variants.map((variant) => ({
          "@type": "Offer",
          url,
          name: variant.name,
          sku: variant.id,
          price: variant.price,
          priceCurrency: "ZAR",
          priceSpecification: priceSpecification(variant.price),
          priceValidUntil: PRICE_VALID_UNTIL,
          itemCondition: "https://schema.org/NewCondition",
          availability: "https://schema.org/InStock",
          seller,
        })),
      }
    : {
        "@type": "Offer",
        url,
        sku: product.slug,
        price: product.startingPrice,
        priceCurrency: "ZAR",
        priceSpecification: priceSpecification(product.startingPrice),
        priceValidUntil: PRICE_VALID_UNTIL,
        itemCondition: "https://schema.org/NewCondition",
        availability: "https://schema.org/InStock",
        seller,
        areaServed,
      };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${site.name}`,
    description: product.summary,
    image,
    brand: { "@type": "Brand", name: site.name },
    url,
    offers,
  };
}

/** FAQPage node from a product's (or page's) Q&A list. */
export function faqPageSchema(faqs: ProductFaq[]): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/**
 * Server component rendering one or more JSON-LD nodes in a script tag.
 * Usage: <JsonLd data={organizationSchema()} /> or <JsonLd data={[a, b]} />.
 */
export function JsonLd({ data }: { data: SchemaObject | SchemaObject[] }) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}
