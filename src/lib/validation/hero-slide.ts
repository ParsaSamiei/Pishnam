import { z } from "zod";

/**
 * Uploaded-image paths only -- exactly the shape `processUpload` hands back in
 * `relativePath` (src/lib/upload.ts). The value is interpolated straight into
 * `next/image`, and `next.config.ts` allows no `remotePatterns`, so an off-site
 * URL would fail at render time; rejecting it here also keeps a hand-crafted
 * POST from putting `javascript:` or a traversal path in the column.
 */
const UPLOAD_PATH = /^\/uploads\/[A-Za-z0-9._-]+$/;

/**
 * Blank alt text becomes `null` rather than `""`, so the hero's fallback chain
 * can treat "not written yet" as a single state instead of also having to test
 * for an empty string.
 */
function optionalAlt(message: string) {
  return z
    .string()
    .trim()
    .max(200, message)
    .transform((value) => value || null)
    .nullable()
    .default(null);
}

export const heroSlideSchema = z.object({
  image: z
    .string()
    .trim()
    .min(1, "تصویر الزامی است.")
    .regex(UPLOAD_PATH, "تصویر باید از طریق همین فرم آپلود شود."),
  altFa: optionalAlt("متن جایگزین فارسی حداکثر ۲۰۰ نویسه است."),
  altEn: optionalAlt("متن جایگزین انگلیسی حداکثر ۲۰۰ نویسه است."),
  order: z.coerce.number().int("ترتیب باید عدد صحیح باشد.").min(0, "ترتیب نمی‌تواند منفی باشد."),
});

export type HeroSlideFormValues = z.infer<typeof heroSlideSchema>;
