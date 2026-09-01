import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaMentionForm } from "@/components/admin/media-mention-form";
import { createMediaMention } from "../actions";

export default function NewMediaMentionPage() {
  return (
    <div>
      <Link
        href="/admin/media-mentions"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به پیشنام در رسانه
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن خبر رسانه‌ای</h1>
      <div className="mt-6">
        <MediaMentionForm action={createMediaMention} submitLabel="ثبت خبر" />
      </div>
    </div>
  );
}
