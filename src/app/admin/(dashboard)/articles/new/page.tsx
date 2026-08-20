import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleForm } from "@/components/admin/article-form";
import { createArticle } from "../actions";

export default function NewArticlePage() {
  return (
    <div>
      <Link
        href="/admin/articles"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به اخبار
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن مطلب جدید</h1>
      <div className="mt-6">
        <ArticleForm action={createArticle} submitLabel="ثبت مطلب" />
      </div>
    </div>
  );
}
