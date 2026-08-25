import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deletePosterCategory } from "./actions";

export default async function AdminPosterCategoriesPage() {
  const categories = await prisma.posterCategory.findMany({
    orderBy: [{ leagueId: "asc" }, { order: "asc" }],
    include: {
      league: { include: { competition: true } },
      _count: { select: { posters: true } },
    },
  });

  return (
    <div>
      <AdminListHeader
        title="دسته‌بندی پوستر"
        newHref="/admin/poster-categories/new"
        newLabel="افزودن دسته"
      />
      <p className="text-text-secondary mt-2 text-sm">
        دسته‌بندی‌ها زیر هر لیگ جداگانه‌اند (مثلاً قوانین، نقشه زمین). پوسترها را از بخش{" "}
        <Link href="/admin/posters" className="text-pishnam-gold-600 underline">
          پوسترها
        </Link>{" "}
        به این دسته‌ها وصل کنید.
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={categories}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز دسته‌بندی ثبت نشده است."
          columns={[
            {
              header: "مسابقه / لیگ",
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.league.competition.titleFa}</p>
                  <p className="text-text-secondary text-xs">{row.league.titleFa}</p>
                </div>
              ),
            },
            {
              header: "دسته",
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.titleFa}</p>
                  <p className="text-text-secondary text-xs" dir="ltr">
                    {row.slug}
                  </p>
                </div>
              ),
            },
            {
              header: "پوسترها",
              cell: (row) => row._count.posters,
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
                    href={`/admin/poster-categories/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.titleFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deletePosterCategory.bind(null, row.id)}
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
