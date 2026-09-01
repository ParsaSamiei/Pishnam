import { z } from "zod";

const UPLOAD_PATH = /^\/uploads\/[A-Za-z0-9._-]+$/;
const MEDIA_TYPES = ["IMAGE", "VIDEO"] as const;

function optionalText(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null)
    .nullable()
    .default(null);
}

export const galleryImageSchema = z
  .object({
    mediaType: z.enum(MEDIA_TYPES).default("IMAGE"),
    image: z.string().trim().optional().or(z.literal("")),
    video: z.string().trim().optional().or(z.literal("")),
    altFa: optionalText(200, "متن جایگزین فارسی حداکثر ۲۰۰ نویسه است."),
    altEn: optionalText(200, "Alt text must be at most 200 characters."),
    captionFa: optionalText(300, "توضیح فارسی حداکثر ۳۰۰ نویسه است."),
    captionEn: optionalText(300, "Caption must be at most 300 characters."),
    order: z.coerce.number().int("ترتیب باید عدد صحیح باشد.").min(0, "ترتیب نمی‌تواند منفی باشد."),
  })
  .superRefine((data, ctx) => {
    if (data.mediaType === "IMAGE") {
      if (!data.image) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["image"],
          message: "تصویر الزامی است.",
        });
      } else if (!UPLOAD_PATH.test(data.image)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["image"],
          message: "تصویر باید از طریق همین فرم آپلود شود.",
        });
      }
    }

    if (data.mediaType === "VIDEO") {
      if (!data.video) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["video"],
          message: "فایل ویدیو الزامی است.",
        });
      } else if (!UPLOAD_PATH.test(data.video)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["video"],
          message: "ویدیو باید از طریق همین فرم آپلود شود.",
        });
      }

      if (data.image && !UPLOAD_PATH.test(data.image)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["image"],
          message: "تصویر بندانگشتی باید از طریق همین فرم آپلود شود.",
        });
      }
    }
  })
  .transform((data) => ({
    ...data,
    image: data.mediaType === "IMAGE" ? data.image || null : data.image?.trim() || null,
    video: data.mediaType === "VIDEO" ? data.video || null : null,
  }));

export type GalleryImageFormValues = z.infer<typeof galleryImageSchema>;
