import { z } from "zod";
import { TIERS } from "@/lib/tier-labels";
import { toAparatEmbedUrl } from "@/lib/aparat";

const UPLOAD_PATH = /^\/uploads\/[A-Za-z0-9._-]+$/;
const VIDEO_SOURCES = ["aparat", "hosted"] as const;

export const videoEntrySchema = z
  .object({
    titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
    titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
    videoSource: z.enum(VIDEO_SOURCES).default("aparat"),
    aparatUrl: z.string().trim().optional().or(z.literal("")),
    hostedVideo: z.string().trim().optional().or(z.literal("")),
    thumbnail: z.string().trim().optional().or(z.literal("")),
    tierTags: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => (Array.isArray(val) ? val : val ? [val] : []))
      .pipe(z.enum(TIERS).array()),
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
    publishedAt: z.string().trim().min(1, "تاریخ انتشار الزامی است."),
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

    if (data.videoSource === "hosted") {
      if (!data.hostedVideo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hostedVideo"],
          message: "فایل ویدیو الزامی است.",
        });
      } else if (!UPLOAD_PATH.test(data.hostedVideo)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hostedVideo"],
          message: "ویدیو باید از طریق همین فرم آپلود شود.",
        });
      }
    }
  })
  .transform((data) => ({
    ...data,
    aparatUrl:
      data.videoSource === "aparat" && data.aparatUrl
        ? (toAparatEmbedUrl(data.aparatUrl) ?? null)
        : null,
    hostedVideo: data.videoSource === "hosted" ? data.hostedVideo || null : null,
    thumbnail: data.thumbnail?.trim() || null,
  }));

export type VideoEntryFormValues = z.infer<typeof videoEntrySchema>;
