"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validation/article";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface ArticleFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

function revalidateArticlePages(slug?: string) {
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
  revalidatePath("/en/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/en/blog/${slug}`);
  }
  revalidatePath("/");
  revalidatePath("/en");
}

export async function createArticle(
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdminSession();

  const parsed = articleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const { titleFa, excerptFa, bodyFa, titleEn, excerptEn, bodyEn, publishedAt, ...articleFields } =
    parsed.data;

  const slugTaken = await prisma.article.findUnique({ where: { slug: articleFields.slug } });
  if (slugTaken) {
    return { status: "error", errors: { slug: "این نامک قبلاً استفاده شده است." } };
  }

  await prisma.article.create({
    data: {
      ...articleFields,
      publishedAt: new Date(publishedAt),
      translations: {
        create: [
          { locale: "fa", title: titleFa, excerpt: excerptFa, body: bodyFa },
          { locale: "en", title: titleEn, excerpt: excerptEn, body: bodyEn },
        ],
      },
    },
  });

  revalidateArticlePages(articleFields.slug);
  redirect("/admin/articles");
}

export async function updateArticle(
  id: string,
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdminSession();

  const parsed = articleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const { titleFa, excerptFa, bodyFa, titleEn, excerptEn, bodyEn, publishedAt, ...articleFields } =
    parsed.data;

  const slugOwner = await prisma.article.findUnique({ where: { slug: articleFields.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return { status: "error", errors: { slug: "این نامک قبلاً استفاده شده است." } };
  }

  await prisma.article.update({
    where: { id },
    data: {
      ...articleFields,
      publishedAt: new Date(publishedAt),
      translations: {
        upsert: [
          {
            where: { articleId_locale: { articleId: id, locale: "fa" } },
            create: { locale: "fa", title: titleFa, excerpt: excerptFa, body: bodyFa },
            update: { title: titleFa, excerpt: excerptFa, body: bodyFa },
          },
          {
            where: { articleId_locale: { articleId: id, locale: "en" } },
            create: { locale: "en", title: titleEn, excerpt: excerptEn, body: bodyEn },
            update: { title: titleEn, excerpt: excerptEn, body: bodyEn },
          },
        ],
      },
    },
  });

  revalidateArticlePages(articleFields.slug);
  redirect("/admin/articles");
}

export async function deleteArticle(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.article.delete({ where: { id } });
  revalidateArticlePages();
}
