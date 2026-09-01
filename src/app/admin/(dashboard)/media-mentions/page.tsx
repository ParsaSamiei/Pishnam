import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteMediaMention } from "./actions";

export default async function AdminMediaMentionsPage() {
  const mentions = await prisma.mediaMention.findMany({
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
  });

  return (
    <div>
      <AdminListHeader
        title="پیشنام در رسانه"
        newHref="/admin/media-mentions/new"
        newLabel="افزودن خبر"
      />

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={mentions}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز خبری از رسانه‌ها ثبت نشده است."
          columns={[
            {
              header: "رسانه",
              cell: (row) => (
                <div className="flex items-center gap-3">
                  <div className="border-border bg-bg-surface-alt relative size-9 shrink-0 overflow-hidden rounded-md border">
                    <Image src={row.logo} alt="" fill sizes="36px" className="object-contain p-1" />
                  </div>
                  <span className="font-medium">{row.outletNameFa}</span>
                </div>
              ),
            },
            { header: "عنوان", cell: (row) => row.headlineFa },
            {
              header: "تاریخ انتشار",
              cell: (row) => formatDate(row.publishedAt, "fa"),
              className: "text-text-secondary",
            },
            {
              header: "وضعیت",
              cell: (row) => (row.active ? "فعال" : "غیرفعال"),
              className: "text-text-secondary",
            },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/media-mentions/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.headlineFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteMediaMention.bind(null, row.id)}
                    itemLabel={row.headlineFa}
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
