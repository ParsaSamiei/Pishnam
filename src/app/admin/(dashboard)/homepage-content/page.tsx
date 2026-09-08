import { getHomepageContentCopy } from "@/lib/homepage-content";
import { HomepageContentForm } from "@/components/admin/homepage-content-form";
import { updateHomepageContent } from "./actions";

export default async function AdminHomepageContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, copy] = await Promise.all([searchParams, getHomepageContentCopy()]);

  return (
    <div>
      <h1 className="text-text-primary text-2xl font-bold">متن صفحه اصلی</h1>
      <p className="text-text-secondary mt-2 max-w-3xl text-sm">
        متن‌های بازاریابی لندینگ: هیرو، کارت‌های مخاطب، عناوین بخش‌ها و بنر سایت‌های مرتبط.
        برچسب‌های رابط (کاروسل، دکمه‌های شناور و غیره) همچنان از فایل‌های ترجمه می‌آیند. برای عنوان
        هیرو، بخش طلایی را جدا بنویسید — قبل و بعد اختیاری است.
      </p>
      {saved === "1" ? (
        <p className="bg-pishnam-gold-500/15 text-pishnam-gold-600 mt-4 max-w-3xl rounded-md px-3 py-2 text-sm">
          متن صفحه اصلی ذخیره شد.
        </p>
      ) : null}
      <div className="mt-6">
        <HomepageContentForm action={updateHomepageContent} defaultValues={copy} />
      </div>
    </div>
  );
}
