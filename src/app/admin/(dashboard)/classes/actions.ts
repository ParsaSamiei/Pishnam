"use server";

import type { AdminFormState } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { classSessionSchema } from "@/lib/validation/class-session";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type ClassSessionFormState = AdminFormState;

function revalidateClassPages() {
  revalidatePath("/admin/classes");
  revalidatePath("/classes");
  revalidatePath("/en/classes");
}

export async function createClassSession(
  _prevState: ClassSessionFormState,
  formData: FormData,
): Promise<ClassSessionFormState> {
  await requireAdminSession();

  const parsed = classSessionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.classSession.create({
    data: { ...parsed.data, capacityNote: parsed.data.capacityNote || null },
  });

  revalidateClassPages();
  redirect("/admin/classes");
}

export async function updateClassSession(
  id: string,
  _prevState: ClassSessionFormState,
  formData: FormData,
): Promise<ClassSessionFormState> {
  await requireAdminSession();

  const parsed = classSessionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  await prisma.classSession.update({
    where: { id },
    data: { ...parsed.data, capacityNote: parsed.data.capacityNote || null },
  });

  revalidateClassPages();
  redirect("/admin/classes");
}

export async function deleteClassSession(id: string): Promise<void> {
  await requireAdminSession();
  await prisma.classSession.delete({ where: { id } });
  revalidateClassPages();
}
