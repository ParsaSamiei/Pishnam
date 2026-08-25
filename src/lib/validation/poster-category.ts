import { z } from "zod";

export const posterCategorySchema = z.object({
  leagueId: z.string().trim().min(1, "انتخاب لیگ الزامی است."),
  slug: z
    .string()
    .trim()
    .min(2, "نامک الزامی است.")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد."),
  titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
  titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
  order: z.coerce.number().int().min(0).default(0),
  active: z.coerce.boolean(),
});

export type PosterCategoryFormValues = z.infer<typeof posterCategorySchema>;
