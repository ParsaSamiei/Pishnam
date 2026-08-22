"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validation/faq";
import { requireAdminSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface FaqFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
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
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
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
