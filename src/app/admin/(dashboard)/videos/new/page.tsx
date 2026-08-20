import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VideoEntryForm } from "@/components/admin/video-entry-form";
import { createVideoEntry } from "../actions";

export default function NewVideoPage() {
  return (
    <div>
      <Link
        href="/admin/videos"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به ویدیوها
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن ویدیوی جدید</h1>
      <div className="mt-6">
        <VideoEntryForm action={createVideoEntry} submitLabel="ثبت ویدیو" />
      </div>
    </div>
  );
}
