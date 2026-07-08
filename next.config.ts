import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
