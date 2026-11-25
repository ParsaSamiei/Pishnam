import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteArticle } from "./actions";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    include: { translations: { where: { locale: "fa" } } },
  });

  return (
    <div>
      <AdminListHeader title="اخبار" newHref="/admin/articles/new" newLabel="افزودن مطلب" />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={articles}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز مطلبی ثبت نشده است."
          columns={[
            {
              header: "عنوان",
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.translations[0]?.title}</p>
                  <p className="text-text-secondary text-xs" dir="ltr">
                    /{row.slug}
                  </p>
                </div>
              ),
            },
            {
              header: "تاریخ انتشار",
              cell: (row) => formatDate(row.publishedAt, "fa"),
              className: "text-text-secondary",
            },
            {
              header: "وضعیت",
              cell: (row) =>
                row.publishedAt <= new Date() ? (
                  <span className="bg-pishnam-success/15 text-pishnam-success rounded-full px-2 py-0.5 text-xs font-semibold">
                    منتشرشده
                  </span>
                ) : (
                  <span className="bg-pishnam-gold-500/15 text-pishnam-gold-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                    زمان‌بندی‌شده
                  </span>
                ),
            },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/articles/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.translations[0]?.title}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteArticle.bind(null, row.id)}
                    itemLabel={row.translations[0]?.title ?? row.slug}
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
