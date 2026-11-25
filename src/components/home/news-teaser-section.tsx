import { getLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/lib/i18n/routing";
import { getHomepageCopy } from "@/lib/homepage-content";
import { AnimatedLink } from "@/components/motion/animated-link";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { ArticleCard } from "@/components/blog/article-card";

export async function NewsTeaserSection() {
  const locale = (await getLocale()) as AppLocale;
  const { news: copy } = await getHomepageCopy(locale);
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
    <section data-spine-node className="bg-bg-surface-alt py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <StaggerGroup>
            <StaggerItem variant="heading">
              <h2 className="text-text-primary text-2xl font-bold sm:text-3xl">{copy.title}</h2>
            </StaggerItem>
            <StaggerItem variant="rise">
              <p className="text-text-secondary mt-2">{copy.subtitle}</p>
            </StaggerItem>
          </StaggerGroup>
          <Reveal delay={0.2}>
            <AnimatedLink href="/blog" icon={<ArrowIcon aria-hidden="true" />}>
              {copy.viewAll}
            </AnimatedLink>
          </Reveal>
        </div>

        <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {withTranslation.map(({ article, translation }) => (
            <StaggerItem key={article.id} className="h-full">
              <ArticleCard
                slug={article.slug}
                title={translation.title}
                excerpt={translation.excerpt}
                coverImage={article.coverImage}
                publishedAt={article.publishedAt}
                locale={locale}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
