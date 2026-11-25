import { z } from "zod";
import {
  BUILTIN_SECTION_TYPES,
  DOWNLOAD_SECTION_SLUGS,
  RESERVED_DOWNLOAD_SLUGS,
  slugForBuiltinSection,
} from "@/lib/download-sections";

const SECTION_TYPES = [...BUILTIN_SECTION_TYPES, "CUSTOM"] as const;

const ICON_KEYS = [
  "code-2",
  "trophy",
  "file-text",
  "book-open",
  "boxes",
  "download",
  "folder-open",
  "file-archive",
] as const;

const slugField = z
  .string()
  .trim()
  .min(2, "نامک الزامی است.")
  .max(100)
  .regex(/^[a-z0-9-]+$/, "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد.");

export const downloadSectionSchema = z
  .object({
    sectionType: z.enum(SECTION_TYPES, { message: "نوع بخش الزامی است." }),
    slug: slugField.optional().or(z.literal("")),
    titleFa: z.string().trim().min(2, "عنوان فارسی الزامی است.").max(200),
    titleEn: z.string().trim().min(2, "عنوان انگلیسی الزامی است.").max(200),
    iconKey: z.enum(ICON_KEYS, { message: "آیکون نامعتبر است." }),
    order: z.coerce.number().int("ترتیب باید عدد صحیح باشد.").min(0, "ترتیب نمی‌تواند منفی باشد."),
    active: z.coerce.boolean(),
  })
  .transform((data) => {
    const slug =
      data.sectionType === "CUSTOM"
        ? (data.slug?.trim() ?? "")
        : slugForBuiltinSection(data.sectionType);

    return { ...data, slug };
  })
  .superRefine((data, ctx) => {
    if (data.sectionType === "CUSTOM" && !data.slug) {
      ctx.addIssue({
        code: "custom",
        message: "نامک برای بخش سفارشی الزامی است.",
        path: ["slug"],
      });
    }

    if (data.sectionType === "CUSTOM" && RESERVED_DOWNLOAD_SLUGS.has(data.slug)) {
      ctx.addIssue({
        code: "custom",
        message: "این نامک برای بخش‌های از پیش‌تعریف‌شده رزرو شده است.",
        path: ["slug"],
      });
    }

    if (data.sectionType !== "CUSTOM" && data.slug !== DOWNLOAD_SECTION_SLUGS[data.sectionType]) {
      ctx.addIssue({
        code: "custom",
        message: "نامک بخش از پیش‌تعریف‌شده قابل تغییر نیست.",
        path: ["slug"],
      });
    }
  });

export type DownloadSectionFormValues = z.infer<typeof downloadSectionSchema>;
