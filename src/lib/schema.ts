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
  const prices = products.map((p) => p.startingPrice);
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    logo: `${site.url}${images.brand.logo}`,
    image: `${site.url}${images.brand.logo}`,
    telephone: site.phone,
    email: site.email,
    priceRange: `${formatZAR(Math.min(...prices))} – ${formatZAR(Math.max(...prices))} ex VAT`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.locality,
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

/** schema.org Product node with an ex-VAT ZAR offer. */
export function productSchema(product: Product): SchemaObject {
  const productImages =
    (images.products as Record<string, { src: string }[]>)[product.slug] ?? [];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${site.name}`,
    description: product.summary,
    image: productImages.map((img) => `${site.url}${img.src}`),
    brand: { "@type": "Brand", name: site.name },
    url: `${site.url}/${product.slug}`,
    offers: {
      "@type": "Offer",
      url: `${site.url}/${product.slug}`,
      price: product.startingPrice,
      priceCurrency: "ZAR",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: product.startingPrice,
        priceCurrency: "ZAR",
        valueAddedTaxIncluded: false,
      },
      seller: { "@id": ORG_ID },
      areaServed: { "@type": "Country", name: site.address.country },
    },
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
