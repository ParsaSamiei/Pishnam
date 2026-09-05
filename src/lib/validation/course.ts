import { z } from "zod";
import { TIERS } from "@/lib/tier-labels";
import { toAparatEmbedUrl } from "@/lib/aparat";

const VIDEO_SOURCES = ["none", "aparat", "hosted"] as const;
const DOCUMENT_SOURCES = ["HOSTED", "EXTERNAL"] as const;

/** One outcome per non-empty line. */
function linesToOutcomes(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);
}

const courseDocumentSchema = z
  .object({
    titleFa: z.string().trim().min(2, "عنوان سند فارسی الزامی است.").max(200),
    titleEn: z.string().trim().min(2, "عنوان سند انگلیسی الزامی است.").max(200),
    descriptionFa: z.string().trim().max(500).optional().or(z.literal("")),
    descriptionEn: z.string().trim().max(500).optional().or(z.literal("")),
    source: z.enum(DOCUMENT_SOURCES).default("HOSTED"),
    fileUrl: z.string().trim().min(1, "فایل یا لینک سند الزامی است."),
    fileSizeBytes: z.coerce.number().int().nonnegative().optional().nullable(),
    order: z.coerce.number().int().min(0).default(0),
    active: z.coerce.boolean().default(true),
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

export type CourseDocumentFormValues = z.infer<typeof courseDocumentSchema>;

function parseDocumentsJson(raw: unknown): unknown[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const courseSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(2, "نامک الزامی است.")
      .max(100)
      .regex(/^[a-z0-9-]+$/, "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد."),
    tier: z.enum(TIERS),
    topicTags: z
      .string()
      .trim()
      .optional()
      .transform((val) =>
        val
          ? val
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      ),
    coverImage: z.string().trim().min(1, "تصویر شاخص الزامی است."),
    videoSource: z.enum(VIDEO_SOURCES).default("none"),
    aparatUrl: z.string().trim().optional().or(z.literal("")),
    hostedVideo: z.string().trim().optional().or(z.literal("")),
    videoThumbnail: z.string().trim().optional().or(z.literal("")),
    order: z.coerce.number().int().min(0).default(0),
    active: z.coerce.boolean(),

    titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
    excerptFa: z.string().trim().min(2, "چکیده فارسی الزامی است.").max(500),
    bodyFa: z.string().trim().min(1, "متن دوره (فارسی) الزامی است."),
    prerequisitesFa: z.string().trim().max(500).optional().or(z.literal("")),
    pastResultsFa: z.string().trim().max(4000).optional().or(z.literal("")),
    learningOutcomesFa: z
      .string()
      .trim()
      .max(4000)
      .optional()
      .or(z.literal(""))
      .transform(linesToOutcomes),

    titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
    excerptEn: z.string().trim().min(2, "چکیده انگلیسی الزامی است.").max(500),
    bodyEn: z.string().trim().min(1, "متن دوره (انگلیسی) الزامی است."),
    prerequisitesEn: z.string().trim().max(500).optional().or(z.literal("")),
    pastResultsEn: z.string().trim().max(4000).optional().or(z.literal("")),
    learningOutcomesEn: z
      .string()
      .trim()
      .max(4000)
      .optional()
      .or(z.literal(""))
      .transform(linesToOutcomes),

    documentsJson: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.videoSource === "aparat") {
      const embedUrl = data.aparatUrl ? toAparatEmbedUrl(data.aparatUrl) : null;
      if (!embedUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["aparatUrl"],
          message: "کد یا لینک آپارات معتبر نیست.",
        });
      }
    }

    if (data.videoSource === "hosted" && !data.hostedVideo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hostedVideo"],
        message: "فایل ویدیو الزامی است.",
      });
    }

    const docs = parseDocumentsJson(data.documentsJson);
    if (docs.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentsJson"],
        message: "حداکثر ۲۰ سند برای هر دوره مجاز است.",
      });
      return;
    }

    for (let i = 0; i < docs.length; i++) {
      const result = courseDocumentSchema.safeParse(docs[i]);
      if (!result.success) {
        const first = result.error.issues[0];
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["documentsJson"],
          message: `سند ${i + 1}: ${first?.message ?? "معتبر نیست."}`,
        });
        break;
      }
    }
  })
  .transform((data) => {
    const aparatUrl =
      data.videoSource === "aparat" && data.aparatUrl
        ? (toAparatEmbedUrl(data.aparatUrl) ?? null)
        : null;
    const hostedVideo = data.videoSource === "hosted" ? data.hostedVideo || null : null;
    const videoThumbnail = data.videoSource === "none" ? null : data.videoThumbnail?.trim() || null;

    const documents = parseDocumentsJson(data.documentsJson)
      .map((doc) => courseDocumentSchema.parse(doc))
      .map((doc, index) => ({
        titleFa: doc.titleFa,
        titleEn: doc.titleEn,
        descriptionFa: doc.descriptionFa || null,
        descriptionEn: doc.descriptionEn || null,
        source: doc.source,
        fileUrl: doc.fileUrl,
        fileSizeBytes: doc.source === "HOSTED" ? (doc.fileSizeBytes ?? null) : null,
        order: doc.order ?? index,
        active: doc.active,
      }));

    return {
      ...data,
      aparatUrl,
      hostedVideo,
      videoThumbnail,
      documents,
    };
  });

export type CourseFormValues = z.infer<typeof courseSchema>;

export function outcomesToTextarea(outcomes: string[] | null | undefined): string {
  return (outcomes ?? []).join("\n");
}
