import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { DOWNLOAD_CATEGORIES } from "@/lib/download-categories";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Every static (non-content-driven) public route, as a locale-neutral path.
const STATIC_PATHS = [
  "",
  "/about",
  "/about/achievements",
  "/about/team",
  "/about/faq",
  "/courses",
  "/classes",
  "/videos",
  "/downloads",
  "/blog",
  "/sponsors",
  "/schools",
  "/careers",
  "/contact",
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
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, articles] = await Promise.all([
    prisma.course.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.article.findMany({
      where: { publishedAt: { lte: new Date() } },
      select: { slug: true, publishedAt: true },
    }),
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map((path) => buildEntry(path)),
    ...DOWNLOAD_CATEGORIES.map((category) => buildEntry(`/downloads/${category.slug}`)),
    ...courses.map((course) => buildEntry(`/courses/${course.slug}`, course.updatedAt)),
    ...articles.map((article) => buildEntry(`/blog/${article.slug}`, article.publishedAt)),
  ];

  return entries;
}
