import { z } from "zod";

export const teamTagSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "نامک الزامی است.")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد."),
  nameFa: z.string().trim().min(2, "نام فارسی الزامی است.").max(120),
  nameEn: z.string().trim().min(2, "نام انگلیسی الزامی است.").max(120),
  order: z.coerce.number().int().min(0).default(0),
  active: z.coerce.boolean(),
});

export type TeamTagFormValues = z.infer<typeof teamTagSchema>;
