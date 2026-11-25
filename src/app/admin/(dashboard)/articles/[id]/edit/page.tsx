import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";
import { updateArticle } from "../../actions";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!article) {
    notFound();
  }

  const fa = article.translations.find((t) => t.locale === "fa");
  const en = article.translations.find((t) => t.locale === "en");
  const boundUpdate = updateArticle.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/articles"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به اخبار
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش مطلب</h1>
      <div className="mt-6">
        <ArticleForm
          action={boundUpdate}
          submitLabel="ذخیره تغییرات"
          defaultValues={{
            slug: article.slug,
            coverImage: article.coverImage,
            tags: article.tags,
            publishedAt: article.publishedAt,
            titleFa: fa?.title ?? "",
            excerptFa: fa?.excerpt ?? "",
            bodyFa: fa?.body ?? "",
            titleEn: en?.title ?? "",
            excerptEn: en?.excerpt ?? "",
            bodyEn: en?.body ?? "",
          }}
        />
      </div>
    </div>
  );
}
