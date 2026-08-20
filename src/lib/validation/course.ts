import { z } from "zod";
import { TIERS } from "@/lib/tier-labels";

export const courseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "نامک الزامی است.")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد."),
  tier: z.enum(TIERS),
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
  coverImage: z.string().trim().min(1, "تصویر شاخص الزامی است."),
  order: z.coerce.number().int().min(0).default(0),
  active: z.coerce.boolean(),

  titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
  excerptFa: z.string().trim().min(2, "چکیده فارسی الزامی است.").max(500),
  bodyFa: z.string().trim().min(1, "متن دوره (فارسی) الزامی است."),
  prerequisitesFa: z.string().trim().max(500).optional().or(z.literal("")),

  titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
  excerptEn: z.string().trim().min(2, "چکیده انگلیسی الزامی است.").max(500),
  bodyEn: z.string().trim().min(1, "متن دوره (انگلیسی) الزامی است."),
  prerequisitesEn: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
