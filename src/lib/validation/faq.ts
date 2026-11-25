import { z } from "zod";

export const faqSchema = z.object({
  category: z.string().trim().min(2, "دسته‌بندی الزامی است.").max(80),
  questionFa: z.string().trim().min(3, "سوال (فارسی) الزامی است.").max(300),
  questionEn: z.string().trim().min(3, "سوال (انگلیسی) الزامی است.").max(300),
  answerFa: z.string().trim().min(3, "پاسخ (فارسی) الزامی است.").max(2000),
  answerEn: z.string().trim().min(3, "پاسخ (انگلیسی) الزامی است.").max(2000),
  order: z.coerce.number().int().min(0).default(0),
});

export type FaqFormValues = z.infer<typeof faqSchema>;
