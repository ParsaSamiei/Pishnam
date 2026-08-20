"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminUserSchema } from "@/lib/validation/admin-user";
import { requireOwnerSession, firstErrorPerField } from "@/lib/actions/admin-guard";

export interface AdminUserFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
}

export async function createAdminUser(
  _prevState: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  await requireOwnerSession();

  const parsed = createAdminUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: firstErrorPerField(parsed.error.issues) };
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { status: "error", errors: { email: "این ایمیل قبلاً ثبت شده است." } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.adminUser.create({
    data: { email: parsed.data.email, passwordHash, role: parsed.data.role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteAdminUser(id: string): Promise<{ error?: string }> {
  const session = await requireOwnerSession();

  if (session.user.id === id) {
    return { error: "نمی‌توانید حساب کاربری خودتان را حذف کنید." };
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) {
    return { error: "کاربر یافت نشد." };
  }

  if (target.role === "owner") {
    const ownerCount = await prisma.adminUser.count({ where: { role: "owner" } });
    if (ownerCount <= 1) {
      return { error: "نمی‌توانید تنها مالک باقی‌مانده را حذف کنید." };
    }
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/users");
  return {};
}
