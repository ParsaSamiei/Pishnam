import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteTeamTag } from "./actions";

export default async function AdminTeamTagsPage() {
  const tags = await prisma.teamTag.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { members: true } } },
  });

  return (
    <div>
      <AdminListHeader
        title="دسته‌بندی پرسنل"
        newHref="/admin/team-tags/new"
        newLabel="افزودن دسته"
      />
      <p className="text-text-secondary mt-2 text-sm">
        هر دسته یک صفحه عمومی جداگانه در{" "}
        <span dir="ltr" className="font-mono text-xs">
          /about-us/team/[slug]
        </span>{" "}
        دارد. اعضا را از بخش{" "}
        <Link href="/admin/team" className="text-pishnam-gold-600 underline">
          اعضای تیم
        </Link>{" "}
        به این دسته‌ها وصل کنید.
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={tags}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز دسته‌بندی ثبت نشده است."
          columns={[
            {
              header: "دسته",
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.nameFa}</p>
                  <p className="text-text-secondary text-xs" dir="ltr">
                    {row.slug}
                  </p>
                </div>
              ),
            },
            {
              header: "نام انگلیسی",
              cell: (row) => row.nameEn,
              className: "text-text-secondary",
            },
            {
              header: "اعضا",
              cell: (row) => row._count.members,
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
                    href={`/admin/team-tags/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.nameFa}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteTeamTag.bind(null, row.id)}
                    itemLabel={row.nameFa}
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
