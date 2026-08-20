"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { jobPostingSchema } from "@/lib/validation/job-posting";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface JobPostingFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

function revalidateJobPages() {
  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
}

export async function createJobPosting(
  _prevState: JobPostingFormState,
  formData: FormData,
): Promise<JobPostingFormState> {
  await requireAdminSession();

  const parsed = jobPostingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  await prisma.jobPosting.create({ data: parsed.data });
  revalidateJobPages();
  redirect("/admin/jobs");
}

export async function updateJobPosting(
  id: string,
  _prevState: JobPostingFormState,
  formData: FormData,
): Promise<JobPostingFormState> {
  await requireAdminSession();

  const parsed = jobPostingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  await prisma.jobPosting.update({ where: { id }, data: parsed.data });
  revalidateJobPages();
  redirect("/admin/jobs");
}

export async function deleteJobPosting(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.jobPosting.delete({ where: { id } });
  revalidateJobPages();
}
