import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import {
  DOWNLOAD_SECTION_TYPE_LABELS,
  getDownloadSectionIcon,
  resolveDownloadSectionSlug,
} from "@/lib/download-sections";
import { deleteDownloadSection } from "./actions";

export default async function AdminDownloadSectionsPage() {
  const sections = await prisma.downloadSection.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <AdminListHeader
        title="بخش‌های مرکز دانلود"
        newHref="/admin/download-sections/new"
        newLabel="افزودن بخش"
      />
      <p className="text-text-secondary mt-2 text-sm">
        بخش‌هایی که در صفحه مرکز دانلود نمایش داده می‌شوند. می‌توانید عنوان، آیکون، ترتیب و
        فعال‌بودن هر بخش را مدیریت کنید. برای دسته‌بندی جدید، «بخش سفارشی» بسازید و فایل‌هایش را از
        «فایل‌های دانلود» اضافه کنید.
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={sections}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز بخشی ثبت نشده است."
          columns={[
            {
              header: "آیکون",
              className: "w-16",
              cell: (row) => {
                const Icon = getDownloadSectionIcon(row.iconKey);
                return (
                  <div className="bg-pishnam-steel-600/15 text-pishnam-steel-600 flex size-9 items-center justify-center rounded-md">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                );
              },
            },
            {
              header: "عنوان",
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.titleFa}</p>
                  <p className="text-text-secondary text-xs" dir="ltr">
                    /downloads/{resolveDownloadSectionSlug(row)}
                  </p>
                </div>
              ),
            },
            {
              header: "نوع",
              cell: (row) => DOWNLOAD_SECTION_TYPE_LABELS[row.sectionType].fa,
              className: "text-text-secondary",
            },
            {
              header: "ترتیب",
              cell: (row) => row.order,
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
                    href={`/admin/download-sections/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteDownloadSection.bind(null, row.id)}
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
