import { z } from "zod";
import { toAparatEmbedUrl } from "@/lib/aparat";

const VIDEO_SOURCES = ["aparat", "hosted"] as const;

function parseJsonArray(raw: unknown): unknown[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const slugSchema = z
  .string()
  .trim()
  .min(2, "نامک الزامی است.")
  .max(100)
  .regex(/^[a-z0-9-]+$/, "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد.");

const productImageSchema = z.object({
  image: z.string().trim().min(1, "تصویر الزامی است."),
  captionFa: z.string().trim().max(300).optional().or(z.literal("")),
  captionEn: z.string().trim().max(300).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).default(0),
});

const productVideoSchema = z
  .object({
    titleFa: z.string().trim().min(2, "عنوان ویدیو فارسی الزامی است.").max(200),
    titleEn: z.string().trim().min(2, "عنوان ویدیو انگلیسی الزامی است.").max(200),
    source: z.enum(VIDEO_SOURCES),
    aparatUrl: z.string().trim().optional().or(z.literal("")),
    hostedVideo: z.string().trim().optional().or(z.literal("")),
    thumbnail: z.string().trim().optional().or(z.literal("")),
    order: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    if (data.source === "aparat") {
      const embedUrl = data.aparatUrl ? toAparatEmbedUrl(data.aparatUrl) : null;
      if (!embedUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["aparatUrl"],
          message: "کد یا لینک آپارات معتبر نیست.",
        });
      }
    }
    if (data.source === "hosted" && !data.hostedVideo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hostedVideo"],
        message: "فایل ویدیو الزامی است.",
      });
    }
  });

const productSpecSchema = z.object({
  keyFa: z.string().trim().min(1, "عنوان مشخصه فارسی الزامی است.").max(120),
  keyEn: z.string().trim().min(1, "عنوان مشخصه انگلیسی الزامی است.").max(120),
  valueFa: z.string().trim().min(1, "مقدار فارسی الزامی است.").max(300),
  valueEn: z.string().trim().min(1, "مقدار انگلیسی الزامی است.").max(300),
  order: z.coerce.number().int().min(0).default(0),
});

export const productSchema = z
  .object({
    slug: slugSchema,
    image: z.string().trim().min(1, "تصویر الزامی است."),
    titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
    titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
    excerptFa: z.string().trim().max(500).optional().or(z.literal("")),
    excerptEn: z.string().trim().max(500).optional().or(z.literal("")),
    bodyFa: z.string().trim().max(50_000).optional().or(z.literal("")),
    bodyEn: z.string().trim().max(50_000).optional().or(z.literal("")),
    price: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .transform((val, ctx) => {
        if (!val) return null;
        const digits = val
          .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
          .replace(/[^\d]/g, "");
        if (!digits) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "قیمت باید عدد باشد.",
          });
          return z.NEVER;
        }
        const amount = Number(digits);
        if (!Number.isSafeInteger(amount) || amount < 0 || amount > 2_000_000_000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "قیمت معتبر نیست.",
          });
          return z.NEVER;
        }
        return amount;
      }),
    currencyFa: z.string().trim().max(40).optional().or(z.literal("")),
    currencyEn: z.string().trim().max(40).optional().or(z.literal("")),
    courseId: z.string().trim().optional().or(z.literal("")),
    order: z.coerce.number().int().min(0).default(0),
    active: z.coerce.boolean(),
    tagIds: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => (Array.isArray(val) ? val : val ? [val] : []))
      .pipe(z.array(z.string().min(1)).min(1, "حداقل یک نوع محصول الزامی است.")),
    imagesJson: z.string().optional().or(z.literal("")),
    videosJson: z.string().optional().or(z.literal("")),
    specsJson: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const images = parseJsonArray(data.imagesJson);
    if (images.length > 24) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["imagesJson"],
        message: "حداکثر ۲۴ تصویر برای هر محصول مجاز است.",
      });
    } else {
      for (let i = 0; i < images.length; i++) {
        const result = productImageSchema.safeParse(images[i]);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["imagesJson"],
            message: `تصویر ${i + 1}: ${result.error.issues[0]?.message ?? "معتبر نیست."}`,
          });
          break;
        }
      }
    }

    const videos = parseJsonArray(data.videosJson);
    if (videos.length > 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["videosJson"],
        message: "حداکثر ۱۲ ویدیو برای هر محصول مجاز است.",
      });
    } else {
      for (let i = 0; i < videos.length; i++) {
        const result = productVideoSchema.safeParse(videos[i]);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["videosJson"],
            message: `ویدیو ${i + 1}: ${result.error.issues[0]?.message ?? "معتبر نیست."}`,
          });
          break;
        }
      }
    }

    const specs = parseJsonArray(data.specsJson);
    if (specs.length > 40) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specsJson"],
        message: "حداکثر ۴۰ ردیف مشخصات برای هر محصول مجاز است.",
      });
    } else {
      for (let i = 0; i < specs.length; i++) {
        const result = productSpecSchema.safeParse(specs[i]);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["specsJson"],
            message: `مشخصه ${i + 1}: ${result.error.issues[0]?.message ?? "معتبر نیست."}`,
          });
          break;
        }
      }
    }
  })
  .transform((data) => {
    const images = parseJsonArray(data.imagesJson)
      .map((img) => productImageSchema.parse(img))
      .map((img, index) => ({
        image: img.image,
        captionFa: img.captionFa || null,
        captionEn: img.captionEn || null,
        order: img.order ?? index,
        active: true,
      }));

    const videos = parseJsonArray(data.videosJson)
      .map((video) => productVideoSchema.parse(video))
      .map((video, index) => ({
        titleFa: video.titleFa,
        titleEn: video.titleEn,
        aparatUrl:
          video.source === "aparat" && video.aparatUrl
            ? (toAparatEmbedUrl(video.aparatUrl) ?? null)
            : null,
        hostedVideo: video.source === "hosted" ? video.hostedVideo || null : null,
        thumbnail: video.thumbnail?.trim() || null,
        order: video.order ?? index,
        active: true,
      }));

    const specs = parseJsonArray(data.specsJson)
      .map((spec) => productSpecSchema.parse(spec))
      .map((spec, index) => ({
        keyFa: spec.keyFa,
        keyEn: spec.keyEn,
        valueFa: spec.valueFa,
        valueEn: spec.valueEn,
        order: spec.order ?? index,
        active: true,
      }));

    return {
      slug: data.slug,
      image: data.image,
      titleFa: data.titleFa,
      titleEn: data.titleEn,
      excerptFa: data.excerptFa || null,
      excerptEn: data.excerptEn || null,
      bodyFa: data.bodyFa || null,
      bodyEn: data.bodyEn || null,
      price: data.price,
      currencyFa: data.currencyFa || null,
      currencyEn: data.currencyEn || null,
      courseId: data.courseId || null,
      order: data.order,
      active: data.active,
      tagIds: data.tagIds,
      images,
      videos,
      specs,
    };
  });

export type ProductFormValues = z.infer<typeof productSchema>;
