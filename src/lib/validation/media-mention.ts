import { z } from "zod";

export const mediaMentionSchema = z.object({
  outletNameFa: z.string().trim().min(2, "نام رسانه (فارسی) الزامی است.").max(120),
  outletNameEn: z.string().trim().min(2, "Outlet name (English) is required.").max(120),
  headlineFa: z.string().trim().min(2, "عنوان خبر (فارسی) الزامی است.").max(300),
  headlineEn: z.string().trim().min(2, "Headline (English) is required.").max(300),
  url: z
    .string()
    .trim()
    .min(1, "لینک خبر الزامی است.")
    .refine((value) => /^https?:\/\//.test(value), {
      message: "لینک باید با http:// یا https:// شروع شود.",
    }),
  logo: z.string().trim().min(1, "لوگوی رسانه الزامی است."),
  publishedAt: z.string().trim().min(1, "تاریخ انتشار الزامی است."),
  order: z.coerce.number().int().min(0).max(9999),
  active: z.coerce.boolean(),
});

export type MediaMentionFormValues = z.infer<typeof mediaMentionSchema>;
