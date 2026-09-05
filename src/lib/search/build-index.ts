import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENT_SCOPE_LABELS, type AchievementScopeValue } from "@/lib/achievement-scope";
import { datasheetPublicPath } from "@/lib/datasheet-parts";
import { resolveDownloadSectionSlug } from "@/lib/download-sections";
import { formatWeekday } from "@/lib/format";
import type { AppLocale } from "@/lib/i18n/routing";
import { TIER_LABELS, type TierValue } from "@/lib/tier-labels";
import { SEARCH_PAGES } from "./pages";
import type { SearchHit, SearchKind } from "./types";

function localized(
  fa: string | null | undefined,
  en: string | null | undefined,
  locale: AppLocale,
): string {
  const primary = locale === "fa" ? fa : en;
  const fallback = locale === "fa" ? en : fa;
  return primary?.trim() || fallback?.trim() || "";
}

function keywords(...parts: Array<string | null | undefined | string[]>): string {
  return parts
    .flat()
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ");
}

function hit(kind: SearchKind, id: string, fields: Omit<SearchHit, "id" | "kind">): SearchHit {
  return { kind, id, ...fields };
}

function translationPair<T extends { locale: string }>(
  rows: T[],
  pick: (row: T) => string,
): { fa: string; en: string } {
  const fa = rows.find((row) => row.locale === "fa");
  const en = rows.find((row) => row.locale === "en");
  return { fa: fa ? pick(fa) : "", en: en ? pick(en) : "" };
}

function downloadCategoryHref(
  category: "DATASHEETS" | "BOOKS" | "COMPONENT_LIBRARIES" | null,
): string {
  switch (category) {
    case "BOOKS":
      return "/downloads/books";
    case "COMPONENT_LIBRARIES":
      return "/downloads/component-libraries";
    case "DATASHEETS":
      return "/downloads/datasheets";
    default:
      return "/downloads";
  }
}

