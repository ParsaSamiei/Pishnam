import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // smaller production image, see infra/Dockerfile

  // Prisma talks to Neon through PgBouncer with a tiny client pool
  // (see src/lib/prisma.ts). Default static concurrency (8 pages/worker)
  // queues past pool_timeout and fails the build with P2024. Keep this
  // low so each worker serializes DB-backed prerenders; retries cover
  // Neon cold-start blips.
  //
  // Largely vestigial since the self-hosted deploy: no DB-backed route is
  // prerendered any more (see the `dynamic` note in src/app/[locale]/
  // layout.tsx), so this now only governs /robots.txt, the icons and the
  // manifest. Kept because it still applies if a cached, prerendered route
  // is reintroduced.
  experimental: {
    staticGenerationMaxConcurrency: 1,
    staticGenerationRetryCount: 3,
  },

  // Next 16 blocks cross-origin access to /_next/* in dev by default. Opening
  // the site as http://127.0.0.1:3000 while the server binds on localhost (or
  // vice versa) 403s the client chunks -- and the brand cursor never hydrates.
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  images: {
    // Next's Image Optimization is disabled because it can only run on sharp
    // ("The only additional dependency is the `sharp` package, which is
    // required for Image Optimization" -- node_modules/next/dist/docs/01-app/
    // 02-guides/deploying-to-platforms.md), and sharp cannot run on this
    // server: its prebuilt Linux x64 binaries require an x86-64-v2 CPU and
    // this host is older than that. The package is gone (see src/lib/upload.ts,
    // which re-encodes uploads with jimp instead), so there is no optimizer
    // left to call.
    //
    // Leaving optimization on without sharp meant /_next/image quietly
    // returned the untouched original -- a 512px source requested at w=64 came
    // back as the full 22 KB file. Declaring `unoptimized` makes that the
    // documented behaviour rather than an undefined fallback, and stops the
    // server spending CPU on requests it cannot fulfil.
    //
    // next/image still works everywhere it is used: width/height still reserve
    // layout, lazy loading still applies. What is lost is per-viewport
    // resizing, which is mitigated at the source -- uploads are capped at
    // 2400px and re-encoded on the way in.
    unoptimized: true,

    // Kept for the day this runs somewhere sharp works (a newer host, or a
    // CDN in front): re-enabling optimization is then a one-line change and
    // the remote allowlist is still correct. remotePatterns is only consulted
    // by the optimizer, so while `unoptimized` is set the Aparat poster in
    // src/lib/aparat.ts loads directly.
    remotePatterns: [
      { protocol: "https", hostname: "aparat.com" },
      { protocol: "https", hostname: "*.aparat.com" },
    ],
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
