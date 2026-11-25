import { z } from "zod";

const CATEGORIES = ["DATASHEETS", "BOOKS", "COMPONENT_LIBRARIES"] as const;
const SOURCES = ["HOSTED", "EXTERNAL"] as const;

const baseFields = {
  source: z.enum(SOURCES),
  cadTool: z.string().trim().max(60).optional().or(z.literal("")),
  titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
  titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
  descriptionFa: z.string().trim().max(500).optional().or(z.literal("")),
  descriptionEn: z.string().trim().max(500).optional().or(z.literal("")),
  fileUrl: z.string().trim().min(1, "فایل یا لینک الزامی است."),
  fileSizeBytes: z.coerce.number().int().optional(),
};

export const downloadResourceSchema = z
  .object({
    target: z.string().trim().min(1, "دسته‌بندی الزامی است."),
    ...baseFields,
  })
  .transform((data) => {
    if (data.target.startsWith("section:")) {
      return {
        ...data,
        category: null,
        sectionId: data.target.slice("section:".length),
      };
    }

    return {
      ...data,
      category: data.target as (typeof CATEGORIES)[number],
      sectionId: null,
    };
  })
  .pipe(
    z
      .object({
        target: z.string(),
        category: z.enum(CATEGORIES).nullable(),
        sectionId: z.string().nullable(),
        ...baseFields,
      })
      .refine((data) => data.source !== "EXTERNAL" || /^https?:\/\//.test(data.fileUrl), {
        message: "برای منبع خارجی، آدرس باید با http:// یا https:// شروع شود.",
        path: ["fileUrl"],
      }),
  );

export type DownloadResourceFormValues = z.infer<typeof downloadResourceSchema>;