export async function buildSearchIndex(locale: AppLocale): Promise<SearchHit[]> {
  const now = new Date();
  const [
    courses,
    sessions,
    software,
    datasheets,
    downloadSections,
    resources,
    posters,
    videos,
    articles,
    team,
    achievements,
    faqs,
    jobs,
    mentions,
    gallery,
  ] = await Promise.all([
    prisma.course.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { translations: true },
    }),
    prisma.classSession.findMany({
      where: { active: true },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      include: { course: { include: { translations: true } } },
    }),
    prisma.softwareProduct.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { releases: { select: { platform: true, versionLabel: true } } },
    }),
    prisma.datasheetPart.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        parent: { select: { slug: true, titleFa: true, titleEn: true } },
        documents: { where: { active: true }, select: { titleFa: true, titleEn: true } },
      },
    }),
    prisma.downloadSection.findMany({
      where: { active: true, sectionType: "CUSTOM" },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.downloadResource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        section: { select: { slug: true, sectionType: true, titleFa: true, titleEn: true } },
      },
    }),
    prisma.competitionPoster.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        category: {
          select: {
            titleFa: true,
            titleEn: true,
            league: {
              select: {
                slug: true,
                titleFa: true,
                titleEn: true,
                competition: { select: { slug: true, titleFa: true, titleEn: true } },
              },
            },
          },
        },
      },
    }),
    prisma.videoEntry.findMany({
      where: { publishedAt: { lte: now } },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.article.findMany({
      where: { publishedAt: { lte: now } },
      orderBy: { publishedAt: "desc" },
      include: { translations: true },
    }),
    prisma.teamMember.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    }),
    prisma.achievement.findMany({
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    }),
    prisma.faq.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    }),
    prisma.jobPosting.findMany({
      where: {
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mediaMention.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
    }),
    prisma.galleryImage.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const hits: SearchHit[] = [];

  for (const page of SEARCH_PAGES) {
    hits.push(
      hit("page", `page:${page.href}`, {
        title: localized(page.titleFa, page.titleEn, locale),
        subtitle: null,
        href: page.href,
        image: null,
        keywords: keywords(page.titleFa, page.titleEn, page.keywords),
      }),
    );
  }

  for (const section of downloadSections) {
    const href = `/downloads/${resolveDownloadSectionSlug(section)}`;
    hits.push(
      hit("page", `section:${section.id}`, {
        title: localized(section.titleFa, section.titleEn, locale),
        subtitle: locale === "fa" ? "مرکز دانلود" : "Downloads",
        href,
        image: null,
        keywords: keywords(section.titleFa, section.titleEn, section.slug),
      }),
    );
  }

  for (const course of courses) {
    const titles = translationPair(course.translations, (row) => row.title);
    const excerpts = translationPair(course.translations, (row) => row.excerpt);
    hits.push(
      hit("course", `course:${course.id}`, {
        title: localized(titles.fa, titles.en, locale),
        subtitle: TIER_LABELS[locale][course.tier as TierValue],
        href: `/courses/${course.slug}`,
        image: course.coverImage || null,
        keywords: keywords(
          titles.fa,
          titles.en,
          excerpts.fa,
          excerpts.en,
          course.slug,
          course.topicTags,
          TIER_LABELS.fa[course.tier as TierValue],
          TIER_LABELS.en[course.tier as TierValue],
        ),
      }),
    );
  }

  for (const session of sessions) {
    const titles = translationPair(session.course.translations, (row) => row.title);
    const courseTitle = localized(titles.fa, titles.en, locale);
    const day = formatWeekday(session.weekday, locale);
    hits.push(
      hit("class", `class:${session.id}`, {
        title: courseTitle,
        subtitle: `${day} · ${session.startTime}–${session.endTime}`,
        href: "/classes",
        image: session.course.coverImage || null,
        keywords: keywords(
          titles.fa,
          titles.en,
          session.location,
          session.capacityNote,
          formatWeekday(session.weekday, "fa"),
          formatWeekday(session.weekday, "en"),
        ),
      }),
    );
  }

  for (const product of software) {
    hits.push(
      hit("software", `software:${product.id}`, {
        title: localized(product.titleFa, product.titleEn, locale),
        subtitle: locale === "fa" ? "نرم‌افزار" : "Software",
        href: `/downloads/software/${product.slug}`,
        image: product.image || null,
        keywords: keywords(
          product.titleFa,
          product.titleEn,
          product.descriptionFa,
          product.descriptionEn,
          product.slug,
          ...product.releases.flatMap((release) => [release.platform, release.versionLabel]),
        ),
      }),
    );
  }

  for (const part of datasheets) {
    const parentTitle = part.parent
      ? localized(part.parent.titleFa, part.parent.titleEn, locale)
      : null;
    hits.push(
      hit("datasheet", `datasheet:${part.id}`, {
        title: localized(part.titleFa, part.titleEn, locale),
        subtitle: parentTitle,
        href: datasheetPublicPath(part),
        image: part.image || null,
        keywords: keywords(
          part.titleFa,
          part.titleEn,
          part.excerptFa,
          part.excerptEn,
          part.slug,
          part.parent?.titleFa,
          part.parent?.titleEn,
          part.parent?.slug,
          ...part.documents.flatMap((doc) => [doc.titleFa, doc.titleEn]),
        ),
      }),
    );
  }

  for (const resource of resources) {
    const sectionHref = resource.section
      ? `/downloads/${resolveDownloadSectionSlug(resource.section)}`
      : downloadCategoryHref(resource.category);
    const sectionTitle = resource.section
      ? localized(resource.section.titleFa, resource.section.titleEn, locale)
      : null;
    hits.push(
      hit("download", `download:${resource.id}`, {
        title: localized(resource.titleFa, resource.titleEn, locale),
        subtitle: sectionTitle,
        href: sectionHref,
        image: null,
        keywords: keywords(
          resource.titleFa,
          resource.titleEn,
          resource.descriptionFa,
          resource.descriptionEn,
          resource.cadTool,
          resource.category,
        ),
      }),
    );
  }

  for (const poster of posters) {
    const competition = poster.category.league.competition;
    const league = poster.category.league;
    hits.push(
      hit("poster", `poster:${poster.id}`, {
        title: localized(poster.titleFa, poster.titleEn, locale),
        subtitle: `${localized(competition.titleFa, competition.titleEn, locale)} · ${localized(league.titleFa, league.titleEn, locale)}`,
        href: `/downloads/posters?competition=${encodeURIComponent(competition.slug)}&league=${encodeURIComponent(league.slug)}`,
        image: poster.previewImage || null,
        keywords: keywords(
          poster.titleFa,
          poster.titleEn,
          poster.descriptionFa,
          poster.descriptionEn,
          competition.titleFa,
          competition.titleEn,
          league.titleFa,
          league.titleEn,
          poster.category.titleFa,
          poster.category.titleEn,
        ),
      }),
    );
  }

  for (const video of videos) {
    const tierLabels = video.tierTags.flatMap((tier) => [
      TIER_LABELS.fa[tier as TierValue],
      TIER_LABELS.en[tier as TierValue],
    ]);
    hits.push(
      hit("video", `video:${video.id}`, {
        title: localized(video.titleFa, video.titleEn, locale),
        subtitle: locale === "fa" ? "ویدیو" : "Video",
        href: "/videos",
        image: video.thumbnail || null,
        keywords: keywords(video.titleFa, video.titleEn, video.topicTags, ...tierLabels),
      }),
    );
  }

  for (const article of articles) {
    const titles = translationPair(article.translations, (row) => row.title);
    const excerpts = translationPair(article.translations, (row) => row.excerpt);
    hits.push(
      hit("article", `article:${article.id}`, {
        title: localized(titles.fa, titles.en, locale),
        subtitle: locale === "fa" ? "اخبار" : "News",
        href: `/blog/${article.slug}`,
        image: article.coverImage || null,
        keywords: keywords(
          titles.fa,
          titles.en,
          excerpts.fa,
          excerpts.en,
          article.slug,
          article.tags,
        ),
      }),
    );
  }

  for (const member of team) {
    hits.push(
      hit("team", `team:${member.id}`, {
        title: localized(member.nameFa, member.nameEn, locale),
        subtitle: localized(member.roleFa, member.roleEn, locale) || null,
        href: "/about-us/team",
        image: member.photo || null,
        keywords: keywords(
          member.nameFa,
          member.nameEn,
          member.roleFa,
          member.roleEn,
          member.bioFa,
          member.bioEn,
        ),
      }),
    );
  }

  for (const achievement of achievements) {
    const scope = ACHIEVEMENT_SCOPE_LABELS[locale][achievement.scope as AchievementScopeValue];
    hits.push(
      hit("achievement", `achievement:${achievement.id}`, {
        title: localized(achievement.titleFa, achievement.titleEn, locale),
        subtitle: `${achievement.competition} · ${achievement.year} · ${scope}`,
        href: "/about-us/achievements",
        image: achievement.photo || null,
        keywords: keywords(
          achievement.titleFa,
          achievement.titleEn,
          achievement.competition,
          achievement.result,
          String(achievement.year),
          ACHIEVEMENT_SCOPE_LABELS.fa[achievement.scope as AchievementScopeValue],
          ACHIEVEMENT_SCOPE_LABELS.en[achievement.scope as AchievementScopeValue],
        ),
      }),
    );
  }

  for (const faq of faqs) {
    hits.push(
      hit("faq", `faq:${faq.id}`, {
        title: localized(faq.questionFa, faq.questionEn, locale),
        subtitle: faq.category || null,
        href: `/about-us/faq#faq-${faq.id}`,
        image: null,
        keywords: keywords(
          faq.questionFa,
          faq.questionEn,
          faq.answerFa,
          faq.answerEn,
          faq.category,
        ),
      }),
    );
  }

  for (const job of jobs) {
    hits.push(
      hit("job", `job:${job.id}`, {
        title: localized(job.titleFa, job.titleEn, locale),
        subtitle: locale === "fa" ? "فرصت شغلی" : "Open position",
        href: `/careers#job-${job.id}`,
        image: null,
        keywords: keywords(job.titleFa, job.titleEn, job.descriptionFa, job.descriptionEn),
      }),
    );
  }

  for (const mention of mentions) {
    hits.push(
      hit("press", `press:${mention.id}`, {
        title: localized(mention.headlineFa, mention.headlineEn, locale),
        subtitle: localized(mention.outletNameFa, mention.outletNameEn, locale) || null,
        href: mention.url,
        image: mention.logo || null,
        external: true,
        keywords: keywords(
          mention.headlineFa,
          mention.headlineEn,
          mention.outletNameFa,
          mention.outletNameEn,
        ),
      }),
    );
  }

  for (const item of gallery) {
    const title =
      localized(item.captionFa, item.captionEn, locale) ||
      localized(item.altFa, item.altEn, locale);
    if (!title) continue;
    hits.push(
      hit("gallery", `gallery:${item.id}`, {
        title,
        subtitle: locale === "fa" ? "گالری" : "Gallery",
        href: "/gallery",
        image: item.image || null,
        keywords: keywords(item.captionFa, item.captionEn, item.altFa, item.altEn),
      }),
    );
  }

  return hits;
}

export function getCachedSearchIndex(locale: AppLocale): Promise<SearchHit[]> {
  return unstable_cache(() => buildSearchIndex(locale), ["site-search-index", locale], {
    revalidate: 60,
  })();
}
