import { z } from "zod";

const SOURCES = ["HOSTED", "EXTERNAL"] as const;

export const competitionPosterSchema = z
  .object({
    categoryId: z.string().trim().min(1, "انتخاب دسته‌بندی الزامی است."),
    titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
    titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
    descriptionFa: z.string().trim().max(500).optional().or(z.literal("")),
    descriptionEn: z.string().trim().max(500).optional().or(z.literal("")),
    previewImage: z.string().trim().min(1, "تصویر پیش‌نمایش الزامی است."),
    source: z.enum(SOURCES),
    fileUrl: z.string().trim().min(1, "فایل یا لینک الزامی است."),
    fileSizeBytes: z.coerce.number().int().optional(),
    order: z.coerce.number().int().min(0).default(0),
    active: z.coerce.boolean(),
  })
  .refine((data) => data.source !== "EXTERNAL" || /^https?:\/\//.test(data.fileUrl), {
    message: "برای منبع خارجی، آدرس باید با http:// یا https:// شروع شود.",
    path: ["fileUrl"],
  });

export type CompetitionPosterFormValues = z.infer<typeof competitionPosterSchema>;
