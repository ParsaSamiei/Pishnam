import { z } from "zod";

export const articleSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "نامک الزامی است.")
    .max(150)
    .regex(/^[a-z0-9-]+$/, "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد."),
  coverImage: z.string().trim().min(1, "تصویر شاخص الزامی است."),
  tags: z
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

  titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
  excerptFa: z.string().trim().min(2, "چکیده فارسی الزامی است.").max(500),
  bodyFa: z.string().trim().min(1, "متن (فارسی) الزامی است."),

  titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
  excerptEn: z.string().trim().min(2, "چکیده انگلیسی الزامی است.").max(500),
  bodyEn: z.string().trim().min(1, "متن (انگلیسی) الزامی است."),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
