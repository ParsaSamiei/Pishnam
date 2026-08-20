import { z } from "zod";
import { TIERS } from "@/lib/tier-labels";

export const videoEntrySchema = z.object({
  titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
  titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
  aparatUrl: z.string().trim().url("آدرس آپارات معتبر نیست."),
  thumbnail: z.string().trim().optional().or(z.literal("")),
  tierTags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (Array.isArray(val) ? val : val ? [val] : []))
    .pipe(z.enum(TIERS).array()),
  topicTags: z
    .string()
    .trim()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    ),
  publishedAt: z.string().trim().min(1, "تاریخ انتشار الزامی است."),
});

export type VideoEntryFormValues = z.infer<typeof videoEntrySchema>;
