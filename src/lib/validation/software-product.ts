import { z } from "zod";

export const softwareProductSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "نامک الزامی است.")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد."),
  image: z.string().trim().min(1, "تصویر الزامی است."),
  titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
  titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
  descriptionFa: z.string().trim().max(1000).optional().or(z.literal("")),
  descriptionEn: z.string().trim().max(1000).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).default(0),
  active: z.coerce.boolean(),
});

export type SoftwareProductFormValues = z.infer<typeof softwareProductSchema>;
