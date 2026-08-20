import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { AdminUserForm } from "@/components/admin/admin-user-form";
import { createAdminUser } from "../actions";

export default async function NewAdminUserPage() {
  const session = await auth();
  if (session?.user.role !== "owner") {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <ShieldAlert className="text-text-secondary size-10" aria-hidden="true" />
        <p className="text-text-primary font-bold">دسترسی محدود</p>
        <p className="text-text-secondary max-w-sm text-sm">
          مدیریت کاربران فقط برای حساب‌های با نقش «مالک» در دسترس است.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به کاربران مدیر
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن کاربر مدیر جدید</h1>
      <p className="text-text-secondary mt-1 max-w-md text-sm">
        رمز عبور را از یک کانال امن (نه ایمیل عادی) به کاربر جدید بدهید.
      </p>
      <div className="mt-6">
        <AdminUserForm action={createAdminUser} />
      </div>
    </div>
  );
}
