import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
};

export const licenseSchema = z.object({
  titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
  titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
  issuerFa: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  issuerEn: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  year: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number()
      .int("سال باید عدد صحیح باشد.")
      .min(1300, "سال معتبر نیست.")
      .max(2100, "سال معتبر نیست.")
      .optional(),
  ),
  image: z.string().trim().min(1, "تصویر مجوز الزامی است."),
  descriptionFa: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
  descriptionEn: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
  order: z.coerce.number().int().min(0).max(9999),
  active: z.coerce.boolean(),
});

export type LicenseFormValues = z.infer<typeof licenseSchema>;
