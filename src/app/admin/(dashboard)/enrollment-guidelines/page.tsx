import { getEnrollmentGuidelines } from "@/lib/enrollment-guidelines";
import { EnrollmentGuidelinesForm } from "@/components/admin/enrollment-guidelines-form";
import { updateEnrollmentGuidelines } from "./actions";

export default async function AdminEnrollmentGuidelinesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, guidelines] = await Promise.all([searchParams, getEnrollmentGuidelines()]);

  return (
    <div>
      <h1 className="text-text-primary text-2xl font-bold">راهنمای ثبت‌نام</h1>
      <p className="text-text-secondary mt-2 max-w-2xl text-sm">
        متنی که پیش از ارسال فرم ثبت‌نام دوره و درخواست جای خالی کلاس حضوری نمایش داده می‌شود. برای
        فهرست‌های طولانی از «فهرست شماره‌دار» در ویرایشگر استفاده کنید. اگر غیرفعال باشد یا متن خالی
        باشد، فرم‌ها مثل قبل مستقیماً نمایش داده می‌شوند.
      </p>
      {saved === "1" ? (
        <p className="bg-pishnam-gold-500/15 text-pishnam-gold-600 mt-4 max-w-2xl rounded-md px-3 py-2 text-sm">
          راهنمای ثبت‌نام ذخیره شد.
        </p>
      ) : null}
      <div className="mt-6">
        <EnrollmentGuidelinesForm
          key={guidelines ? new Date(guidelines.updatedAt).toISOString() : "empty"}
          action={updateEnrollmentGuidelines}
          defaultValues={
            guidelines
              ? {
                  active: guidelines.active,
                  titleFa: guidelines.titleFa,
                  titleEn: guidelines.titleEn,
                  introFa: guidelines.introFa,
                  introEn: guidelines.introEn,
                  bodyFa: guidelines.bodyFa,
                  bodyEn: guidelines.bodyEn,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
