export const site = {
  name: "Tiny Homes SA",
  legalName: "Tiny Homes South Africa",
  tagline: "Build your dream tiny home",
  description:
    "High-end prefab tiny homes designed for affordable, sustainable living in South Africa. Folding homes, expandable homes, nature cabins, domes, apple cabins and glamping capsules — delivered nationwide from Centurion, Gauteng.",
  url: "https://www.tinyhomesa.com",
  phone: "+27 83 660 3743",
  phoneDisplay: "083 660 3743",
  whatsapp: "https://wa.me/27836603743",
  email: "admin@tinyhomesa.com",
  address: {
    locality: "Raslouw",
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
    "Delivery across South Africa averages R6 000 – R22 000 per unit, depending on distance, diesel rates and abnormal-load permits.",
} as const;

export const nav = {
  products: [
    { slug: "folding-homes", label: "Folding Homes" },
    { slug: "expandable-homes", label: "Expandable Homes" },
    { slug: "nature-cabins", label: "Nature Cabins" },
    { slug: "the-dome", label: "The Dome" },
    { slug: "apple-cabins", label: "Apple Cabins" },
    { slug: "glamping-capsules", label: "Glamping Capsules" },
  ],
  pages: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
