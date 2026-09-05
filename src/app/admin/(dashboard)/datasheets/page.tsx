import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteDatasheetPart } from "./actions";

export default async function AdminDatasheetsPage() {
  const parts = await prisma.datasheetPart.findMany({
    where: { parentId: null },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { children: true } } },
  });

  return (
    <div>
      <AdminListHeader
        title="دیتاشیت و قطعات"
        newHref="/admin/datasheets/new"
        newLabel="افزودن قطعه"
      />
      <p className="text-text-secondary mt-2 text-sm">
        هر قطعه یک صفحه در{" "}
        <span dir="ltr" className="font-mono text-xs">
          /downloads/datasheets
        </span>{" "}
        دارد. قطعه‌هایی مثل LCD می‌توانند زیرقطعه داشته باشند (۱۶×۲، گرافیکی و غیره). ماژول‌های تکی
        مثل SRF05 همان صفحه را با متن، PDF، ویدیو، عکس و نمونه کد پر می‌کنند.
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={parts}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز قطعه‌ای ثبت نشده است."
          columns={[
            {
              header: "تصویر",
              className: "w-20",
              cell: (row) => (
                <div className="border-border bg-bg-surface-alt relative size-12 overflow-hidden rounded-md border">
                  <Image src={row.image} alt="" fill className="object-cover" sizes="48px" />
                </div>
              ),
            },
            {
              header: "عنوان",
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.titleFa}</p>
                  <p className="text-text-secondary text-xs" dir="ltr">
                    /downloads/datasheets/{row.slug}
                  </p>
                </div>
              ),
            },
            {
              header: "زیرقطعه",
              cell: (row) => row._count.children,
              className: "text-text-secondary",
            },
            {
              header: "وضعیت",
              cell: (row) => (
                <span
                  className={
                    row.active
                      ? "bg-pishnam-success/15 text-pishnam-success rounded-full px-2 py-0.5 text-xs font-semibold"
                      : "bg-bg-surface-alt text-text-secondary rounded-full px-2 py-0.5 text-xs font-semibold"
                  }
                >
                  {row.active ? "فعال" : "غیرفعال"}
                </span>
              ),
            },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/datasheets/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteDatasheetPart.bind(null, row.id)}
                    itemLabel={row.titleFa}
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
