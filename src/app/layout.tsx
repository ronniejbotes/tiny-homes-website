import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { OrgJsonLd } from "@/components/seo/org-jsonld";
import { site } from "@/lib/site";
import images from "@/data/images.json";

/** Default social share image — the nature cabins hero, our strongest exterior shot. */
const defaultOgImage = images.products["nature-cabins"].find((img) => img.hero);

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const defaultDescription = `${site.description} ${site.guarantee}, with finance and lay-bye options available.`;

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
      </body>
    </html>
  );
}
