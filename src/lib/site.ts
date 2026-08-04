export const site = {
  name: "Tiny Homes SA",
  legalName: "Tiny Homes (Pty) Ltd",
  tagline: "Innovative Instant Housing Solutions",
  description:
    "High-end prefab tiny homes designed for affordable, sustainable living in South Africa. Folding homes, expandable homes, nature cabins, apple cabins and glamping capsules, plus outdoor kitchens and safari tents, delivered nationwide from Centurion, Gauteng, and across the border into Botswana, Namibia, Zimbabwe and the rest of southern Africa.",
  /** Apex is canonical: www.tinyhomesa.com 301s here, and every indexed URL is on the apex. */
  url: "https://tinyhomesa.com",
  phone: "+27 83 660 3743",
  phoneDisplay: "083 660 3743",
  whatsapp: "https://wa.me/27836603743",
  /** admin@ is the only mailbox confirmed to exist; swap to sales@ once that one is provisioned. */
  email: "admin@tinyhomesa.com",
  address: {
    streetAddress: "187 Gouws Ave",
    locality: "Raslouw AH",
    city: "Centurion",
    region: "Gauteng",
    country: "South Africa",
    countryCode: "ZA",
  },
  geo: {
    // Showroom pin, owner-supplied: 25°50'49.3"S 28°06'22.6"E.
    // Feeds both the LocalBusiness schema and the map embed on /contact, so the
    // coordinates Google is told about and the ones a visitor navigates to are
    // the same point.
    latitude: -25.847028,
    longitude: 28.106278,
  },
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
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
