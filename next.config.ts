import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // smaller production image, see infra/Dockerfile

  images: {
    // Uploaded media is served from our own /uploads route (local disk, see
    // 05-frontend-architecture.md). Aparat's own domain is whitelisted so
    // the auto-fetched video poster (see src/lib/aparat.ts,
    // fetchAparatPoster) can render via next/image -- add further remote
    // hosts here only if another real external image source is introduced.
    remotePatterns: [
      { protocol: "https", hostname: "aparat.com" },
      { protocol: "https", hostname: "*.aparat.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async redirects() {
    return [
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/en/about", destination: "/en/about-us", permanent: true },
      { source: "/about/:path*", destination: "/about-us/:path*", permanent: true },
      { source: "/en/about/:path*", destination: "/en/about-us/:path*", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
      { source: "/en/contact", destination: "/en/contact-us", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // Applies to every route.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Uploaded files: served as static assets, never executed, with a
        // locked-down content type. See "Upload security" in
        // 05-frontend-architecture.md.
        source: "/uploads/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Disposition", value: "inline" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
