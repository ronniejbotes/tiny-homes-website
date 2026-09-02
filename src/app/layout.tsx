import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { OrgJsonLd } from "@/components/seo/org-jsonld";
import { site } from "@/lib/site";
import images from "@/data/images.json";

/** Default social share image: the nature cabins hero, our strongest exterior shot. */
const defaultOgImage = images.products["nature-cabins"].find((img) => img.hero);

/**
 * Inherited from the old WordPress site so the GA4 property keeps its full
 * history across the migration; do not mint a new property.
 */
const gaMeasurementId = "G-5R1KHZE03G";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const defaultDescription = `${site.description} ${site.guarantee}, with third-party finance available.`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Tiny Homes SA | Prefab Tiny Homes, Cabins & Glamping Pods South Africa",
    template: "%s | Tiny Homes SA",
  },
  description: defaultDescription,
  keywords: [
    "tiny homes South Africa",
    "prefab homes South Africa",
    "flat pack home South Africa",
    "folding home price",
    "expandable container home",
    "prefab granny flat",
    "nature cabins",
    "glamping pods for sale South Africa",
    "tiny home finance",
    // "Pod" is one more vocabulary the range answers to, appended rather than
    // promoted: the terms above are the ones the seven product pages are built
    // on and they keep their place. /housing-pods is where the pod query is
    // actually answered — this list is a hint, that page is the argument.
    "housing pod for sale",
    "pod house South Africa",
  ],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: site.url,
    siteName: site.name,
    title: "Tiny Homes SA | Prefab Tiny Homes, Cabins & Glamping Pods",
    description: defaultDescription,
    ...(defaultOgImage
      ? {
          images: [
            {
              url: defaultOgImage.src,
              width: defaultOgImage.width,
              height: defaultOgImage.height,
              alt: defaultOgImage.alt,
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiny Homes SA | Prefab Tiny Homes, Cabins & Glamping Pods",
    description: defaultDescription,
    ...(defaultOgImage ? { images: [defaultOgImage.src] } : {}),
  },
  robots: { index: true, follow: true },
};

/** Mobile browser chrome: same forest token as manifest.ts theme_color. */
export const viewport: Viewport = {
  themeColor: "#1e3a2b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-dvh flex flex-col antialiased">
        <OrgJsonLd />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-forest focus:px-4 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <GoogleAnalytics gaId={gaMeasurementId} />
      </body>
    </html>
  );
}
