export const site = {
  name: "Tiny Homes SA",
  legalName: "Tiny Homes (Pty) Ltd",
  tagline: "Innovative Instant Housing Solutions",
  description:
    "High-end prefab tiny homes designed for affordable, sustainable living in South Africa. Folding homes, expandable homes, nature cabins, domes, apple cabins and glamping capsules — plus outdoor kitchens, DIY garages and safari tents — delivered nationwide from Centurion, Gauteng.",
  url: "https://www.tinyhomesa.com",
  phone: "+27 83 660 3743",
  phoneDisplay: "083 660 3743",
  whatsapp: "https://wa.me/27836603743",
  email: "sales@tinyhomesa.com",
  address: {
    streetAddress: "187 Gouws Ave",
    locality: "Raslouw AH",
    city: "Centurion",
    region: "Gauteng",
    country: "South Africa",
    countryCode: "ZA",
  },
  geo: {
    // Raslouw, Centurion
    latitude: -25.8546,
    longitude: 28.1064,
  },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61587151281004",
    instagram: "https://www.instagram.com/tinyhomes.sa/",
  },
  leadTimeDays: 90,
  deliveryNote:
    "Delivery is quoted separately based on your location and site accessibility — we deliver nationwide.",
  /** 10-year guarantee, sales deck slide 11 — quote verbatim across features/about/FAQ. */
  guarantee: "10-year guarantee on all our products",
  /** Finance/lay-bye line, official price list — always pair with "subject to credit approval". */
  finance: "Finance & lay-bye options available, subject to credit approval",
} as const;

export const nav = {
  products: [
    { slug: "folding-homes", label: "Folding Homes" },
    { slug: "expandable-homes", label: "Expandable Homes" },
    { slug: "nature-cabins", label: "Nature Cabins" },
    { slug: "the-dome", label: "The Dome" },
    { slug: "apple-cabins", label: "Apple Cabins" },
    { slug: "glamping-capsules", label: "Glamping Capsules" },
    { slug: "outdoor-kitchens", label: "Outdoor Kitchens" },
    { slug: "garages", label: "Garages" },
    { slug: "safari-tents", label: "Safari Tents" },
  ],
  pages: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
