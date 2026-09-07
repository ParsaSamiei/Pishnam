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

export const homepageStatsSchema = z.object({
  boysEnrolled: countField("تعداد پسران"),
  girlsEnrolled: countField("تعداد دختران"),
  achievements: countField("تعداد افتخارات"),
});

export type HomepageStatsFormValues = z.infer<typeof homepageStatsSchema>;
