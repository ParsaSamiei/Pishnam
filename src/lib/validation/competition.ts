import { z } from "zod";

export const competitionSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "نامک الزامی است.")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد."),
  titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
  titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
  year: z
    .union([z.literal(""), z.coerce.number().int().min(1990).max(2100)])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value)),
  order: z.coerce.number().int().min(0).default(0),
  active: z.coerce.boolean(),
});

export type CompetitionFormValues = z.infer<typeof competitionSchema>;
