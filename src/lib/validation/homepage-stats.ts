import { z } from "zod";

const countField = (label: string) =>
  z.preprocess(
    (val) => {
      if (typeof val === "number") return val;
      if (typeof val !== "string") return val;
      const trimmed = val.trim();
      if (!trimmed) return Number.NaN;
      // Accept Persian digits from admin keyboards.
      const western = trimmed.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
      return Number(western);
    },
    z
      .number({
        required_error: `${label} الزامی است.`,
        invalid_type_error: `${label} باید عدد باشد.`,
      })
      .int(`${label} باید عدد صحیح باشد.`)
      .min(0, `${label} نمی‌تواند منفی باشد.`)
      .max(999_999, `${label} خیلی بزرگ است.`),
  );

const labelField = (label: string) =>
  z.string().trim().min(1, `${label} الزامی است.`).max(80, `${label} خیلی بلند است.`);

export const homepageStatsSchema = z.object({
  boysEnrolled: countField("تعداد آمار اول"),
  girlsEnrolled: countField("تعداد آمار دوم"),
  achievements: countField("تعداد آمار سوم"),
  boysLabelFa: labelField("برچسب آمار اول (فارسی)"),
  boysLabelEn: labelField("برچسب آمار اول (انگلیسی)"),
  girlsLabelFa: labelField("برچسب آمار دوم (فارسی)"),
  girlsLabelEn: labelField("برچسب آمار دوم (انگلیسی)"),
  achievementsLabelFa: labelField("برچسب آمار سوم (فارسی)"),
  achievementsLabelEn: labelField("برچسب آمار سوم (انگلیسی)"),
});

export type HomepageStatsFormValues = z.infer<typeof homepageStatsSchema>;

/** Defaults matching the previous next-intl `home.hero.stats.*` strings. */
export const DEFAULT_HOMEPAGE_STATS_LABELS = {
  boysLabelFa: "پسران ثبت‌نام‌شده",
  boysLabelEn: "Boys enrolled",
  girlsLabelFa: "دختران ثبت‌نام‌شده",
  girlsLabelEn: "Girls enrolled",
  achievementsLabelFa: "افتخارات",
  achievementsLabelEn: "Achievements",
} as const;
