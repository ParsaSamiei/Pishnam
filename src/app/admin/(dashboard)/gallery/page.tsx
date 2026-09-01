import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card } from "@/components/ui/card";
import { deleteGalleryImage } from "./actions";

export default async function AdminGalleryPage() {
  const rows = await prisma.galleryImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const images = rows.map((image, index) => ({
    ...image,
    label: image.altFa ?? image.captionFa ?? `تصویر ${index + 1}`,
  }));

  return (
    <div>
      <AdminListHeader title="گالری تصاویر" newHref="/admin/gallery/new" newLabel="افزودن تصویر" />
      <p className="text-text-secondary mt-2 text-sm">
        تصاویر گالری عمومی سایت. در صفحه اصلی به‌صورت اسلایدشو و در صفحه گالری به‌صورت شبکه نمایش
        داده می‌شوند.
      </p>

      <Card className="mt-6 overflow-hidden p-0">
        <DataTable
          rows={images}
          getRowKey={(row) => row.id}
          emptyMessage="هنوز تصویری ثبت نشده است."
          columns={[
            {
              header: "تصویر",
              className: "w-28",
              cell: (row) => (
                <div className="border-border bg-bg-surface-alt relative h-14 w-20 overflow-hidden rounded-md border">
                  <Image src={row.image} alt="" fill className="object-cover" sizes="80px" />
                </div>
              ),
            },
            {
              header: "متن جایگزین",
              cell: (row) => row.altFa ?? <span className="text-text-secondary">—</span>,
            },
            {
              header: "توضیح",
              cell: (row) =>
                row.captionFa ? (
                  <span className="line-clamp-2 max-w-xs">{row.captionFa}</span>
                ) : (
                  <span className="text-text-secondary">—</span>
                ),
            },
            { header: "ترتیب", cell: (row) => row.order, className: "text-text-secondary" },
            {
              header: "",
              className: "w-24 text-end",
              cell: (row) => (
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/gallery/${row.id}/edit`}
                    className="text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                    aria-label={`ویرایش ${row.label}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                  <DeleteButton
                    onDelete={deleteGalleryImage.bind(null, row.id)}
                    itemLabel={row.label}
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
