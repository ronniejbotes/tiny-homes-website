/**
 * JSON-LD schema helpers for Tiny Homes SA.
 *
 * Every helper returns a plain object ready for serialisation. Render with
 * the <JsonLd data={...} /> component exported below (server-safe, no JSX,
 * this file stays .ts so it uses createElement).
 */

import { createElement } from "react";
import { site } from "@/lib/site";
import { pricedVariants, products, type Product, type ProductFaq } from "@/data/products";
import { formatZAR } from "@/lib/format";
import { OPENING_HOURS, formatTime, weekdayName } from "@/lib/hours";
import images from "@/data/images.json";
import { toPlainText } from "@/components/blog/rich-text";

export type SchemaObject = Record<string, unknown>;

const ORG_ID = `${site.url}/#organization`;
const LOCAL_ID = `${site.url}/#localbusiness`;

/** Registered head office. The Organization node's address — NOT the showroom. */
function postalAddress(): SchemaObject {
  return {
    "@type": "PostalAddress",
    streetAddress: `${site.address.streetAddress}, ${site.address.locality}`,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    addressCountry: site.address.countryCode,
  };
}

/**
 * The showroom, for the LocalBusiness node.
 *
 * A LocalBusiness describes the place customers are served, so this must agree
 * with `geo` on the same node. It did not until 2026-08-11: the node paired the
 * head office's postal address with the showroom's coordinates, two points
 * 2.65 km apart, which is a contradiction handed straight to Google — and it
 * would have fought the Google Business Profile being claimed at the showroom.
 *
 * No `streetAddress`: the showroom has none (owner-confirmed). Locality,
 * region, postcode and the coordinates are everything that is actually known,
 * and an incomplete address pointing at the right place beats a complete one
 * pointing at the wrong place.
 */
function showroomPostalAddress(): SchemaObject {
  return {
    "@type": "PostalAddress",
    addressLocality: `${site.showroom.locality}, ${site.showroom.city}`,
    addressRegion: site.showroom.region,
    postalCode: site.showroom.postalCode,
    addressCountry: site.address.countryCode,
  };
}

/**
 * Identity node for the whole site.
 *
 * Organization and LocalBusiness are emitted as two separate nodes rather than
 * one node typed `["Organization", "LocalBusiness"]`. Both forms are valid
 * schema.org, but an array-valued `@type` is invisible to the many audit and
 * rich-result parsers that match `@type` as a plain string, so the site read as
 * having no identity markup at all. Two single-typed nodes, cross-linked by
 * `@id`, are understood by everything.
 */
export function organizationSchema(): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    slogan: site.tagline,
    description: site.description,
    url: site.url,
    logo: `${site.url}${images.brand.logo}`,
    image: `${site.url}${images.brand.logo}`,
    telephone: site.phone,
    email: site.email,
    address: postalAddress(),
    sameAs: [site.social.facebook, site.social.instagram, site.social.tiktok],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: site.phone,
      email: site.email,
      areaServed: site.address.countryCode,
      availableLanguage: ["en"],
    },
  };
}

/** The Centurion showroom as a physical business, for local search. */
export function localBusinessSchema(): SchemaObject {
  // Range across every variant, not just base prices, the 11.5 m capsule tops
  // out at R1 070 900. Price-on-request products and sizes carry a 0 sentinel
  // and are excluded.
  // Garages are a DIY steel-kit line, not a home, excluded so the advertised
  // homes price range matches the site-wide "homes from R54 900" copy.
  const prices = products
    .filter((p) => !p.priceOnRequest && p.slug !== "garages")
    .flatMap((p) => {
      const priced = pricedVariants(p);
      return priced.length ? priced.map((v) => v.price) : [p.startingPrice];
    });
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": LOCAL_ID,
    name: site.name,
    description: site.description,
    url: site.url,
    image: `${site.url}${images.brand.logo}`,
    logo: `${site.url}${images.brand.logo}`,
    telephone: site.phone,
    email: site.email,
    priceRange: `${formatZAR(Math.min(...prices))} – ${formatZAR(Math.max(...prices))} ex VAT`,
    currenciesAccepted: "ZAR",
    address: showroomPostalAddress(),
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    // The owner's own Google Maps pin. Schema.org's hasMap is the field Google
    // reads to tie this business to a place it already knows about.
    hasMap: site.mapsLink,
    sameAs: [site.social.facebook, site.social.instagram, site.social.tiktok],
    areaServed: areaServed(),
    // The showroom's opening hours, the same as the Google Business Profile
    // and the hours line on /contact (all three read src/lib/hours.ts). The
    // Friday is its own span because the showroom shuts at 13:00. Viewings
    // are arranged by email only (owner, 29 October 2026); these are the
    // hours the showroom is open, not bookable slots.
    openingHoursSpecification: OPENING_HOURS.map((span) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: span.days.map((weekday) => `https://schema.org/${weekdayName(weekday)}`),
      opens: formatTime(span.opens),
      closes: formatTime(span.closes),
    })),
    parentOrganization: { "@id": ORG_ID },
  };
}

