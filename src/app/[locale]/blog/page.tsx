import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/lib/i18n/routing";
import { PageHeader } from "@/components/layout/page-header";
import { ArticleCard } from "@/components/blog/article-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates("/blog"),
    title: locale === "fa" ? "اخبار و مجله" : "News & Magazine",
    description:
      locale === "fa"
        ? "تازه‌ترین خبرها و یادداشت‌های آموزشی پیشنام."
        : "The latest news and educational notes from Pishnam.",
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;
  const isFa = locale === "fa";

  const articles = await prisma.article.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    include: { translations: { where: { locale: appLocale } } },
  });

  const withTranslation = articles
    .map((article) => ({ article, translation: article.translations[0] }))
    .filter(
      (
        a,
      ): a is {
        article: (typeof articles)[number];
        translation: NonNullable<(typeof articles)[number]["translations"][number]>;
      } => Boolean(a.translation),
    );

  return (
    <>
      <PageHeader
        title={isFa ? "اخبار و مجله" : "News & Magazine"}
        subtitle={
          isFa
            ? "تازه‌ترین خبرها و یادداشت‌های آموزشی پیشنام."
            : "The latest news and educational notes from Pishnam."
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {withTranslation.length === 0 ? (
          <p className="text-text-secondary text-center">
            {isFa ? "هنوز مطلبی منتشر نشده است." : "No articles published yet."}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {withTranslation.map(({ article, translation }) => (
              <ArticleCard
                key={article.id}
                slug={article.slug}
                title={translation.title}
                excerpt={translation.excerpt}
                coverImage={article.coverImage}
                publishedAt={article.publishedAt}
                locale={appLocale}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
