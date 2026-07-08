import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { OrgJsonLd } from "@/components/seo/org-jsonld";
import { site } from "@/lib/site";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Tiny Homes SA | Prefab Tiny Homes, Cabins & Glamping Pods South Africa",
    template: "%s | Tiny Homes SA",
  },
  description: site.description,
  keywords: [
    "tiny homes South Africa",
    "prefab homes South Africa",
    "folding homes",
    "expandable homes",
    "nature cabins",
    "glamping pods South Africa",
    "tiny house prices",
  ],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: site.url,
    siteName: site.name,
    title: "Tiny Homes SA | Prefab Tiny Homes, Cabins & Glamping Pods",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiny Homes SA | Prefab Tiny Homes, Cabins & Glamping Pods",
    description: site.description,
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
