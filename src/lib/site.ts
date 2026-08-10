export const site = {
  name: "Tiny Homes SA",
  legalName: "Tiny Homes (Pty) Ltd",
  tagline: "Innovative Instant Housing Solutions",
  description:
    "High-end prefab tiny homes designed for affordable, sustainable living in South Africa. Folding homes, expandable homes, nature cabins, apple cabins and glamping capsules, plus outdoor kitchens and safari tents, delivered nationwide from Centurion, Gauteng, and across the border into Botswana, Namibia, Zimbabwe and the rest of southern Africa.",
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
  /** admin@ is the only mailbox confirmed to exist; swap to sales@ once that one is provisioned. */
  email: "admin@tinyhomesa.com",
  /**
   * REGISTERED HEAD OFFICE. Not the place visitors come to.
   *
   * Owner, 2026-08-10: "that is our registered address for our head office,
   * not the site — people do not want to come see our offices, they want to
   * view the showroom." Use this only for the legal entity: the privacy page,
   * the quotation letterhead and the company details in the footer.
   *
   * Anything a visitor navigates to must use `showroom` below. Until
   * 2026-08-10 this address was rendered on the book-a-viewing page, in the
   * confirmation email and as the calendar invitation's location, so people
   * who booked a viewing were sent to the office.
   */
  address: {
    streetAddress: "187 Gouws Ave",
    locality: "Raslouw AH",
    city: "Centurion",
    region: "Gauteng",
    country: "South Africa",
    countryCode: "ZA",
  },
  /**
   * THE SHOWROOM — where viewings happen and where every visitor goes.
   *
   * Deliberately carries no street address. The owner confirmed one does not
   * exist ("there is no street address for the showroom"), and the pin is the
   * authoritative location: `geo` below, plus `mapsLink`.
   *
   * The suburb is omitted on purpose. The contact page asserted "Sunderland
   * Ridge", but reverse-geocoding the pin on 2026-08-10 returned Rudolf
   * Street, Raslouw — a different suburb. One of the two is wrong and nobody
   * has confirmed which, so naming neither beats naming the wrong one.
   * Fill in `locality` once the owner confirms it.
   */
  showroom: {
    name: "Tiny Homes Showroom",
    city: "Centurion",
    region: "Gauteng",
  },
  geo: {
    // Showroom pin, owner-supplied 2026-08-06: 25°50'49.6"S 28°06'21.6"E.
    // Feeds the LocalBusiness schema, the map on /contact, the directions link
    // in the viewing confirmation and the GEO on the calendar invitation, so
    // the coordinates Google is told about and the ones a visitor navigates to
    // are the same point.
    latitude: -25.847111,
    longitude: 28.106,
  },
  /**
   * The owner's own Google Maps pin, short form.
   *
   * Kept alongside the coordinates rather than instead of them: this one is
   * short enough to paste into WhatsApp or read down a phone, while the
   * lat/long drives everything a machine reads.
   */
  mapsLink: "https://maps.app.goo.gl/bwxLfQVs4CZxpNuG9",
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
  /** Finance/lay-bye line, official price list; always pair with "subject to credit approval". */
  finance: "Finance & lay-bye options available, subject to credit approval",
} as const;

/* ------------------------------------------------------------ the showroom */

/** `-25.847111,28.106` — the pin, in the form every Google Maps URL wants. */
export const showroomPin = `${site.geo.latitude},${site.geo.longitude}`;

/**
 * How the showroom is named anywhere a visitor reads it: on the page, in the
 * confirmation email, and as the calendar invitation's LOCATION.
 *
 * A name and a town rather than a street address, because the showroom has no
 * street address to give. The pin does the navigating — every surface that
 * uses this string sits next to `site.mapsLink` or `showroomDirectionsUrl`,
 * and the calendar invitation carries the coordinates in its GEO field.
 */
export const showroomLocation = `${site.showroom.name}, ${site.showroom.city}, ${site.showroom.region}`;

/**
 * The three ways we point someone at the showroom, derived once so the map on
 * /contact, the button on the confirmation screen and the link in the
 * confirmation email can never drift apart.
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
    { slug: "safari-tents", label: "Safari Tents" },
  ],
  pages: [
    { href: "/book-a-viewing", label: "Book a viewing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
