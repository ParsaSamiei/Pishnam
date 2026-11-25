import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JobPostingForm } from "@/components/admin/job-posting-form";
import { createJobPosting } from "../actions";

export default function NewJobPostingPage() {
  return (
    <div>
      <Link
        href="/admin/jobs"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به فرصت‌های شغلی
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن فرصت شغلی</h1>
      <div className="mt-6">
        <JobPostingForm action={createJobPosting} submitLabel="ثبت فرصت شغلی" />
      </div>
    </div>
  );
}
