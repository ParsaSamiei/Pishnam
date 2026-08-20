import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VideoEntryForm } from "@/components/admin/video-entry-form";
import { updateVideoEntry } from "../../actions";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.videoEntry.findUnique({ where: { id } });

  if (!video) {
    notFound();
  }

  const boundUpdate = updateVideoEntry.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/videos"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به ویدیوها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش ویدیو</h1>
      <div className="mt-6">
        <VideoEntryForm action={boundUpdate} submitLabel="ذخیره تغییرات" defaultValues={video} />
      </div>
    </div>
  );
}
