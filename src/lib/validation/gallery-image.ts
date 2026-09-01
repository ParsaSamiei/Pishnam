import { z } from "zod";

const UPLOAD_PATH = /^\/uploads\/[A-Za-z0-9._-]+$/;

function optionalText(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null)
    .nullable()
    .default(null);
}

export const galleryImageSchema = z.object({
  image: z
    .string()
    .trim()
    .min(1, "تصویر الزامی است.")
    .regex(UPLOAD_PATH, "تصویر باید از طریق همین فرم آپلود شود."),
  altFa: optionalText(200, "متن جایگزین فارسی حداکثر ۲۰۰ نویسه است."),
  altEn: optionalText(200, "Alt text must be at most 200 characters."),
  captionFa: optionalText(300, "توضیح فارسی حداکثر ۳۰۰ نویسه است."),
  captionEn: optionalText(300, "Caption must be at most 300 characters."),
  order: z.coerce.number().int("ترتیب باید عدد صحیح باشد.").min(0, "ترتیب نمی‌تواند منفی باشد."),
});

export type GalleryImageFormValues = z.infer<typeof galleryImageSchema>;
