"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validation/faq";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type FaqFormState = AdminFormState;

function revalidateFaqPages() {
  revalidatePath("/admin/faqs");
  revalidatePath("/about-us/faq");
}

export async function createFaq(
  _prevState: FaqFormState,
  formData: FormData,
): Promise<FaqFormState> {
  await requireAdminSession();

  const parsed = faqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.faq.create({ data: parsed.data });
  revalidateFaqPages();
  redirect("/admin/faqs");
}

export async function updateFaq(
  id: string,
  _prevState: FaqFormState,
  formData: FormData,
): Promise<FaqFormState> {
  await requireAdminSession();

  const parsed = faqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.faq.update({ where: { id }, data: parsed.data });
  revalidateFaqPages();
  redirect("/admin/faqs");
}

export async function deleteFaq(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.faq.delete({ where: { id } });
  revalidateFaqPages();
}
