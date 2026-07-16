import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (typically ~20% smaller than WebP for photographic product
    // shots), falling back to WebP for browsers without AVIF support. Next.js
    // caches both formats it serves, so this only affects bytes sent to the
    // browser — matches the Accept header per-request.
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // Preserve SEO equity from the old WordPress site's URLs.
    return [
      { source: "/thedome", destination: "/the-dome", permanent: true },
      { source: "/about-tiny-homes-sa", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/request-a-call", destination: "/contact", permanent: true },
    ];
  },
};

export default nextConfig;
