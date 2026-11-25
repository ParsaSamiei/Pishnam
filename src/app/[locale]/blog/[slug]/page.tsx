import type { Metadata } from "next";
import { buildAlternates } from "@/lib/i18n/alternates";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/lib/i18n/routing";
import { formatDate } from "@/lib/format";
import { RichText } from "@/components/rich-text";
import { JsonLd } from "@/components/json-ld";

async function getArticle(slug: string, locale: AppLocale) {
  return prisma.article.findUnique({
    where: { slug, publishedAt: { lte: new Date() } },
    include: { translations: { where: { locale } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(slug, locale as AppLocale);
  const translation = article?.translations[0];
  if (!translation) return {};

  return {
    alternates: buildAlternates(`/blog/${slug}`),
    title: translation.title,
    description: translation.excerpt,
    openGraph: {
      type: "article",
      title: translation.title,
      description: translation.excerpt,
      publishedTime: article?.publishedAt.toISOString(),
      images: article?.coverImage ? [{ url: article.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: translation.title,
      description: translation.excerpt,
      images: article?.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const article = await getArticle(slug, appLocale);
  const translation = article?.translations[0];

  if (!article || !translation) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: translation.title,
          description: translation.excerpt,
          image: article.coverImage,
          datePublished: article.publishedAt.toISOString(),
        }}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <time dateTime={article.publishedAt.toISOString()} className="text-text-secondary text-sm">
          {formatDate(article.publishedAt, appLocale)}
        </time>
        <h1 className="text-text-primary mt-2 text-2xl font-extrabold sm:text-3xl">
          {translation.title}
        </h1>

        {article.coverImage && (
          <div className="bg-bg-surface-alt relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image
              src={article.coverImage}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 768px, 100vw"
              priority
            />
          </div>
        )}

        <div className="mt-8">
          <RichText html={translation.body} />
        </div>

        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-bg-surface-alt text-text-secondary rounded-full px-3 py-1 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
