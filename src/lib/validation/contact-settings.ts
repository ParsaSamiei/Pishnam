import { z } from "zod";
import { toGoogleMapsEmbedUrl } from "@/lib/google-maps";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val : null));

export const contactSettingsSchema = z.object({
  phones: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      const list = Array.isArray(val) ? val : val ? [val] : [];
      return list.map((s) => s.trim()).filter(Boolean);
    })
    .pipe(
      z
        .array(
          z.string().min(3, "شماره تلفن خیلی کوتاه است.").max(40, "شماره تلفن خیلی طولانی است."),
        )
        .max(10, "حداکثر ۱۰ شماره می‌توانید ثبت کنید."),
    ),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val : null))
    .pipe(z.string().email("ایمیل معتبر نیست.").nullable()),
  addressFa: optionalText(500),
  addressEn: optionalText(500),
  mapEmbedUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((val, ctx) => {
      if (!val) return null;
      const embedUrl = toGoogleMapsEmbedUrl(val);
      if (!embedUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "کد یا لینک نقشه گوگل معتبر نیست. از Share → Embed a map کد iframe را کپی کنید.",
        });
        return z.NEVER;
      }
      if (embedUrl.length > 4000) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "لینک نقشه خیلی طولانی است." });
        return z.NEVER;
      }
      return embedUrl;
    }),
});

export type ContactSettingsFormValues = z.infer<typeof contactSettingsSchema>;
