import { getHomepageStats } from "@/lib/homepage-stats";
import { HomepageStatsForm } from "@/components/admin/homepage-stats-form";
import { updateHomepageStats } from "./actions";

export default async function AdminHomepageStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, stats] = await Promise.all([searchParams, getHomepageStats()]);

  return (
    <div>
      <h1 className="text-text-primary text-2xl font-bold">آمار صفحه اصلی</h1>
      <p className="text-text-secondary mt-2 max-w-2xl text-sm">
        اعدادی که در هیرو صفحه اصلی با انیمیشن شمارش نمایش داده می‌شوند: پسران و دختران ثبت‌نام‌شده
        و تعداد افتخارات. این اعداد دستی هستند و از دیتابیس دوره‌ها یا افتخارات محاسبه نمی‌شوند. تا
        وقتی ذخیره نکرده باشید، بخش آمار در سایت نشان داده نمی‌شود.
      </p>
      {saved === "1" ? (
        <p className="bg-pishnam-gold-500/15 text-pishnam-gold-600 mt-4 max-w-2xl rounded-md px-3 py-2 text-sm">
          آمار صفحه اصلی ذخیره شد.
        </p>
      ) : null}
      <div className="mt-6">
        <HomepageStatsForm
          key={stats ? new Date(stats.updatedAt).toISOString() : "empty"}
          action={updateHomepageStats}
          defaultValues={
            stats
              ? {
                  boysEnrolled: stats.boysEnrolled,
                  girlsEnrolled: stats.girlsEnrolled,
                  achievements: stats.achievements,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
