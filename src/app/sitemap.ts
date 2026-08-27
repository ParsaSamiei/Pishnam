import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { DOWNLOAD_CATEGORIES } from "@/lib/download-categories";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Every static (non-content-driven) public route, as a locale-neutral path.
const STATIC_PATHS = [
  "",
  "/about-us",
  "/about-us/achievements",
  "/about-us/team",
  "/about-us/faq",
  "/courses",
  "/classes",
  "/videos",
  "/downloads",
  "/downloads/software",
  "/downloads/posters",
  "/blog",
  "/sponsors",
  "/schools",
  "/careers",
  "/contact-us",
  "/feedback",
  "/enroll",
  "/privacy",
  "/terms",
];

function buildEntry(path: string, lastModified?: Date): MetadataRoute.Sitemap[number] {
  const normalized = path === "" ? "/" : path;
  return {
    url: `${SITE_URL}${normalized}`,
    lastModified: lastModified ?? new Date(),
    alternates: {
      languages: {
        fa: `${SITE_URL}${normalized}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
  };
}

// Covers both locales per docs/07-seo-guidelines.md ("Auto-generated
// sitemap.xml... covering both locales"). Since URL segments are identical
// between fa/en (only the /en prefix differs, see lib/i18n/routing.ts), each
// entry's own `alternates.languages` communicates the fa/en pair to crawlers
// rather than listing every URL twice as separate top-level entries.
// Generated per request: the queries below need a live database, and the
// image is built in CI where there is none (see the note in
// src/app/[locale]/layout.tsx). It also keeps the sitemap current as content
// is published, rather than frozen at whatever existed on deploy day.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, articles, softwareProducts] = await Promise.all([
    prisma.course.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.article.findMany({
      where: { publishedAt: { lte: new Date() } },
      select: { slug: true, publishedAt: true },
    }),
    prisma.softwareProduct.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map((path) => buildEntry(path)),
    ...DOWNLOAD_CATEGORIES.map((category) => buildEntry(`/downloads/${category.slug}`)),
    ...courses.map((course) => buildEntry(`/courses/${course.slug}`, course.updatedAt)),
    ...articles.map((article) => buildEntry(`/blog/${article.slug}`, article.publishedAt)),
    ...softwareProducts.map((product) =>
      buildEntry(`/downloads/software/${product.slug}`, product.updatedAt),
    ),
  ];

  return entries;
}
