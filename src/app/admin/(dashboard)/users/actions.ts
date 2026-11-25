"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminUserSchema, setAdminUserDisabledSchema } from "@/lib/validation/admin-user";
import { requireOwnerSession, formErrorFromIssues } from "@/lib/actions/admin-guard";
import { AdminFormState, formActionError } from "@/lib/form-state";

export type AdminUserFormState = AdminFormState;

export async function createAdminUser(
  _prevState: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  await requireOwnerSession();

  const parsed = createAdminUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return formActionError({ email: "این ایمیل قبلاً ثبت شده است." }, formData);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.adminUser.create({
    data: { email: parsed.data.email, passwordHash, role: parsed.data.role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function setAdminUserDisabled(
  id: string,
  disabled: boolean,
): Promise<{ error?: string }> {
  const session = await requireOwnerSession();

  const parsed = setAdminUserDisabledSchema.safeParse({ id, disabled });
  if (!parsed.success) {
    return { error: "درخواست نامعتبر است." };
  }

  if (session.user.id === parsed.data.id) {
    return { error: "نمی‌توانید حساب کاربری خودتان را غیرفعال کنید." };
  }

  const target = await prisma.adminUser.findUnique({ where: { id: parsed.data.id } });
  if (!target) {
    return { error: "کاربر یافت نشد." };
  }

  const alreadyDisabled = Boolean(target.disabledAt);
  if (alreadyDisabled === parsed.data.disabled) {
    revalidatePath("/admin/users");
    return {};
  }

  if (parsed.data.disabled && target.role === "owner") {
    const enabledOwnerCount = await prisma.adminUser.count({
      where: { role: "owner", disabledAt: null },
    });
    if (enabledOwnerCount <= 1) {
      return { error: "نمی‌توانید تنها مالک فعال باقی‌مانده را غیرفعال کنید." };
    }
  }

  await prisma.adminUser.update({
    where: { id: parsed.data.id },
    data: { disabledAt: parsed.data.disabled ? new Date() : null },
  });

  revalidatePath("/admin/users");
  return {};
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

  // Keep at least one enabled owner so account management stays reachable.
  if (target.role === "owner" && !target.disabledAt) {
    const enabledOwnerCount = await prisma.adminUser.count({
      where: { role: "owner", disabledAt: null },
    });
    if (enabledOwnerCount <= 1) {
      return { error: "نمی‌توانید تنها مالک فعال باقی‌مانده را حذف کنید." };
    }
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/users");
  return {};
}
