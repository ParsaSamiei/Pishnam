import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // smaller production image, see infra/Dockerfile

  images: {
    // Uploaded media is served from our own /uploads route (local disk, see
    // 05-frontend-architecture.md). No external remote patterns are enabled by
    // default -- add explicit entries here only if a real external image host
    // is introduced later.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
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
