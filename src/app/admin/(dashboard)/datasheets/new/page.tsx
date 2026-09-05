import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DatasheetPartForm } from "@/components/admin/datasheet-part-form";
import { createDatasheetPart } from "../actions";

export default function NewDatasheetPartPage() {
  return (
    <div>
      <Link
        href="/admin/datasheets"
        className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        بازگشت به دیتاشیت و قطعات
      </Link>
      <h1 className="text-text-primary text-2xl font-bold">افزودن قطعه</h1>
      <p className="text-text-secondary mt-2 max-w-2xl text-sm">
        اگر این یک خانواده است (مثل LCD)، بعد از ذخیره می‌توانید زیرقطعه‌ها را اضافه کنید. اگر ماژول
        تکی است، همین‌جا متن، PDF، ویدیو، عکس و نمونه کد را وارد کنید.
      </p>
      <div className="mt-6">
        <DatasheetPartForm action={createDatasheetPart} submitLabel="ثبت" />
      </div>
    </div>
  );
}
