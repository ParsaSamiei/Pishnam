import { z } from "zod";
import { SOFTWARE_PLATFORMS, type SoftwarePlatformValue } from "@/lib/software-platforms";

const PLATFORMS = SOFTWARE_PLATFORMS.map((platform) => platform.value) as [
  SoftwarePlatformValue,
  ...SoftwarePlatformValue[],
];
const SOURCES = ["HOSTED", "EXTERNAL"] as const;

export const softwareReleaseSchema = z
  .object({
    productId: z.string().trim().min(1, "انتخاب نرم‌افزار الزامی است."),
    platform: z.enum(PLATFORMS),
    versionLabel: z.string().trim().min(1, "شماره نسخه الزامی است.").max(60),
    source: z.enum(SOURCES),
    fileUrl: z.string().trim().min(1, "فایل یا لینک الزامی است."),
    fileSizeBytes: z.coerce.number().int().optional(),
    notesFa: z.string().trim().max(500).optional().or(z.literal("")),
    notesEn: z.string().trim().max(500).optional().or(z.literal("")),
    order: z.coerce.number().int().min(0).default(0),
  })
  .refine((data) => data.source !== "EXTERNAL" || /^https?:\/\//.test(data.fileUrl), {
    message: "برای منبع خارجی، آدرس باید با http:// یا https:// شروع شود.",
    path: ["fileUrl"],
  });

export type SoftwareReleaseFormValues = z.infer<typeof softwareReleaseSchema>;
