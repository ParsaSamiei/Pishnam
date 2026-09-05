import { z } from "zod";
import { ACHIEVEMENT_SCOPES } from "@/lib/achievement-scope";

export const achievementSchema = z.object({
  titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
  titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
  competition: z.string().trim().min(2, "نام مسابقه الزامی است.").max(120),
  year: z.coerce
    .number()
    .int("سال باید عدد صحیح باشد.")
    .min(2000, "سال معتبر نیست.")
    .max(2100, "سال معتبر نیست."),
  result: z.string().trim().min(2, "نتیجه الزامی است.").max(200),
  photo: z.string().trim().min(1, "تصویر الزامی است."),
  scope: z.enum(ACHIEVEMENT_SCOPES, { message: "سطح مسابقه الزامی است." }),
  featured: z.coerce.boolean(),
});

export type AchievementFormValues = z.infer<typeof achievementSchema>;
