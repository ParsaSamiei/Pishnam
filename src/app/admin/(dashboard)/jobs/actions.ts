"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { jobPostingSchema } from "@/lib/validation/job-posting";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type JobPostingFormState = AdminFormState;

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
    return formErrorFromIssues(parsed.error.issues, formData);
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
    return formErrorFromIssues(parsed.error.issues, formData);
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