/**
 * Where the business serves, as structured data.
 *
 * South Africa first, then each province by name, then the neighbouring
 * countries we will quote a cross-border run into. Naming the provinces
 * individually is the point: a single "Country: South Africa" node tells a
 * search engine nothing about Gauteng or the Western Cape, which is where the
 * searches with buying intent actually happen.
 */
function areaServed(): SchemaObject[] {
  return [
    { "@type": "Country", name: site.address.country },
    ...site.deliveryRegions.provinces.map((name) => ({
      "@type": "AdministrativeArea",
      name,
      containedInPlace: { "@type": "Country", name: site.address.country },
    })),
    ...site.deliveryRegions.countries.map((name) => ({ "@type": "Country", name })),
  ];
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

/**
 * ISO date the emitted prices claim to be valid until: one year out, derived
 * rather than typed.
 *
 * Google drops the price from a product rich result once `priceValidUntil` is
 * in the past, so a hardcoded literal here silently kills the price snippet on
 * every product the day it passes — and, because the same dead date is baked in
 * again, a redeploy does not heal it. Product pages are statically rendered, so
 * this is evaluated at build time and every deploy pushes the window out a
 * further year.
 */
function priceValidUntil(): string {
  const now = new Date();
  const until = new Date(
    Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth(), now.getUTCDate()),
  );
  return until.toISOString().slice(0, 10);
}

/**
 * What Google is told about stock. The owner, 16 October 2026: every unit is
 * made to order after the deposit, except the X-Fold, which is sometimes in
 * stock but needs an enquiry to confirm. Google's product docs list no
 * "MadeToOrder" value, so built-to-order units say PreOrder, and the X-Fold
 * says LimitedAvailability. Never InStock: nothing is bought online and the
 * pages give about 90 days from deposit to move-in.
 */
export function productAvailability(product: Product): string {
  return product.slug === "folding-homes"
    ? "https://schema.org/LimitedAvailability"
    : "https://schema.org/PreOrder";
}

/**
 * schema.org Product node: the single JSON-LD builder for every product page.
 * Uses an AggregateOffer spanning the variant range (with a nested per-variant
 * Offer carrying its own sku) when the product has size variants, otherwise a
 * single ex-VAT Offer. All prices are ZAR, VAT-exclusive per PriceSpecification.
 * A price-on-request product (none since the safari tents were removed on
 * 29 October 2026) emits a plain WebPage node instead: its 0 sentinel price
 * must never reach structured data, and a Product with no offer, review or
 * rating is an invalid product snippet to Google (URL Inspection ERROR on the
 * old /safari-tents page, 18 October 2026).
 */
