import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/blog/article-card";

export async function NewsTeaserSection() {
  const t = await getTranslations("home.news");
  const locale = (await getLocale()) as AppLocale;
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  const articles = await prisma.article.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      translations: { where: { locale } },
    },
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

  if (withTranslation.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{t("title")}</h2>
          <p className="text-text-secondary mt-2">{t("subtitle")}</p>
        </div>
        <Button asChild variant="link" className="gap-1.5">
          <Link href="/blog">
            {t("viewAll")}
            <ArrowIcon className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {withTranslation.map(({ article, translation }) => (
          <ArticleCard
            key={article.id}
            slug={article.slug}
            title={translation.title}
            excerpt={translation.excerpt}
            coverImage={article.coverImage}
            publishedAt={article.publishedAt}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
