import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobPostingForm } from "@/components/admin/job-posting-form";
import { updateJobPosting } from "../../actions";

export default async function EditJobPostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.jobPosting.findUnique({ where: { id } });

  if (!job) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/jobs"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به فرصت‌های شغلی
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">ویرایش فرصت شغلی</h1>
      <div className="mt-6">
        <JobPostingForm
          action={updateJobPosting.bind(null, id)}
          defaultValues={job}
          submitLabel="ذخیره تغییرات"
        />
      </div>
    </div>
  );
}
