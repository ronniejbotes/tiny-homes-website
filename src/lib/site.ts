export const site = {
  name: "Tiny Homes SA",
  legalName: "Tiny Homes (Pty) Ltd",
  tagline: "Innovative Instant Housing Solutions",
  description:
    "High-end prefab tiny homes designed for affordable, sustainable living in South Africa. Folding homes, expandable homes, nature cabins, apple cabins and glamping capsules, plus outdoor kitchens, delivered nationwide across South Africa from a showroom in Centurion, Gauteng, and across the border into Botswana, Namibia, Zimbabwe and the rest of southern Africa.",
  /**
   * Apex is canonical: every indexed URL is on the apex, and next.config.ts
   * 308s www.tinyhomesa.com here. Until 2026-08-10 that redirect did not
   * exist and www served a byte-identical 200 copy of the whole site; the
   * claim was in this comment for months before it was true, so verify from
   * outside the network before trusting it again.
   */
  url: "https://tinyhomesa.com",
  phone: "+27 83 660 3743",
  phoneDisplay: "083 660 3743",
  whatsapp: "https://wa.me/27836603743",
  /**
   * admin@ is the only mailbox confirmed to exist; swap to sales@ once that one
   * is provisioned. Business enquiries and the optional pre-visit emails both come here
   * (src/lib/enquiry.ts). The safari-tent address that sat beside this one went
   * with the tents on 29 October 2026.
   */
  email: "admin@tinyhomesa.com",
  /**
   * THE ONE ADDRESS: the showroom in Sunderland Ridge. The units stand there,
   * every visitor goes there, and it is the only address any page, quotation
   * or email shows.
   *
   * Owner, 13 November 2026: "make sure everywhere the location is not in
   * gouws avenue, and it is all at the one in sunderland ridge ... people keep
   * going to the gouws avenue address and get annoyed they have to drive
   * elsewhere." 187 Gouws Ave (the registered office) used to sit here and was
   * printed in the footer of every page, on the privacy page and on every
   * quotation and quote email. It is gone from the site on purpose: never
   * render it again, anywhere.
   *
   * No street address: the showroom has none (owner, August 2026), so the pin
   * in `geo` is the authoritative location. "Sunderland Ridge" is the owner's
   * own name for the place (13 November 2026); OpenStreetMap labels the pin
   * Raslouw, the suburb next door, but visitors follow the pin. 0157 is the
   * postcode the Google Business Profile carries.
   */
  address: {
    locality: "Sunderland Ridge",
    city: "Centurion",
    region: "Gauteng",
    postalCode: "0157",
    country: "South Africa",
    countryCode: "ZA",
  },
  /** The showroom's display name; `address` above is where it is. */
  showroom: {
    name: "Tiny Homes Showroom",
    locality: "Sunderland Ridge",
    city: "Centurion",
    region: "Gauteng",
    postalCode: "0157",
  },
  geo: {
    // Showroom pin, owner-supplied 13 November 2026
    // (https://maps.google.com/?q=-25.847040,28.106272), about 28 m east of
    // the August pin (-25.847111, 28.106002). Feeds the LocalBusiness schema,
    // the map on /contact, the footer map and every directions link, so the
    // point Google is told about and the one a visitor drives to are the same.
    // Five decimal places minimum, as Google's LocalBusiness reference asks.
    latitude: -25.84704,
    longitude: 28.106272,
  },
  /** The owner's own Google Maps link for the pin (13 November 2026). */
  mapsLink: "https://maps.google.com/?q=-25.847040,28.106272",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61587151281004",
    instagram: "https://www.instagram.com/tinyhomes.sa/",
    tiktok: "https://www.tiktok.com/@tiny.homesa",
  },
  /**
   * Where we deliver, for both the copy and the LocalBusiness areaServed.
   *
   * Provinces are the local-search half: "tiny homes Gauteng" and "prefab
   * homes Western Cape" are searched far more than the national term, and a
   * page that never names a province cannot rank for one.
   *
   * The cross-border list is deliberately worded as quoted on request rather
   * than a delivery promise. Units leave the factory on a truck from
   * Centurion, so a Gaborone or Windhoek run is a real prospect, but it is a
   * per-project quotation and the copy must not imply a standing service.
   */
  deliveryRegions: {
    provinces: [
      "Gauteng",
      "Western Cape",
      "KwaZulu-Natal",
      "Eastern Cape",
      "Free State",
      "Mpumalanga",
      "Limpopo",
      "North West",
      "Northern Cape",
    ],
    countries: ["Botswana", "Namibia", "Zimbabwe", "Mozambique", "Eswatini", "Lesotho"],
  },
  leadTimeDays: 90,
  deliveryNote:
    "Delivery is quoted separately based on your location and site accessibility. We deliver nationwide.",
  /** 1-year limited guarantee, owner-confirmed 2026-07-29 (supersedes the sales
   *  deck's 10-year claim): quote verbatim across features/about/FAQ. */
  guarantee: "1-year limited guarantee on all our products",
  /**
   * The one payment line, owner-confirmed 2026-08-25: a home is either paid
   * for in full or financed by an outside provider. Lay-bye was withdrawn on
   * that date and must not come back into the copy — we do not hold stock
   * against instalments, and saying we do is a promise the business cannot
   * keep. Always pair with "subject to credit approval": the decision is the
   * provider's, never ours.
   */
  finance: "Finance available through a third-party provider, subject to credit approval",
} as const;

/* ------------------------------------------------------------ the showroom */

/** `-25.84704,28.106272`: the pin, in the form every Google Maps URL wants. */
export const showroomPin = `${site.geo.latitude},${site.geo.longitude}`;

/**
 * The ways we point someone at the showroom, derived once so the map on
 * /contact and the map and directions link in the footer can never drift
 * apart.
 *
 * `showroomDirectionsUrl` opens turn-by-turn navigation from wherever the
 * visitor is standing; `site.mapsLink` just shows them the pin. The embed uses
 * the keyless `output=embed` endpoint — Google's documented iframe API needs a
 * billing key, and this older form renders the same map without one.
 */
export const showroomDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${showroomPin}`;
export const showroomMapEmbedUrl = `https://www.google.com/maps?q=${showroomPin}&z=16&hl=en&output=embed`;

export const nav = {
  products: [
    { slug: "folding-homes", label: "X-Folds" },
    { slug: "expandable-homes", label: "Expandable Homes" },
    { slug: "nature-cabins", label: "Nature Cabins" },
    { slug: "apple-cabins", label: "Apple Cabins" },
    { slug: "glamping-capsules", label: "Glamping Capsules" },
    { slug: "outdoor-kitchens", label: "Outdoor Kitchens" },
  ],
  pages: [
    { href: "/blog", label: "Guides" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  /**
   * Pages that belong in the footer but not in the top bar.
   *
   * /housing-pods is a hub over products that already have their own nav
   * entries, so putting it in the header would list the same five ranges
   * twice. It still needs a site-wide internal link from every page — a hub
   * reachable only from the sitemap is a hub search engines discount — and
   * the footer is where that link costs nothing.
   */
  resources: [
    { href: "/housing-pods", label: "Housing Pods" },
    { href: "/blog", label: "Guides & Advice" },
    { href: "/quote", label: "Get a Quote" },
  ],
} as const;
