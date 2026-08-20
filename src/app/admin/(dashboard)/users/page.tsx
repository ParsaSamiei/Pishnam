import { ShieldAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteAdminUser } from "./actions";

const ROLE_LABELS: Record<string, string> = {
  owner: "مالک",
  editor: "ویرایشگر",
};

export default async function AdminUsersPage() {
  // Page-level check in addition to the sidebar hiding this link for
  // editors (see lib/admin-nav.ts) -- a hidden nav entry is not an access
  // boundary, someone could still navigate here directly by URL.
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

  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <AdminListHeader title="کاربران مدیر" newHref="/admin/users/new" newLabel="افزودن کاربر" />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={users}
          getRowKey={(row) => row.id}
          emptyMessage="کاربری یافت نشد."
          columns={[
            { header: "ایمیل", cell: (row) => <span dir="ltr">{row.email}</span> },
            {
              header: "نقش",
              cell: (row) => (
                <span
                  className={
                    row.role === "owner"
                      ? "bg-pishnam-gold-500/15 text-pishnam-gold-600 rounded-full px-2 py-0.5 text-xs font-semibold"
                      : "bg-bg-surface-alt text-text-secondary rounded-full px-2 py-0.5 text-xs font-semibold"
                  }
                >
                  {ROLE_LABELS[row.role] ?? row.role}
                </span>
              ),
            },
            {
              header: "تاریخ ایجاد",
              cell: (row) => formatDate(row.createdAt, "fa"),
              className: "text-text-secondary",
            },
            {
              header: "",
              className: "w-16 text-end",
              cell: (row) =>
                row.id === session.user.id ? null : (
                  <div className="flex justify-end">
                    <DeleteButton
                      onDelete={deleteAdminUser.bind(null, row.id)}
                      itemLabel={row.email}
                    />
                  </div>
                ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
