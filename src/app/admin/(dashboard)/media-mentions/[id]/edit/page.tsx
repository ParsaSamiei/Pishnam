import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MediaMentionForm } from "@/components/admin/media-mention-form";
import { updateMediaMention } from "../../actions";

export default async function EditMediaMentionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mention = await prisma.mediaMention.findUnique({ where: { id } });

  if (!mention) {
    notFound();
  }

  const boundUpdate = updateMediaMention.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/media-mentions"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به پیشنام در رسانه
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش خبر رسانه‌ای</h1>
      <div className="mt-6">
        <MediaMentionForm
          action={boundUpdate}
          defaultValues={mention}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
