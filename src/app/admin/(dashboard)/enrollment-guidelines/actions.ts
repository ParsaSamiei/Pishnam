"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { enrollmentGuidelinesSchema } from "@/lib/validation/enrollment-guidelines";
import {
  ENROLLMENT_GUIDELINES_CACHE_TAG,
  ENROLLMENT_GUIDELINES_ID,
} from "@/lib/enrollment-guidelines.shared";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type EnrollmentGuidelinesFormState = AdminFormState;

function revalidateEnrollmentGuidelinesPages() {
  updateTag(ENROLLMENT_GUIDELINES_CACHE_TAG);
  revalidatePath("/admin/enrollment-guidelines");
  revalidatePath("/enroll");
  revalidatePath("/en/enroll");
  revalidatePath("/classes");
  revalidatePath("/en/classes");
  revalidatePath("/[locale]/enroll", "page");
  revalidatePath("/[locale]/classes", "page");
}

export async function updateEnrollmentGuidelines(
  _prevState: EnrollmentGuidelinesFormState,
  formData: FormData,
): Promise<EnrollmentGuidelinesFormState> {
  await requireAdminSession();

  const parsed = enrollmentGuidelinesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.enrollmentGuidelines.upsert({
    where: { id: ENROLLMENT_GUIDELINES_ID },
    create: { id: ENROLLMENT_GUIDELINES_ID, ...parsed.data },
    update: parsed.data,
  });

  revalidateEnrollmentGuidelinesPages();
  redirect("/admin/enrollment-guidelines?saved=1");
}
