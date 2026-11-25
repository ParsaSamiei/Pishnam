import { z } from "zod";

const optionalIntro = z
  .string()
  .trim()
  .max(500, "متن مقدمه خیلی طولانی است.")
  .optional()
  .or(z.literal(""));

const richBody = z
  .string()
  .trim()
  .max(100_000, "متن راهنما خیلی طولانی است.")
  .optional()
  .or(z.literal(""));

export const enrollmentGuidelinesSchema = z.object({
  active: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.undefined()])
    .transform((val) => val === "on" || val === "true"),
  titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(120),
  titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(120),
  introFa: optionalIntro,
  introEn: optionalIntro,
  bodyFa: richBody,
  bodyEn: richBody,
});

export type EnrollmentGuidelinesFormValues = z.infer<typeof enrollmentGuidelinesSchema>;
