import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFileSize } from "@/lib/format";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteCompetitionPoster } from "./actions";

export default async function AdminPostersPage() {
  const posters = await prisma.competitionPoster.findMany({
    orderBy: [{ categoryId: "asc" }, { order: "asc" }],
    include: {
      category: {
        include: {
          league: { include: { competition: true } },
        },
      },
    },
  });

  return (
    <div>
      <AdminListHeader title="پوسترها" newHref="/admin/posters/new" newLabel="افزودن پوستر" />
      <p className="text-text-secondary mt-2 text-sm">
        هر پوستر متعلق به یک دسته‌بندی زیر یک لیگ از یک مسابقه است. ترتیب ساخت:{" "}
        <Link href="/admin/competitions" className="text-pishnam-gold-600 underline">
          مسابقه
        </Link>
        {" → "}
        <Link href="/admin/leagues" className="text-pishnam-gold-600 underline">
          لیگ
        </Link>
        {" → "}
        <Link href="/admin/poster-categories" className="text-pishnam-gold-600 underline">
          دسته
        </Link>
        {" → پوستر."}
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={posters}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز پوستری ثبت نشده است."
          columns={[
            {
              header: "پیش‌نمایش",
              className: "w-20",
              cell: (row) => (
                <div className="border-border bg-bg-surface-alt relative size-12 overflow-hidden rounded-md border">
                  <Image src={row.previewImage} alt="" fill className="object-cover" sizes="48px" />
                </div>
              ),
            },
            {
              header: "عنوان",
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.titleFa}</p>
                  <p className="text-text-secondary text-xs">
                    {row.category.league.competition.titleFa} · {row.category.league.titleFa} ·{" "}
                    {row.category.titleFa}
                  </p>
                </div>
              ),
            },
            {
              header: "نوع",
              cell: (row) => (row.source === "HOSTED" ? "فایل آپلودی" : "لینک خارجی"),
              className: "text-text-secondary",
            },
            {
              header: "حجم",
              cell: (row) => (row.source === "HOSTED" ? formatFileSize(row.fileSizeBytes) : "—"),
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
                    href={`/admin/posters/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteCompetitionPoster.bind(null, row.id)}
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
