import { z } from "zod";
import { toAparatEmbedUrl } from "@/lib/aparat";
import { DATASHEET_LANGUAGES } from "@/lib/datasheet-languages";

const DOCUMENT_SOURCES = ["HOSTED", "EXTERNAL"] as const;
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

const datasheetDocumentSchema = z
  .object({
    titleFa: z.string().trim().min(2, "عنوان سند فارسی الزامی است.").max(200),
    titleEn: z.string().trim().min(2, "عنوان سند انگلیسی الزامی است.").max(200),
    descriptionFa: z.string().trim().max(500).optional().or(z.literal("")),
    descriptionEn: z.string().trim().max(500).optional().or(z.literal("")),
    source: z.enum(DOCUMENT_SOURCES).default("HOSTED"),
    fileUrl: z.string().trim().min(1, "فایل یا لینک سند الزامی است."),
    fileSizeBytes: z.coerce.number().int().nonnegative().optional().nullable(),
    order: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    if (data.source === "EXTERNAL" && !/^https?:\/\//.test(data.fileUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fileUrl"],
        message: "برای منبع خارجی، آدرس باید با http:// یا https:// شروع شود.",
      });
    }
  });

const datasheetVideoSchema = z
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

const datasheetImageSchema = z.object({
  image: z.string().trim().min(1, "تصویر الزامی است."),
  captionFa: z.string().trim().max(300).optional().or(z.literal("")),
  captionEn: z.string().trim().max(300).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).default(0),
});

const datasheetCodeSchema = z
  .object({
    titleFa: z.string().trim().min(2, "عنوان نمونه کد فارسی الزامی است.").max(200),
    titleEn: z.string().trim().min(2, "عنوان نمونه کد انگلیسی الزامی است.").max(200),
    language: z.enum(DATASHEET_LANGUAGES),
    code: z.string().max(40_000).optional().or(z.literal("")),
    notesFa: z.string().trim().max(1000).optional().or(z.literal("")),
    notesEn: z.string().trim().max(1000).optional().or(z.literal("")),
    source: z.enum(DOCUMENT_SOURCES).optional().or(z.literal("")),
    fileUrl: z.string().trim().optional().or(z.literal("")),
    fileSizeBytes: z.coerce.number().int().nonnegative().optional().nullable(),
    order: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    const hasCode = Boolean(data.code?.trim());
    const hasFile = Boolean(data.fileUrl?.trim());
    if (!hasCode && !hasFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["code"],
        message: "متن نمونه کد یا فایل دانلود آن الزامی است.",
      });
    }
    if (hasFile && data.source === "EXTERNAL" && !/^https?:\/\//.test(data.fileUrl ?? "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fileUrl"],
        message: "برای منبع خارجی، آدرس باید با http:// یا https:// شروع شود.",
      });
    }
  });

export const datasheetPartSchema = z
  .object({
    parentId: z.string().trim().optional().or(z.literal("")),
    slug: slugSchema,
    image: z.string().trim().min(1, "تصویر الزامی است."),
    titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
    titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
    excerptFa: z.string().trim().max(500).optional().or(z.literal("")),
    excerptEn: z.string().trim().max(500).optional().or(z.literal("")),
    bodyFa: z.string().trim().max(50_000).optional().or(z.literal("")),
    bodyEn: z.string().trim().max(50_000).optional().or(z.literal("")),
    order: z.coerce.number().int().min(0).default(0),
    active: z.coerce.boolean(),
    documentsJson: z.string().optional().or(z.literal("")),
    videosJson: z.string().optional().or(z.literal("")),
    imagesJson: z.string().optional().or(z.literal("")),
    codeJson: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const docs = parseJsonArray(data.documentsJson);
    if (docs.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentsJson"],
        message: "حداکثر ۲۰ سند برای هر قطعه مجاز است.",
      });
    } else {
      for (let i = 0; i < docs.length; i++) {
        const result = datasheetDocumentSchema.safeParse(docs[i]);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["documentsJson"],
            message: `سند ${i + 1}: ${result.error.issues[0]?.message ?? "معتبر نیست."}`,
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
        message: "حداکثر ۱۲ ویدیو برای هر قطعه مجاز است.",
      });
    } else {
      for (let i = 0; i < videos.length; i++) {
        const result = datasheetVideoSchema.safeParse(videos[i]);
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

    const images = parseJsonArray(data.imagesJson);
    if (images.length > 24) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["imagesJson"],
        message: "حداکثر ۲۴ تصویر برای هر قطعه مجاز است.",
      });
    } else {
      for (let i = 0; i < images.length; i++) {
        const result = datasheetImageSchema.safeParse(images[i]);
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

    const codes = parseJsonArray(data.codeJson);
    if (codes.length > 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["codeJson"],
        message: "حداکثر ۱۲ نمونه کد برای هر قطعه مجاز است.",
      });
    } else {
      for (let i = 0; i < codes.length; i++) {
        const result = datasheetCodeSchema.safeParse(codes[i]);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["codeJson"],
            message: `نمونه کد ${i + 1}: ${result.error.issues[0]?.message ?? "معتبر نیست."}`,
          });
          break;
        }
      }
    }
  })
  .transform((data) => {
    const documents = parseJsonArray(data.documentsJson)
      .map((doc) => datasheetDocumentSchema.parse(doc))
      .map((doc, index) => ({
        titleFa: doc.titleFa,
        titleEn: doc.titleEn,
        descriptionFa: doc.descriptionFa || null,
        descriptionEn: doc.descriptionEn || null,
        source: doc.source,
        fileUrl: doc.fileUrl,
        fileSizeBytes: doc.source === "HOSTED" ? (doc.fileSizeBytes ?? null) : null,
        order: doc.order ?? index,
        active: true,
      }));

    const videos = parseJsonArray(data.videosJson)
      .map((video) => datasheetVideoSchema.parse(video))
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

    const images = parseJsonArray(data.imagesJson)
      .map((img) => datasheetImageSchema.parse(img))
      .map((img, index) => ({
        image: img.image,
        captionFa: img.captionFa || null,
        captionEn: img.captionEn || null,
        order: img.order ?? index,
        active: true,
      }));

    const codeSamples = parseJsonArray(data.codeJson)
      .map((sample) => datasheetCodeSchema.parse(sample))
      .map((sample, index) => {
        const fileUrl = sample.fileUrl?.trim() || null;
        const source: "HOSTED" | "EXTERNAL" | null = !fileUrl
          ? null
          : sample.source === "EXTERNAL"
            ? "EXTERNAL"
            : "HOSTED";
        return {
          titleFa: sample.titleFa,
          titleEn: sample.titleEn,
          language: sample.language,
          code: sample.code?.trim() ?? "",
          notesFa: sample.notesFa || null,
          notesEn: sample.notesEn || null,
          source,
          fileUrl,
          fileSizeBytes: source === "HOSTED" ? (sample.fileSizeBytes ?? null) : null,
          order: sample.order ?? index,
          active: true,
        };
      });

    return {
      parentId: data.parentId || null,
      slug: data.slug,
      image: data.image,
      titleFa: data.titleFa,
      titleEn: data.titleEn,
      excerptFa: data.excerptFa || null,
      excerptEn: data.excerptEn || null,
      bodyFa: data.bodyFa || null,
      bodyEn: data.bodyEn || null,
      order: data.order,
      active: data.active,
      documents,
      videos,
      images,
      codeSamples,
    };
  });

export type DatasheetPartFormValues = z.infer<typeof datasheetPartSchema>;
