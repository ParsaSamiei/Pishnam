import { z } from "zod";

const CATEGORIES = ["SOFTWARE", "DATASHEETS", "BOOKS", "POSTERS", "COMPONENT_LIBRARIES"] as const;
const SOURCES = ["HOSTED", "EXTERNAL"] as const;

export const downloadResourceSchema = z
  .object({
    category: z.enum(CATEGORIES),
    source: z.enum(SOURCES),
    cadTool: z.string().trim().max(60).optional().or(z.literal("")),
    titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
    titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
    descriptionFa: z.string().trim().max(500).optional().or(z.literal("")),
    descriptionEn: z.string().trim().max(500).optional().or(z.literal("")),
    fileUrl: z.string().trim().min(1, "فایل یا لینک الزامی است."),
    fileSizeBytes: z.coerce.number().int().optional(),
  })
  .refine((data) => data.source !== "EXTERNAL" || /^https?:\/\//.test(data.fileUrl), {
    message: "برای منبع خارجی، آدرس باید با http:// یا https:// شروع شود.",
    path: ["fileUrl"],
  });

export type DownloadResourceFormValues = z.infer<typeof downloadResourceSchema>;