export function productSchema(product: Product): SchemaObject {
  const productImages =
    (images.products as Record<string, { src: string; kind?: string }[]>)[product.slug] ?? [];
  // Photos only: diagrams/spec sheets in Product structured data hurt image rich results.
  const image = productImages
    .filter((img) => img.kind !== "diagram")
    .map((img) => `${site.url}${img.src}`);
  const url = `${site.url}/${product.slug}`;
  const seller = { "@id": ORG_ID };
  // Offers carry the same province-and-neighbour list as the business node, so
  // a product page is eligible for a regional query, not only a national one.
  const offerArea = areaServed();
  const availability = productAvailability(product);

  if (product.priceOnRequest) {
    return {
      ...webPageSchema("WebPage", {
        name: `${product.name} | ${site.name}`,
        description: product.summary,
        path: `/${product.slug}`,
      }),
      image,
    };
  }

  const validUntil = priceValidUntil();

  const priceSpecification = (price: number) => ({
    "@type": "PriceSpecification",
    price,
    priceCurrency: "ZAR",
    valueAddedTaxIncluded: false,
  });

  // Only sizes with a published price become Offers. A price-on-request size
  // (the 3.5 m and 3.9 m outdoor kitchens) has a 0 sentinel and no price to
  // offer, so it is left out of the range, the count and the nested list.
  const priced = pricedVariants(product);
  const offers = priced.length
    ? {
        "@type": "AggregateOffer",
        url,
        priceCurrency: "ZAR",
        lowPrice: Math.min(...priced.map((v) => v.price)),
        highPrice: Math.max(...priced.map((v) => v.price)),
        offerCount: priced.length,
        priceValidUntil: validUntil,
        itemCondition: "https://schema.org/NewCondition",
        availability,
        seller,
        areaServed: offerArea,
        offers: priced.map((variant) => ({
          "@type": "Offer",
          url,
          name: variant.name,
          sku: variant.id,
          price: variant.price,
          priceCurrency: "ZAR",
          priceSpecification: priceSpecification(variant.price),
          priceValidUntil: validUntil,
          itemCondition: "https://schema.org/NewCondition",
          availability,
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
        priceValidUntil: validUntil,
        itemCondition: "https://schema.org/NewCondition",
        availability,
        seller,
        areaServed: offerArea,
      };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} | ${site.name}`,
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
      acceptedAnswer: { "@type": "Answer", text: toPlainText(faq.a) },
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

/* ------------------------------------------------------ collections & blog */

/**
 * CollectionPage node for a hub page that gathers several products under one
 * search term (e.g. /housing-pods).
 *
 * Typed CollectionPage rather than WebPage because that is what the page is:
 * it does not describe one product, it groups the ones that answer a query.
 * The ItemList is emitted as a SEPARATE node by `itemListSchema` rather than
 * nested in `mainEntity`, matching what the homepage already does — a
 * top-level ItemList is the form Google's list parsers actually read.
 */
export function collectionPageSchema(page: {
  name: string;
  description: string;
  path: string;
}): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.name,
    description: page.description,
    url: `${site.url}${page.path}`,
    inLanguage: "en-ZA",
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    about: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

/**
 * ItemList of products, each with its offer and main photo, for the homepage
 * and hub pages.
 *
 * `image` is the product's hero photo, the same one its card shows (Google
 * reports a merchant listing without one as an ERROR). Price-on-request
 * products publish no offer — a 0 sentinel reaching structured data would be a
 * false price claim — so they are listed by name and link only, never as a
 * Product, matching `productSchema`.
 */
export function productItemListSchema(
  name: string,
  items: Product[],
): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((product, index) => {
      const image = heroImageUrl(product.slug);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: `${site.url}/${product.slug}`,
        ...(product.priceOnRequest
          ? {}
          : {
              item: {
                "@type": "Product",
                name: product.name,
                description: product.summary,
                url: `${site.url}/${product.slug}`,
                ...(image ? { image } : {}),
                brand: { "@type": "Brand", name: site.name },
                offers: {
                  "@type": "Offer",
                  price: product.startingPrice,
                  priceCurrency: "ZAR",
                  availability: productAvailability(product),
                  seller: { "@id": ORG_ID },
                },
              },
            }),
      };
    }),
  };
}

/** Absolute URL of a product's hero photo (the manifest's `hero` image, else
 *  its first), the photo the homepage and hub cards show for it. */
function heroImageUrl(slug: string): string | undefined {
  const productImages =
    (images.products as Record<string, { src: string; hero?: boolean }[]>)[slug] ?? [];
  const hero = productImages.find((img) => img.hero) ?? productImages[0];
  return hero ? `${site.url}${hero.src}` : undefined;
}

/**
 * BlogPosting node for one article.
 *
 * `author` is the Organization, not a person: nobody on the site has a byline
 * or an author page, and inventing a named author to satisfy an E-E-A-T
 * checklist is the kind of fabricated authority Google's own guidance calls
 * out. The company genuinely is the author.
 *
 * `dateModified` falls back to `datePublished` so the field is never absent,
 * and both are plain ISO dates carried in the post data rather than derived
 * from the build — a build-stamped `dateModified` would tell Google the whole
 * blog was rewritten on every deploy.
 */
export function blogPostingSchema(post: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  keywords?: readonly string[];
  references?: readonly { title: string; publisher: string; url: string }[];
}): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${site.url}${post.path}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}${post.path}` },
    inLanguage: "en-ZA",
    datePublished: post.datePublished,
    dateModified: post.dateModified ?? post.datePublished,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    ...(post.image ? { image: `${site.url}${post.image}` } : {}),
    ...(post.keywords?.length ? { keywords: post.keywords.join(", ") } : {}),
    // Sources the article leans on. `citation` is the field that says "this
    // claim came from somewhere checkable", which is the whole difference
    // between a researched piece and an asserted one.
    ...(post.references?.length
      ? {
          citation: post.references.map((ref) => ({
            "@type": "CreativeWork",
            name: ref.title,
            publisher: { "@type": "Organization", name: ref.publisher },
            url: ref.url,
          })),
        }
      : {}),
    isPartOf: {
      "@type": "Blog",
      name: `${site.name} Journal`,
      url: `${site.url}/blog`,
    },
  };
}

/** Blog node for the index page, listing its posts newest first. */
export function blogSchema(
  posts: { title: string; description: string; path: string; datePublished: string }[],
): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${site.name} Journal`,
    description:
      "Guides to buying a prefab tiny home, housing pod or cabin in South Africa: prices, sizes, site preparation and how the options compare.",
    url: `${site.url}/blog`,
    inLanguage: "en-ZA",
    publisher: { "@id": ORG_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `${site.url}${post.path}`,
      datePublished: post.datePublished,
      author: { "@id": ORG_ID },
    })),
  };
}
