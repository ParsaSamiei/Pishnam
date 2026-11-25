import { z } from "zod";

export const jobPostingSchema = z.object({
  titleFa: z.string().trim().min(2, "عنوان (فارسی) الزامی است.").max(200),
  titleEn: z.string().trim().min(2, "عنوان (انگلیسی) الزامی است.").max(200),
  descriptionFa: z.string().trim().min(10, "توضیحات (فارسی) الزامی است.").max(4000),
  descriptionEn: z.string().trim().min(10, "توضیحات (انگلیسی) الزامی است.").max(4000),
  active: z.coerce.boolean(),
  expiresAt: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? new Date(value) : null)),
});

export type JobPostingFormValues = z.infer<typeof jobPostingSchema>;
